let path = require('path');
let fs = require('fs');

var arguments = process.argv.splice(2);
if (arguments.length == 0) {
    console.log("没有需要处理的预制件");
    return;
}

//根目录
let ROOT = "./assets/"
let logPath = "./assets/comment/data/customs/"

if (arguments[0] == "-h") {
    console.log(`
     -r, 导出整个文件夹Prefab： eg: node index.js.js -r daolv;
     -f, 过滤单个预制件，从args[1]开始，eg: node index.js -f daolv/coorkingctrl daolv/xxxx
     ROOT需要手动设置
     -zh,过滤 zh.js 文件: eg: node index.js -zh
    `)
}

let modul = arguments.splice(1);

if (arguments[0] == '-r') {
    let list = [];
    resoveDirFiles(ROOT + modul[0], ".prefab", list);
    for (let i = 0; i < list.length; i++) {
        prefabFilter(list[i]);
    }
}
if (arguments[0] == '-f') {
    for (let i = 0; i < modul.length; i++) {
        prefabFilter(ROOT + modul[i] + '.prefab');
    }
}


//遍历文件夹的文件
function resoveDirFiles(rootPath, endWith, files) {
    let paths = fs.readdirSync(rootPath, "utf8");
    for (let path of paths) {
        path = rootPath + '/' + path;
        //获取文件的相关信息
        let stat = fs.statSync(path);
        // console.log(stat)
        //递归
        if (stat.isDirectory()) {
            resoveDirFiles(path, endWith, files);
        }
        //如果没有结尾的各式限制 所有的文件路径 push到 将要处理的文件列表中
        else if (!endWith) {
            files.push(path);
        }
        //格式验证
        else if (confirmEnding(path, endWith)) {
            files.push(path);
        }
    }
}


function confirmEnding(str, target) {
    var start = str.length - target.length;
    var arr = str.substr(start, target.length);
    if (arr == target) {
        return true;
    }
    return false;
}

//重设 Transition类型
function prefabFilter(path) {
    let stream = fs.readFileSync(path, "utf8");
    let paths = path.split("/");
    let files = paths[paths.length - 1].split('.')[0]
    let json = JSON.parse(stream);
    let prefab = {
        name: files,
        //info[类型,角度,[x,y],[scalex,scaley],[anchx,anchy],[Sizex,size],'颜色',opacity]
        info: ["", 0, [0, 0], [0, 0], [0, 0], '', 0],
        items: [
        ],
        collider: [

        ]
    }
    for (let i = 0; i < json.length; i++) {
        let item = json[i];
        if (item.__type__ === "cc.Node") {
            let itemInfo = getNodeInfo(item);
            if (itemInfo[0]) {
                prefab.info = itemInfo[1];
            } else {
                if (itemInfo[1]) {
                    prefab.items.push(itemInfo[1])
                }
            }
        } else if (item.__type__ === "e1133Qz2WVPG4tqR8zNe+7e") {
            let comInfo = getComInfo(item);
            prefab.collider.push(comInfo)
        }
    }
    logOut(prefab, files, path)
}

function getComInfo(item) {
    console.log(item)
    let info = {
        nodeName: item.nodeName,
        target: item._target,
        type: item.CollisionType,
        isHumen: item._isHumen,
        rigid: item.InitialRigid,
        aniLoop: item.isLoop,
        aniName: item.aniName
    }
    return info
}

function getNodeInfo(item) {
    //info[类型,角度,[x,y],[scalex,scaley],[anchx,anchy],[Sizex,size],'颜色',opacity,group]
    //let type=0,1,2,3,4,5,6
    let itemInfo = ["", 0, [0, 0], [0, 0], [0, 0], '', 0];
    let name = item._name;
    let info = name.split("_");
    let type = info[0];
    let arr = item._trs.array;
    let isRoot = false;
    let isElement = false;
    if (type === "lineRiddle" || type === "lineSave" || type === "lineMeet") {
        isRoot = true
        isElement = true
    } if (type === "element") {
        isElement = true;
    }
    itemInfo[0] = name;
    let anchor = item._anchorPoint;
    let size = item._contentSize
    itemInfo[1] = item._eulerAngles.z;
    itemInfo[2] = [arr[0], arr[1]];
    itemInfo[3] = [arr[7], arr[8]];
    itemInfo[4] = [anchor.x, anchor.y];
    itemInfo[5] = [size.width, size.height];
    let color = item._color;
    let colorRGB = `(${color.r},${color.g},${color.b})`;
    let colorHex = colorRGBToHex(colorRGB);
    itemInfo[6] = "#" + colorHex;
    itemInfo[7] = item._opacity;
    itemInfo[8] = item["groupIndex"];
    return [isRoot, isElement ? itemInfo : null]
}


function colorRGBToHex(color) {
    var rgb = color.split(',');
    var r = parseInt(rgb[0].split('(')[1]);
    var g = parseInt(rgb[1]);
    var b = parseInt(rgb[2].split(')')[0]);
    var hex = ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toString();
    return hex;
}

function logOut(info, name, path) {
    let logString = JSON.stringify(info)
    fs.writeFileSync(logPath + name + ".json", logString, 'utf8')
    console.log("export prefab: " + path);
}

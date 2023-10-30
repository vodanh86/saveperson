// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class LinePhysicsCollider extends cc.PhysicsPolygonCollider {

    lineWidth: number = 10;

    getCenterPos(points: Array<cc.Vec2>, is_pos = true) {
        let p = points;
        let xNew = (p[0].x + p[3].x) / 2
        let yNew = (p[0].y + p[3].y) / 2
        return cc.v2(xNew, yNew)
    }

    _createShape() {
        let shapes = [];
        let polys = this.points;
        for (let i = 0; i < polys.length - 1; i++) {
            let posBegin = polys[i];
            let posEnd = polys[i + 1];
            let linelen = posBegin.sub(posEnd).mag();
            if (linelen < 2) { continue }
            let angle = Math.atan2(posEnd.y - posBegin.y, posEnd.x - posBegin.x) - Math.PI / 2;
            let midPos = posBegin.add(posEnd).mul(0.5);
            // @ts-ignore
            let shape = new b2.PolygonShape();
            if (shape) {
                // @ts-ignore
                shape.SetAsBox(this.lineWidth / 2 / 32, linelen / 2 / 32, new b2.Vec2(midPos.x / 32, midPos.y / 32), angle);
                let rect = shape["m_vertices"];
                let isInter = false;
                for (let j = 0; j < shapes.length; j++) {
                    let box = shapes[j]["m_vertices"];
                    let center = this.getCenterPos(rect);
                    let isContains = cc.Intersection.pointInPolygon(center, box)
                    if (isContains) {
                        isInter = true;
                        break;
                    }
                }
                if (!isInter) {
                    shapes.push(shape);
                }
            }
        }
        return shapes;
    }
}

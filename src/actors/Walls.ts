import * as ex from "excalibur";

export class Wall extends ex.Actor {
    moving = false;
    constructor(pos: ex.Vector, rotation: number = 0, height: number = 540, width: number = 10) {
        super({
            pos,
            height,
            width,
            rotation: rotation * Math.PI / 2,
            anchor: ex.vec(0, 0),
            color: ex.Color.fromHex('#bd9853'),
            z: 1, // position the wall above everything
            collisionType: ex.CollisionType.Fixed
        })
    }
}
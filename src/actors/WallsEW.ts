import * as ex from "excalibur";

export class WallEW extends ex.Actor {
    moving = false;
    constructor(pos: ex.Vector) {
        super({
            pos,
            anchor: ex.vec(0, 0),
            height: 540,
            width: 10,
            color: ex.Color.fromHex('#bd9853'),
            z: 1, // position the wall above everything
            collisionType: ex.CollisionType.Fixed
        })
    }
}
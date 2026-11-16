import { Actor, CollisionType, Sprite, Vector } from "excalibur";
import { Z }  from "../config/RoomConfig";

export class Door extends Actor {
    private closedSprite: Sprite;
    
    constructor(center: Vector, size:Vector, closed:Sprite){ 
        super ({
        pos: center,
        width: size.x,
        height: size.y,
        collisionType: CollisionType.Fixed,
        z: Z.overlay
    });
    this.closedSprite = closed;
    this.graphics.use(closed);
}

    open(): void {
        this.body.collisionType = CollisionType.Passive,
        this.graphics.hide()
    }

    close(): void {
        this.body.collisionType = CollisionType.Fixed
        this.graphics.use(this.closedSprite);
        this.graphics.isVisible = true;
    }
}
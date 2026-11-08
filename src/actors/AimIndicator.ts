import { Actor, vec, Polygon, Color, CollisionType } from "excalibur";

export class AimIndicator extends Actor {
  constructor() {
    super({
      name: "AimIndicator",
      pos: vec(0, 0),
      collisionType: CollisionType.PreventCollision
    });

    const arrow = new Polygon({
      points: [
        vec(0, -20),   
        vec(-7, -8),   
        vec(-3, -8),
        vec(-3, 10),   
        vec(3, 10),    
        vec(3, -8),
        vec(7, -8)     
      ],
      color: Color.Yellow
    });

    this.graphics.add(arrow);
  }
}
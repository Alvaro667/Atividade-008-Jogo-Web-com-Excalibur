import {
  Actor,
  vec,
  Polygon,
  Color,
  CollisionType
} from "excalibur";

export class AimIndicator extends Actor {
  constructor() {
    super({
      name: "AimIndicator",
      pos: vec(0, 0),
      collisionType: CollisionType.PreventCollision
    });

    const arrow = new Polygon({
      points: [
        vec(0, -30),
        vec(-7, -18),
        vec(-3, -18),
        vec(-3, 0),
        vec(3, 0),
        vec(3, -18),
        vec(7, -18)
      ],
      color: Color.Yellow
    });

    this.graphics.add(arrow);

    // A origem gráfica fica na base da seta.
    this.graphics.anchor = vec(0.5, 1);
  }
}
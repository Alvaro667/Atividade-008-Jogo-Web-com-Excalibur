import {
  Actor,
  Circle,
  Color,
  CollisionType,
  GraphicsGroup,
  vec
} from "excalibur";

export class AmmoIndicator extends Actor {
  private orbs = [
    new Circle({ radius: 5, color: Color.Yellow }),
    new Circle({ radius: 5, color: Color.Yellow }),
    new Circle({ radius: 5, color: Color.Yellow })
  ];

  constructor() {
    super({
      name: "AmmoIndicator",
      collisionType: CollisionType.PreventCollision
    });

    this.graphics.use(
      new GraphicsGroup({
        members: [
          { graphic: this.orbs[0], offset: vec(0, -26) },
          { graphic: this.orbs[1], offset: vec(22, 13) },
          { graphic: this.orbs[2], offset: vec(-22, 13) }
        ]
      })
    );

    // Alinha a origem gráfica ao centro geométrico das esferas.
    this.graphics.anchor = vec(0.5, 31 / 49);

    this.updateAmmo(3);
  }

  updateAmmo(currentAmmo: number): void {
    this.orbs.forEach((orb, index) => {
      orb.opacity = index < currentAmmo ? 1 : 0;
    });
  }
}
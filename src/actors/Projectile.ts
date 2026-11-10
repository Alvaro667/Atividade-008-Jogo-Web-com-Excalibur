import {
  Actor,
  Vector,
  Color,
  CollisionType,
  //,Engine
} from "excalibur";
import { Zombie } from "./Zombie";

export class Projectile extends Actor {
  private direction: Vector;
  private speed = 500;
  private damage = 1;
  private onEnemyKilled: () => void;

  constructor(position: Vector, direction: Vector, onEnemyKilled: () => void) {
    super({
      name: "Projectile",
      pos: position,
      width: 8,
      height: 8,
      color: Color.Yellow,
      collisionType: CollisionType.Passive,
    });

    this.direction = direction.normalize();
    this.onEnemyKilled = onEnemyKilled;

    this.on("collisionstart", (event) => {
      const target = event.other.owner;

      if (target.name === "Player") {
        return;
      }

      if (target instanceof Zombie) {
        if (target.health <= 0) {
          return;
        }

        const wasKilled = target.takeDamage(this.damage);

        if (wasKilled) {
          this.onEnemyKilled();
        }
      }

      this.kill();
    });
  }

  override onPreUpdate(): void {
    this.vel = this.direction.scale(this.speed);
  }
}

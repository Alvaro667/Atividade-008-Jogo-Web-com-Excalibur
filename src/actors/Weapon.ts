import { Engine, Vector } from "excalibur";
import { Projectile } from "./Projectile";
import { AmmoSystem } from "./AmmoSystem";

export class Weapon {
  private ammoSystem = new AmmoSystem();

  get currentAmmo(): number {
    return this.ammoSystem.currentAmmo;
  }

  shoot(engine: Engine, position: Vector, direction: Vector): void {
    const wasLastAmmo = this.ammoSystem.consumeAmmo();

    if (wasLastAmmo === null) return;

    const projectile = new Projectile(position, direction, () =>  this.ammoSystem.recoverOnKill(wasLastAmmo),
    );

    engine.add(projectile);
  }

  update(elapsedMs: number, isCharging: boolean): void {
    this.ammoSystem.update(elapsedMs, isCharging);
  }
}

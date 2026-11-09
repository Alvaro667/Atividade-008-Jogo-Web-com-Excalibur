import {
  DefaultLoader,
  Engine,
  ExcaliburGraphicsContext,
  Scene,
  SceneActivationContext
} from "excalibur";

import { Player } from "../actors/Player";
import { AimIndicator } from "../actors/AimIndicator";
import { AmmoIndicator } from "../actors/AmmoIndicator";
import { Zombie } from "../actors/Zombie";

export class GameScene extends Scene {

  override onInitialize(engine: Engine): void {
    const aimIndicator = new AimIndicator();
    const ammoIndicator = new AmmoIndicator();

    const player = new Player(aimIndicator, ammoIndicator);

    const zombie = new Zombie(player);

    this.add(player);
    this.add(zombie);
    this.add(aimIndicator);
    this.add(ammoIndicator);
  }

  override onPreLoad(loader: DefaultLoader): void {
    // Add any scene specific resources to load
  }

  override onActivate(context: SceneActivationContext<unknown>): void {
    // Called when Excalibur transitions to this scene
  }

  override onDeactivate(context: SceneActivationContext): void {
    // Called when Excalibur transitions away from this scene
  }

  override onPreUpdate(engine: Engine, elapsedMs: number): void {
    // Called before anything updates in the scene
  }

  override onPostUpdate(engine: Engine, elapsedMs: number): void {
    // Called after everything updates in the scene
  }

  override onPreDraw(ctx: ExcaliburGraphicsContext, elapsedMs: number): void {
    // Called before Excalibur draws to the screen
  }

  override onPostDraw(ctx: ExcaliburGraphicsContext, elapsedMs: number): void {
    // Called after Excalibur draws to the screen
  }
}

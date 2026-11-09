
import {
  Animation,
  AnimationStrategy,
  SpriteSheet
} from "excalibur";

import { Resources } from "../resources/resources";

export type ZombieDirection =
  | "down"
  | "right"
  | "up"
  | "left";

export type ZombieAnimationState =
  | "idle"
  | "run"
  | "hurt"
  | "death";

export function createZombieAnimations(): Record<string, Animation> {
  const createSheet = (
    image: typeof Resources.ZombieIdle,
    columns: number
  ) => SpriteSheet.fromImageSource({
    image,
    grid: {
      rows: 4,
      columns,
      spriteWidth: 32,
      spriteHeight: 32
    }
  });

  const idleSheet = createSheet(Resources.ZombieIdle, 8);
  const runSheet = createSheet(Resources.ZombieRun, 8);
  const hurtSheet = createSheet(Resources.ZombieHurt, 2);
  const deathSheet = createSheet(Resources.ZombieDeath, 8);

  const directions: ZombieDirection[] = [
    "down",
    "right",
    "up",
    "left"
  ];

  const animations: Record<string, Animation> = {};

  directions.forEach((direction, row) => {
    const frames8 = Array.from(
      { length: 8 },
      (_, index) => row * 8 + index
    );

    const frames2 = Array.from(
      { length: 2 },
      (_, index) => row * 2 + index
    );

    animations[`idle-${direction}`] =
      Animation.fromSpriteSheet(
        idleSheet,
        frames8,
        150,
        AnimationStrategy.Loop
      );

    animations[`run-${direction}`] =
      Animation.fromSpriteSheet(
        runSheet,
        frames8,
        100,
        AnimationStrategy.Loop
      );

    animations[`hurt-${direction}`] =
      Animation.fromSpriteSheet(
        hurtSheet,
        frames2,
        120,
        AnimationStrategy.Freeze
      );

    animations[`death-${direction}`] =
      Animation.fromSpriteSheet(
        deathSheet,
        frames8,
        100,
        AnimationStrategy.Freeze
      );
  });

  return animations;
}

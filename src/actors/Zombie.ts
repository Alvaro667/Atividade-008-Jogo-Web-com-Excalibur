import { Actor, Animation, Shape, vec, Engine, CollisionType } from "excalibur";

import { Player } from "./Player";
import { ZOMBIE_CONFIG } from "../config/ZombieConfig";

import {
  createZombieAnimations,
  ZombieDirection,
  ZombieAnimationState,
} from "../animations/ZombieAnimations";

type ZombieState = "idle" | "chasing" | "attacking" | "cooldown";

export class Zombie extends Actor {
  health = ZOMBIE_CONFIG.maxHealth;

  private player: Player;

  private state: ZombieState = "idle";
  private stateTimer = 0;

  private facing: ZombieDirection = "down";
  private currentAnimation = "";

  private animations: Record<string, Animation> = {};

  private isHurt = false;
  private isDying = false;

  constructor(player: Player) {
    super({
      name: "Zombie",
      pos: vec(500, 300),
      width: ZOMBIE_CONFIG.width,
      height: ZOMBIE_CONFIG.height,
      collisionType: CollisionType.Active,
    });

    this.collider.set(Shape.Circle(6));

    this.player = player;

    this.addTag("enemy");

    this.setupAnimations();

    this.scale = vec(2, 2);
    
  }

  private setupAnimations(): void {
    this.animations = createZombieAnimations();

    Object.entries(this.animations).forEach(([name, animation]) => {
      this.graphics.add(name, animation);

      if (name.startsWith("hurt-")) {
        animation.events.on("end", () => {
          if (!this.isDying && this.currentAnimation === name) {
            this.isHurt = false;
            this.updateAnimation();
          }
        });
      }

      if (name.startsWith("death-")) {
        animation.events.on("end", () => {
          if (this.isDying && this.currentAnimation === name) {
            this.kill();
          }
        });
      }
    });

    this.playAnimation("idle");
  }

  override onPreUpdate(engine: Engine, elapsedMs: number): void {
    if (this.isDying || this.isHurt) {
      this.vel = vec(0, 0);
      return;
    }

    const direction = this.player.pos.sub(this.pos);
    const distance = direction.magnitude;

    switch (this.state) {
      case "idle":
        this.vel = vec(0, 0);

        if (distance <= ZOMBIE_CONFIG.detectionRange) {
          this.state = "chasing";
        }

        break;

      case "chasing":
        if (distance > ZOMBIE_CONFIG.detectionRange) {
          this.state = "idle";
          this.vel = vec(0, 0);
          break;
        }

        if (distance <= ZOMBIE_CONFIG.attackRange) {
          this.state = "attacking";
          this.stateTimer = 0;
          this.vel = vec(0, 0);
          break;
        }

        this.moveTowardPlayer(direction);
        break;

      case "attacking":
        this.vel = vec(0, 0);
        this.stateTimer += elapsedMs;

        if (this.stateTimer >= ZOMBIE_CONFIG.attackWindup) {
          const currentDistance = this.player.pos.sub(this.pos).magnitude;

          if (currentDistance <= ZOMBIE_CONFIG.attackRange) {
            this.player.takeDamage(ZOMBIE_CONFIG.damage);
          }

          this.state = "cooldown";
          this.stateTimer = 0;
        }

        break;

      case "cooldown":
        this.stateTimer += elapsedMs;

        if (distance > ZOMBIE_CONFIG.attackRange) {
          this.moveTowardPlayer(direction);
        } else {
          this.vel = vec(0, 0);
        }

        if (this.stateTimer >= ZOMBIE_CONFIG.attackCooldown) {
          this.stateTimer = 0;

          this.state =
            distance <= ZOMBIE_CONFIG.detectionRange ? "chasing" : "idle";
        }

        break;
    }

    this.updateAnimation();
  }

  private moveTowardPlayer(direction: ReturnType<typeof vec>): void {
    if (direction.magnitude === 0) {
      this.vel = vec(0, 0);
      return;
    }

    this.vel = direction.normalize().scale(ZOMBIE_CONFIG.speed);
  }

  private updateFacing(): void {
    if (this.vel.magnitude === 0) {
      return;
    }

    if (Math.abs(this.vel.x) > Math.abs(this.vel.y)) {
      this.facing = this.vel.x > 0 ? "right" : "left";
    } else {
      this.facing = this.vel.y > 0 ? "down" : "up";
    }
  }

  private playAnimation(state: ZombieAnimationState): void {
    const name = `${state}-${this.facing}`;

    if (this.currentAnimation === name) {
      return;
    }

    this.graphics.use(name);
    this.currentAnimation = name;
  }

  private playOneShot(state: "hurt" | "death"): void {
    const name = `${state}-${this.facing}`;
    const animation = this.animations[name];

    animation.reset();

    this.graphics.use(name);
    this.currentAnimation = name;
  }

  private updateAnimation(): void {
    if (this.isDying || this.isHurt) {
      return;
    }

    this.updateFacing();

    const isMoving = this.vel.magnitude > 0;

    this.playAnimation(isMoving ? "run" : "idle");
  }

  takeDamage(amount: number): boolean {
    if (this.isDying || this.health <= 0 || amount <= 0) {
      return false;
    }

    this.health = Math.max(0, this.health - amount);

    console.log(`Vida do zumbi: ${this.health}`);

    if (this.health === 0) {
      this.die();
      return true;
    }

    this.isHurt = true;
    this.vel = vec(0, 0);

    if (this.state === "attacking") {
      this.state = "chasing";
      this.stateTimer = 0;
    }

    this.playOneShot("hurt");

    return false;
  }

  private die(): void {
    if (this.isDying) {
      return;
    }

    this.isDying = true;
    this.isHurt = false;

    this.vel = vec(0, 0);

    console.log("Zumbi morreu!");

    this.playOneShot("death");
  }
}

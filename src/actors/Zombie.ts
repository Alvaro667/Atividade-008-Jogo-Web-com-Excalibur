import {
  Actor,
  Animation,
  Shape,
  vec,
  Engine,
  CollisionType,
  Vector,
} from "excalibur";

import { Player } from "./Player";
import { ZOMBIE_CONFIG } from "../config/ZombieConfig";
import { Pathfinding } from "../systems/Pathfinding";

import {
  createZombieAnimations,
  ZombieDirection,
  ZombieAnimationState,
} from "../animations/ZombieAnimations";

type ZombieState = "idle" | "chasing" | "attacking" | "cooldown";

export class Zombie extends Actor {
  health = ZOMBIE_CONFIG.maxHealth;

  private player: Player;
  private isTouchingPlayer = false;
  private pathfinding: Pathfinding;

  private movementSpeed: number;
  private attackDamage: number;

  private state: ZombieState = "idle";
  private stateTimer = 0;

  private facing: ZombieDirection = "down";
  private currentAnimation = "";

  private animations: Record<string, Animation> = {};

  private isHurt = false;
  private isDying = false;

  private path: Vector[] = [];
  private pathIndex = 0;
  private pathTimer = 0;
  private readonly navigationRadius = 16;
  private readonly pathUpdateInterval = 350;
  private readonly waypointThreshold = 5;
  private readonly stuckCheckInterval = 450;
  private readonly minimumProgress = 3;

  private stuckTimer = 0;
  private lastCheckedPosition: Vector | null = null;

  private blockedWaypoint: string | null = null;
  private blockedWaypointTimer = 0;

  private lastTargetCell = "";

  constructor(
    player: Player,
    position: Vector,
    pathfinding: Pathfinding,
    speed = ZOMBIE_CONFIG.speed,
    damage = ZOMBIE_CONFIG.damage,
  ) {
    super({
      name: "Zombie",
      pos: position,
      width: ZOMBIE_CONFIG.width,
      height: ZOMBIE_CONFIG.height,
      collisionType: CollisionType.Active,
    });

    this.player = player;

    this.on("collisionstart", (event) => {
      if (event.other.owner === this.player && !this.isDying) {
        this.isTouchingPlayer = true;
      }
    });

    this.on("collisionend", (event) => {
      if (event.other.owner === this.player) {
        this.isTouchingPlayer = false;
      }
    });

    this.pathfinding = pathfinding;

    this.movementSpeed = speed;
    this.attackDamage = damage;

    this.collider.set(Shape.Circle(8));
    this.scale = vec(2, 2);

    this.addTag("enemy");

    this.setupAnimations();
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

    const canAttack = this.isTouchingPlayer;

    switch (this.state) {
      case "idle":
        this.vel = vec(0, 0);

        if (distance <= ZOMBIE_CONFIG.detectionRange) {
          this.state = "chasing";
          this.pathTimer = this.pathUpdateInterval;
        }

        break;

      case "chasing":
        if (distance > ZOMBIE_CONFIG.detectionRange) {
          this.state = "idle";
          this.vel = vec(0, 0);
          this.clearPath();
          break;
        }

        if (canAttack) {
          this.state = "attacking";
          this.stateTimer = 0;
          this.vel = vec(0, 0);
          this.faceDirection(direction);
          this.clearPath();
          break;
        }

        this.followPath(elapsedMs);
        break;

      case "attacking":
        this.vel = vec(0, 0);
        this.stateTimer += elapsedMs;

        if (this.stateTimer >= ZOMBIE_CONFIG.attackWindup) {
          if (this.isTouchingPlayer) {
            this.player.takeDamage(this.attackDamage);
          }

          this.state = "cooldown";
          this.stateTimer = 0;
        }

        break;

      case "cooldown":
        this.stateTimer += elapsedMs;

        if (!canAttack) {
          this.followPath(elapsedMs);
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

  private followPath(elapsedMs: number): void {
    this.pathTimer += elapsedMs;

    if (this.blockedWaypointTimer > 0) {
      this.blockedWaypointTimer -= elapsedMs;

      if (this.blockedWaypointTimer <= 0) {
        this.blockedWaypoint = null;
      }
    }

    const playerCellX = Math.floor(this.player.pos.x / 16);

    const playerCellY = Math.floor(this.player.pos.y / 16);

    const targetCell = `${playerCellX},${playerCellY}`;

    const needsNewPath =
      this.pathTimer >= this.pathUpdateInterval ||
      targetCell !== this.lastTargetCell;

    if (needsNewPath) {
      let newPath = this.pathfinding.findPath(
        this.pos,
        this.player.pos,
        this.navigationRadius,
        this.blockedWaypoint,
      );

      if (newPath.length === 0 && this.blockedWaypoint) {
        newPath = this.pathfinding.findPath(
          this.pos,
          this.player.pos,
          this.navigationRadius,
        );
      }

      this.path = newPath;
      this.pathIndex = 0;
      this.pathTimer = 0;
      this.lastTargetCell = targetCell;
    }

    while (this.pathIndex < this.path.length) {
      const waypoint = this.path[this.pathIndex];
      const difference = waypoint.sub(this.pos);
      const distance = difference.magnitude;

      if (distance <= 4) {
        this.pathIndex++;
        continue;
      }

      const deltaSeconds = Math.max(elapsedMs / 1000, 0.001);

      const speed = Math.min(this.movementSpeed, distance / deltaSeconds);

      this.vel = difference.normalize().scale(speed);

      this.checkIfStuck(elapsedMs);
      return;
    }

    this.vel = vec(0, 0);
    this.checkIfStuck(elapsedMs);
  }

  private clearPath(): void {
    this.path = [];
    this.pathIndex = 0;
    this.pathTimer = this.pathUpdateInterval;
    this.lastTargetCell = "";

    this.stuckTimer = 0;
    this.lastCheckedPosition = null;

    this.blockedWaypoint = null;
    this.blockedWaypointTimer = 0;
  }

  private faceDirection(direction: Vector): void {
    if (direction.magnitude === 0) {
      return;
    }

    if (Math.abs(direction.x) > Math.abs(direction.y)) {
      this.facing = direction.x > 0 ? "right" : "left";
    } else {
      this.facing = direction.y > 0 ? "down" : "up";
    }
  }

  private updateFacing(): void {
    this.faceDirection(this.vel);
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

    if (this.state !== "attacking") {
      this.updateFacing();
    }

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
    this.clearPath();

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
    this.isTouchingPlayer = false;

    this.vel = vec(0, 0);
    this.clearPath();

    this.body.collisionType = CollisionType.PreventCollision;

    console.log("Zumbi morreu!");

    this.playOneShot("death");
  }

  private checkIfStuck(elapsedMs: number): void {
    if (this.vel.magnitude === 0) {
      this.stuckTimer = 0;
      this.lastCheckedPosition = null;
      return;
    }

    this.stuckTimer += elapsedMs;

    if (!this.lastCheckedPosition) {
      this.lastCheckedPosition = this.pos.clone();
      return;
    }

    if (this.stuckTimer < this.stuckCheckInterval) {
      return;
    }

    const progress = this.pos.sub(this.lastCheckedPosition).magnitude;

    if (progress < this.minimumProgress) {
      console.warn("Zumbi preso! Recalculando rota.");

      const waypoint = this.path[this.pathIndex];

      if (waypoint) {
        const x = Math.floor(waypoint.x / 16);
        const y = Math.floor(waypoint.y / 16);

        this.blockedWaypoint = `${x},${y}`;
        this.blockedWaypointTimer = 1200;
      }

      this.path = [];
      this.pathIndex = 0;
      this.pathTimer = this.pathUpdateInterval;
      this.lastTargetCell = "";
    }

    this.stuckTimer = 0;
    this.lastCheckedPosition = this.pos.clone();
  }
}

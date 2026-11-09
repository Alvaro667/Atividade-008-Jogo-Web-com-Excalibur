import {
  Actor,
  vec,
  Shape,
  CollisionType,
  Engine,
  Keys,
  PointerButton,
  PointerEvent,
  Rectangle,
  Vector,
  Color
} from "excalibur";

import { PLAYER_CONFIG } from "../config/PlayerConfig";
import { AimIndicator } from "./AimIndicator";
import { AmmoIndicator } from "./AmmoIndicator";
import { Weapon } from "./Weapon";

export class Player extends Actor {
  health = PLAYER_CONFIG.maxHealth;

  private isCharging = false;
  private aimIndicator: AimIndicator;
  private weapon = new Weapon();
  private ammoIndicator: AmmoIndicator;
  private isDodging = false;
  private dodgeDirection = vec(0, 0);
  private dodgeTimer = 0;
  private dodgeCooldownTimer = 0;

  constructor(aimIndicator: AimIndicator, ammoIndicator: AmmoIndicator) {
    super({
      name: "Player",
      pos: vec(150, 150),
      width: PLAYER_CONFIG.width,
      height: PLAYER_CONFIG.height,
      collisionType: CollisionType.Active
    });

    this.aimIndicator = aimIndicator;
    this.ammoIndicator = ammoIndicator;

    this.collider.set(
      Shape.Box(
        PLAYER_CONFIG.colliderWidth,
        PLAYER_CONFIG.colliderHeight
      )
    );

    this.graphics.add(
      new Rectangle({
        width: 8,
        height: 16,
        color: Color.White
      }),
      {
        offset: vec(0, 0)
      }
    );
  }

  override onPreUpdate(engine: Engine, elapsedMs: number): void {
    let x = 0;
    let y = 0;

    if (this.dodgeCooldownTimer > 0) 
    {
      this.dodgeCooldownTimer -= elapsedMs;
      this.dodgeCooldownTimer = Math.max(0, this.dodgeCooldownTimer);
    }

    if (engine.input.keyboard.isHeld(Keys.W)) y -= 1;
    if (engine.input.keyboard.isHeld(Keys.S)) y += 1;
    if (engine.input.keyboard.isHeld(Keys.D)) x += 1;
    if (engine.input.keyboard.isHeld(Keys.A)) x -= 1;

  const direction = vec(x, y);

  if (engine.input.keyboard.wasPressed(Keys.Space)) 
  {
    this.startDodge(direction);
  }

  if (this.isDodging) {
  this.dodgeTimer -= elapsedMs;

  if (this.dodgeTimer <= 0) 
  {
    this.isDodging = false;
    this.vel = vec(0, 0);
  } 
  else 
  {
    this.vel = this.dodgeDirection.scale
    (
      PLAYER_CONFIG.dodgeDistance /
      (PLAYER_CONFIG.dodgeDuration / 1000)
    );
  }
}
  else if (direction.magnitude > 0) 
  {
    this.vel = direction.normalize().scale(PLAYER_CONFIG.speed);
  } 
  else 
  {
    this.vel = vec(0, 0);
  }

    this.handleMouseAim(engine);

    this.weapon.update(elapsedMs, this.isCharging);

    this.ammoIndicator.pos = this.pos.add(vec(22, 22));
    this.ammoIndicator.updateAmmo(this.weapon.currentAmmo);
  }

  override onInitialize(engine: Engine): void {
    this.setupMouse(engine);
  }

  private startDodge(direction: Vector): void 
  {
    if (this.isDodging || this.dodgeCooldownTimer > 0) return;
    if (direction.magnitude === 0) return;

    this.dodgeDirection = direction.normalize();

    this.isDodging = true;
    this.dodgeTimer = PLAYER_CONFIG.dodgeDuration;
    this.dodgeCooldownTimer = PLAYER_CONFIG.dodgeCooldown;

    const dodgeSpeed = PLAYER_CONFIG.dodgeDistance / (PLAYER_CONFIG.dodgeDuration / 1000);

    this.vel = this.dodgeDirection.scale(dodgeSpeed);
}

  private setupMouse(engine: Engine): void {
    const pointer = engine.input.pointers.primary;

    pointer.on("down", (pointerEvent: PointerEvent) => {
      if (pointerEvent.button === PointerButton.Left) {
        this.isCharging = true;
      }
    });

    pointer.on("up", (pointerEvent: PointerEvent) => {
      if (pointerEvent.button === PointerButton.Left) {
        if (this.isCharging) {
          this.isCharging = false;
          this.shoot(engine);
        }
      }
    });

    pointer.on("cancel", () => {
      this.isCharging = false;
    });
  }

  private handleMouseAim(engine: Engine): void {
    const mousePosition = engine.input.pointers.primary.lastWorldPos;

    if (!mousePosition) return;

    const direction = mousePosition.sub(this.pos);

    if (direction.magnitude === 0) return;

    this.rotation = direction.toAngle();

  
    this.aimIndicator.pos = this.pos;

    this.aimIndicator.rotation = direction.toAngle() + Math.PI / 2;

    this.aimIndicator.graphics.opacity = this.isCharging ? 1 : 0;
  }

  private shoot(engine: Engine): void {
    const mousePosition = engine.input.pointers.primary.lastWorldPos;

    if (!mousePosition) return;

    const direction = mousePosition.sub(this.pos);

    if (direction.magnitude === 0) return;

    this.weapon.shoot(engine, this.pos, direction.normalize());
  }
}

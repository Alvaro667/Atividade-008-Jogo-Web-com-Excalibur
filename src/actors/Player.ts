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

    if (engine.input.keyboard.isHeld(Keys.W)) y -= 1;
    if (engine.input.keyboard.isHeld(Keys.S)) y += 1;
    if (engine.input.keyboard.isHeld(Keys.D)) x += 1;
    if (engine.input.keyboard.isHeld(Keys.A)) x -= 1;

    const direction = vec(x, y);

    if (direction.magnitude > 0) {
      this.vel = direction.normalize().scale(PLAYER_CONFIG.speed);
    } else {
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

  // ! ParaPedro: Adicionei o método takeDamage para o jogador, que reduz a vida do jogador quando ele é atingido por um zumbi. Se a vida do jogador chegar a 0, ele não pode mais receber dano.
  // ! é experimental, então pode alterar se achar necessário. 
  takeDamage(amount: number): void {
  if (this.health <= 0 || amount <= 0) {
    return;
  }

  this.health = Math.max(0, this.health - amount);

  console.log(`Vida do jogador: ${this.health}`);
  }
}

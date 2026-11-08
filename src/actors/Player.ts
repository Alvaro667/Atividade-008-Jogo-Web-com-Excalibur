import { Actor, vec, Shape, CollisionType, Engine, Keys, Color, PointerButton, PointerEvent, Rectangle } from "excalibur";
//import { Resources } from "../resources/resources";
import { PLAYER_CONFIG } from "../config/PlayerConfig";
import { AimIndicator } from "./AimIndicator";

export class Player extends Actor
{
  health = PLAYER_CONFIG.maxHealth;
  private isCharging = false;
  private aimIndicator: AimIndicator;
  constructor(AimIndicator: AimIndicator) {
    super({
      name: 'Player',
      pos: vec(150, 150), // posição inicial
      width: PLAYER_CONFIG.width, // largura
      height: PLAYER_CONFIG.height, // altura 
      collisionType: CollisionType.Active, // tipo de colisão, ativa quer dizer que ele pode ser parado por outros objetos/atores
      color: Color.Red
    });
    this.aimIndicator = AimIndicator;
    this.collider.set
    (
      Shape.Box
      (
        PLAYER_CONFIG.colliderWidth,
        PLAYER_CONFIG.colliderHeight
      )
    );
    this.graphics.add
    (
      new Rectangle
      (
        {
          width: 8,
          height: 16,
          color: Color.White,
        }
      ),
      {
        offset: vec(0, -12)
      }
    );
  }

  
  override onPreUpdate(engine: Engine): void 
  {
    let x = 0;
    let y = 0;

    if (engine.input.keyboard.isHeld(Keys.W)) y -= 1;

    if (engine.input.keyboard.isHeld(Keys.S)) y += 1;

    if (engine.input.keyboard.isHeld(Keys.D)) x += 1;

    if (engine.input.keyboard.isHeld(Keys.A)) x -= 1;

    const direction = vec(x, y);

    if (direction.magnitude > 0) 
    {
      this.vel = direction.normalize().scale(PLAYER_CONFIG.speed);
    } 
    else 
    {
     this.vel = vec(0, 0);
    }

    {
    this.handleMouseAim(engine);
    }

  }
  override onInitialize(engine: Engine): void 
  {
    this.setupMouse(engine);
  }

  private setupMouse(engine: Engine) 
  {
    const pointer = engine.input.pointers.primary;

    pointer.on("down", (pointerEvent: PointerEvent) => 
    {
      if (pointerEvent.button === PointerButton.Left)
      {
        this.isCharging = true;
      }
    });

    pointer.on("up", (pointerEvent: PointerEvent) => 
    {
      if (pointerEvent.button === PointerButton.Left)
      {
        this.isCharging = false;
      }
    });

    pointer.on("cancel", () => 
    {
      this.isCharging = false;
    });
  }

  private handleMouseAim(engine: Engine):void 
  {
    const mousePosition = engine.input.pointers.primary.lastWorldPos;

    if (!mousePosition) return;

    const direction = mousePosition.sub(this.pos);

    if (direction.magnitude === 0) return;

    const normalizedDirection = direction.normalize();

    this.rotation = direction.toAngle();

    this.aimIndicator.pos = vec
    (
      this.pos.x + normalizedDirection.x * 25,
      this.pos.y + normalizedDirection.y * 25
    );

     this.aimIndicator.rotation = direction.toAngle() + Math.PI / 2;

     this.aimIndicator.graphics.opacity = this.isCharging ? 1 : 0;
  }

}

import { Actor, Vector, Color, CollisionType 
    //,Engine 
} from "excalibur";

export class Projectile extends Actor {
  private direction: Vector;
  private speed = 500;
  
 // private damage = 1;

  constructor
  (
  position: Vector,
  direction: Vector,
  ) 
{
    super({
      name: "Projectile",
      pos: position,
      width: 8,
      height: 8,
      color: Color.Yellow,
      collisionType: CollisionType.Passive
    });

    this.direction = direction.normalize();

    this.on("collisionstart", (event) => 
    {
        const target = event.other.owner;

         if (target.name === "Player") return;

         if (target.hasTag("enemy")) 
        {
            //this.onEnemyKilled();
        }

     this.kill();
    });
  }

  override onPreUpdate(): void 
  {
    this.vel = this.direction.scale(this.speed);
  }
}
import {
  DefaultLoader,
  Engine,
  ExcaliburGraphicsContext,
  Random,
  Scene,
  SceneActivationContext,
  SpriteSheet,
  TileMap,
  EventEmitter,
  Sprite,
  vec,
} from "excalibur";

import { Player }           from "../actors/Player";
import { AimIndicator }     from "../actors/AimIndicator";
import { AmmoIndicator }    from "../actors/AmmoIndicator";
import { Zombie }           from "../actors/Zombie";
import { Resources }        from "../resources/resources";
import { DifficultySystem } from "../systems/DifficultySystem";
import { EnemySpawner }     from "../systems/EnemySpawner";
import { Pathfinding }      from "../systems/Pathfinding";
import { MazeGenerator }    from "../systems/MazeGenerator";
import { RoomParameters }   from "../systems/RoomParameters";
import { ENTRY_POINTS, Z, SAIDAS }  from "../config/RoomConfig";

export class GameScene extends Scene {

  private baseSeed = 0;
  private level: string[][] = [];
  private tilemap!: TileMap;
  private overlay!: TileMap;
  private pathfinding!: Pathfinding;
  private player!: Player;
  private sprites!: { floor: Sprite, floor1: Sprite, floor2: Sprite, wall: Sprite, door: Sprite, open: Sprite, roof: Sprite, borderT: Sprite, borderR: Sprite, borderL: Sprite }; // tipar como Sprite
  
  private roomY = 0;
  private roomX = 0;
  
  private roomSeed = 0;

  // ! alvaro : signal da fase
  readonly phaseSignals = new EventEmitter<{
    phasecleared: { x: number; y: number };
  }>();

  private remainingZombies = 0;
  private phaseCleared = false;





  private loadRoom(x:number, y:number): void {
    this.roomX = x;
    this.roomY = y;


    this.roomSeed = RoomParameters.RoomSeed(this.baseSeed, this.roomX, this.roomY);
    this.level = MazeGenerator.generateLevel(this.roomSeed + 10);

    const difficulty = DifficultySystem.getDifficulty(RoomParameters.difficultyLevel(x, y));

    const RNGtiles = new Random(this.roomSeed + 30);

    // Create a tilemap
    this.tilemap = new TileMap({
      //compare com as dimensões do mapa do jogo
      rows:      9 * 3,
      columns:  16 * 3,
      tileWidth:  16,
      tileHeight: 16,
    });
    this.tilemap.z = Z.floor; 

    this.overlay = new TileMap({
      //compare com as dimensões do mapa do jogo
      rows:      9 * 3,
      columns:  16 * 3, 
      tileWidth:  16,
      tileHeight: 16,
    });
    this.overlay.z = Z.overlay; 

    if (this.sprites.floor && this.sprites.wall && this.sprites.door) {
      for (let y = 0; y < this.level.length; y++) {
        for (let x = 0; x < this.level[y].length; x++) {
          const tileChar = this.level[y][x];
          let tile = this.tilemap.getTile(x, y);
          if (tile == null) console.error("Tile nulo!");
          else switch (tileChar) {
            case " ":
              var chance = RNGtiles.integer(1, 100);
              if      (chance <= 5) tile.addGraphic(this.sprites.floor2);
              else if (chance > 95) tile.addGraphic(this.sprites.floor1);
              else tile.addGraphic(this.sprites.floor);
              break;
            case "w":
              tile.addGraphic(this.sprites.wall);
              tile.solid = true;
              if (this.level[y][x + 1] != "w") tile.addGraphic(this.sprites.borderR); 
              if (this.level[y][x - 1] != "w") tile.addGraphic(this.sprites.borderL); 
              break;
            case "d":
              tile.addGraphic(this.sprites.door);
              tile.solid = true;
              break;
            default:
              console.log("Tile não declarado: " + tileChar);
              tile.addGraphic(this.sprites.floor);
              break;
          }
        }
      }
    }

    this.add(this.tilemap);

    if (this.sprites.roof) {
      for (let y = 1; y < this.level.length; y++) {
        for (let x = 0; x < this.level[y].length; x++) {
          const tileChar = this.level[y][x];
          let tile = this.overlay.getTile(x, y);
          if (tile == null) console.error("Tile nulo!");
          else if (tileChar == "w") {
            const supTile = this.overlay.getTile(x, y - 1);
            if (supTile){
              supTile.addGraphic(this.sprites.roof);
              if (this.level[y - 1][x] != "w") supTile.addGraphic(this.sprites.borderT); 
              if (this.level[y][x + 1] != "w") supTile.addGraphic(this.sprites.borderR); 
              if (this.level[y][x - 1] != "w") supTile.addGraphic(this.sprites.borderL); 
            }
          }
        }
      }
    }

    this.add(this.overlay);


    
    this.pathfinding = new Pathfinding(this.level);
    
    const spawnPositions = EnemySpawner.getSpawnPositions(
      this.level,
      difficulty.enemyCount,
      this.roomSeed + 100,
    );

    this.remainingZombies = spawnPositions.length;
    this.phaseCleared = false;
    
    
    for (const position of spawnPositions) {
      const zombie = new Zombie(
        this.player,
        position,
        this.pathfinding,
        difficulty.enemySpeed,
        difficulty.enemyDamage
      );

      this.registerZombieDeath(zombie);

      this.add(zombie);
    }
    
    console.log(`Fase: Y = `+ this.roomY + ", X = " + this.roomX);
    console.log(`Zumbis: ${spawnPositions.length}`);
    console.log(`Velocidade: ${difficulty.enemySpeed}`);
    console.log(`Dano: ${difficulty.enemyDamage}`);
    
    if (spawnPositions.length < difficulty.enemyCount) {
      console.warn("Não há espaço suficiente para todos os zumbis desta fase.");
    }

    if(! spawnPositions.length){
      this.phaseCleared = true;
      this.phaseSignals.emit("phasecleared", {
        phase: [this.roomY, this.roomX]
      });
    }
  }
  
  private openDoors(): void{
    if (this.sprites.open) {
      for (let y = 0; y < this.level.length; y++) {
        for (let x = 0; x < this.level[y].length; x++) {
          const tileChar = this.level[y][x];
          let tile = this.tilemap.getTile(x, y);
          if (tile == null) console.error("Tile nulo!");
          else if (tileChar == "d") {
            tile.clearGraphics;
            tile.clearColliders;
            this.level[y][x] = " ";
            tile.addGraphic(this.sprites.open);
            tile.solid = false;
          }
        }
      }
    }
  }

  private clearRoom(): void {
    this.remove(this.tilemap)
    this.remove(this.overlay)
    this.remainingZombies = 0;
    this.phaseCleared = false;
  }
  



  override onInitialize(engine: Engine): void {
    
    const kenneyRougeLikePack = Resources.Tiles;
    // Create a sprite sheet
    const rougeLikeSpriteSheet = SpriteSheet.fromImageSource({
      image: kenneyRougeLikePack,
      grid: {
        rows:     12,
        columns:  11,
        spriteHeight: 16,
        spriteWidth:  16,
      },
      spacing: {
        margin: {
          x: 1,
          y: 1,
        },
      },
    });
    
    this.sprites = {
      floor:  rougeLikeSpriteSheet.getSprite(0, 0),
      floor1: rougeLikeSpriteSheet.getSprite(0, 1),
      floor2: rougeLikeSpriteSheet.getSprite(0, 2),
      wall:   rougeLikeSpriteSheet.getSprite(4, 3),
      door:   rougeLikeSpriteSheet.getSprite(9, 3),
      open:  rougeLikeSpriteSheet.getSprite(9, 0),
      roof:   rougeLikeSpriteSheet.getSprite(3, 1),
      borderT:rougeLikeSpriteSheet.getSprite(3, 0),
      borderR:rougeLikeSpriteSheet.getSprite(4, 1),
      borderL:rougeLikeSpriteSheet.getSprite(2, 1),
    };

    //preparação para criar o labirinto

    const random = new Random();

    this.baseSeed = random.integer(1, 1000000);

    
    // Scene.onInitialize is where we recommend you perform the composition for your game
    const aimIndicator = new AimIndicator();
    const ammoIndicator = new AmmoIndicator();
    this.player = new Player(aimIndicator, ammoIndicator);
    this.player.pos = ENTRY_POINTS[0].clone()
    this.player.z = Z.actors;
    
    this.add(this.player);
    this.add(aimIndicator);
    this.add(ammoIndicator);

    // ! Alvaro: Teste pra verificar se a signal de fase está funcionando corretamente. 
    // ! Você deve colocar a lógica que abre as portas dentro desse método.
    
    this.phaseSignals.on("phasecleared", ({ y, x }) => {
      console.log(`FASE ${y}, ${x} CONCLUÍDA!`);
      console.log("Todas as portas podem ser abertas.");
      this.openDoors();
    });

    this.loadRoom(0, 0);

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
    if(!this.phaseCleared) return;

    let i = -1;

    if      (this.player.pos.x <  24) i = 0;
    else if (this.player.pos.y <  24) i = 1;
    else if (this.player.pos.x > 744) i = 2;
    else if (this.player.pos.y > 424) i = 3; 

    if (i == -1) return;

    this.clearRoom();

    this.loadRoom(this.roomX + SAIDAS[i][0], this.roomY + SAIDAS[i][1]);

    this.player.pos = ENTRY_POINTS[(i + 2) % 4].clone()
    this.player.vel = vec(0, 0);
  }

  override onPreDraw(ctx: ExcaliburGraphicsContext, elapsedMs: number): void {
    // Called before Excalibur draws to the screen
  }

  override onPostDraw(ctx: ExcaliburGraphicsContext, elapsedMs: number): void {
    // Called after Excalibur draws to the screen
  }

  private registerZombieDeath(zombie: Zombie): void {
    zombie.once("kill", () => {
      if (this.phaseCleared) {
        return;
      }

      this.remainingZombies--;

      console.log(
        `Zumbis restantes: ${this.remainingZombies}`
      );

      if (this.remainingZombies === 0) {
        this.phaseCleared = true;

        this.phaseSignals.emit("phasecleared", {
          phase: [this.roomY, this.roomX]
        });
      }
    });
  }
}

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
} from "excalibur";

import { Player } from "../actors/Player";
import { AimIndicator } from "../actors/AimIndicator";
import { AmmoIndicator } from "../actors/AmmoIndicator";
import { Zombie } from "../actors/Zombie";
import { Resources } from "../resources/resources";
import { DifficultySystem } from "../systems/DifficultySystem";
import { EnemySpawner } from "../systems/EnemySpawner";
import { Pathfinding } from "../systems/Pathfinding";
import { MazeGenerator } from "../systems/MazeGenerator";
import { RoomParameters } from "../systems/RoomParameters";

export class GameScene extends Scene {

  private baseSeed = 0;
  private level: string[][] = [];
  private tilemap!: TileMap;
  private pathfinding!: Pathfinding;
  private player!: Player;
  private sprites!: { floor: Sprite, floor1: Sprite, floor2: Sprite, wall: Sprite, door: Sprite, door1: Sprite, roof: Sprite, borderT: Sprite, borderR: Sprite, borderL: Sprite }; // tipar como Sprite

  private roomY = 0;
  private roomX = 0;

  private currentPhase = 1 + this.roomX + this.roomY;
  private phaseDifficulty = RoomParameters.difficultyLevel(this.roomX, this.roomY);

  // ! alvaro : signal da fase
  readonly phaseSignals = new EventEmitter<{
    phasecleared: { phase: number };
  }>();

  private remainingZombies = 0;
  private phaseCleared = false;





  override onInitialize(engine: Engine): void {
    // Load your favorite tileset (maybe from Kenney.nl)
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

    // Create a tilemap
    this.tilemap = new TileMap({
      //compare com as dimensões do mapa do jogo
      rows:      9 * 3,
      columns:  16 * 3,
      tileWidth:  16,
      tileHeight: 16,
    });

    this.sprites = {
      floor:  rougeLikeSpriteSheet.getSprite(0, 0),
      floor1: rougeLikeSpriteSheet.getSprite(0, 1),
      floor2: rougeLikeSpriteSheet.getSprite(0, 2),
      wall:   rougeLikeSpriteSheet.getSprite(4, 3),
      door:   rougeLikeSpriteSheet.getSprite(9, 3),
      door1:  rougeLikeSpriteSheet.getSprite(9, 0),
      roof:   rougeLikeSpriteSheet.getSprite(3, 1),
      borderT:rougeLikeSpriteSheet.getSprite(3, 0),
      borderR:rougeLikeSpriteSheet.getSprite(4, 1),
      borderL:rougeLikeSpriteSheet.getSprite(2, 1),
    };
    //preparação para criar o labirinto

    const random = new Random();

    this.baseSeed = random.integer(1, 1000000);

    const roomSeed = RoomParameters.RoomSeed(this.baseSeed, this.roomX, this.roomY);
    this.level = MazeGenerator.generateLevel(roomSeed + 10);


    const RNGtiles = new Random(roomSeed + 30);

    if (this.sprites.floor && this.sprites.wall && this.sprites.door) {
      for (let y = 0; y < this.level.length; y++) {
        for (let x = 0; x < this.level[y].length; x++) {
          const tileChar = this.level[y][x];
          let tile = this.tilemap.getTile(x, y);
          if (tile == null) console.error("Tile nulo!");
          else
            /* MUDAR QUANDO COLOCAR ACTOR
            if(tileChar == "w"){
              tile.addGraphic(wall);
              tile.solid = true;
            } else {
              var chance = RNGtiles.integer(1, 100);
              if      (chance <= 2) tile.addGraphic(floor2);
              else if (chance > 98) tile.addGraphic(floor1);
              else                  tile.addGraphic(floor );
            }
            */
            switch (tileChar) {
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
                
                const supTile = this.tilemap.getTile(x, y - 1);
                if (y > 0 && supTile){
                  supTile.addGraphic(this.sprites.roof);
                  if (this.level[y - 1][x] != "w") supTile.addGraphic(this.sprites.borderT); 
                  if (this.level[y][x + 1] != "w") supTile.addGraphic(this.sprites.borderR); 
                  if (this.level[y][x - 1] != "w") supTile.addGraphic(this.sprites.borderL); 
                }
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

    this.pathfinding = new Pathfinding(this.level);

    // Scene.onInitialize is where we recommend you perform the composition for your game
    const aimIndicator = new AimIndicator();
    const ammoIndicator = new AmmoIndicator();

    this.player = new Player(aimIndicator, ammoIndicator);

    this.add(this.tilemap);
    this.add(this.player);
    this.add(aimIndicator);
    this.add(ammoIndicator);

    const difficulty = DifficultySystem.getDifficulty(this.phaseDifficulty);

    const spawnPositions = EnemySpawner.getSpawnPositions(
      this.level,
      difficulty.enemyCount,
      roomSeed + 100,
    );

    // ! Alvaro: Teste pra verificar se a signal de fase está funcionando corretamente. 
    // ! Você deve colocar a lógica que abre as portas dentro desse método.

    this.phaseSignals.on("phasecleared", ({ phase }) => {
      console.log(`FASE ${phase} CONCLUÍDA!`);
      console.log("Todas as portas podem ser abertas.");
    });

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

    console.log(`Fase: ${this.currentPhase}`);
    console.log(`Zumbis: ${spawnPositions.length}`);
    console.log(`Velocidade: ${difficulty.enemySpeed}`);
    console.log(`Dano: ${difficulty.enemyDamage}`);

    if (spawnPositions.length < difficulty.enemyCount) {
      console.warn("Não há espaço suficiente para todos os zumbis desta fase.");
    }
  }

  /*private loadRoom(x:number, y:number): void {

  }*/

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
          phase: this.currentPhase
        });
      }
    });
  }
}

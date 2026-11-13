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

export class GameScene extends Scene {
  private currentPhase = 1;

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
        rows: 12,
        columns: 11,
        spriteHeight: 16,
        spriteWidth: 16,
      },
      spacing: {
        margin: {
          x: 1,
          y: 1,
        },
      },
    });

    // Create a tilemap
    const tilemap = new TileMap({
      //compare com as dimensões do mapa do jogo
      rows: 9 * 3,
      columns: 16 * 3,
      tileWidth: 16,
      tileHeight: 16,
    });

    const floor = rougeLikeSpriteSheet.getSprite(0, 0);
    const floor1 = rougeLikeSpriteSheet.getSprite(0, 1);
    const floor2 = rougeLikeSpriteSheet.getSprite(0, 2);
    const wall = rougeLikeSpriteSheet.getSprite(4, 3);
    const door = rougeLikeSpriteSheet.getSprite(9, 3);

    const random = new Random();

    const randomizer = random.integer(1, 1000000);

    const suaSeed = randomizer + (this.currentPhase - 1) * 1000;

    //preparação para criar o labirinto

    var level = MazeGenerator.generateLevel(suaSeed + 10);

    const RNGtiles = new Random(suaSeed + 30);

    if (floor && wall && door) {
      for (let y = 0; y < level.length; y++) {
        for (let x = 0; x < level[y].length; x++) {
          const tileChar = level[y][x];
          let tile = tilemap.getTile(x, y);
          if (tile == null) {
            console.error("Tile nulo!");
          } else
            switch (tileChar) {
              case " ":
                var chance = RNGtiles.integer(1, 100);
                if (chance <= 2) tile.addGraphic(floor1);
                else if (chance > 98) tile.addGraphic(floor2);
                else tile.addGraphic(floor);
                break;
              case "w":
                tile.addGraphic(wall);
                tile.solid = true;
                break;
              case "d":
                tile.addGraphic(door);
                tile.solid = true;
                break;
              default:
                console.log("Tile não declarado: " + tileChar);
                tile.addGraphic(floor);
                break;
            }
        }
      }
    }

    const pathfinding = new Pathfinding(level);

    // Scene.onInitialize is where we recommend you perform the composition for your game
    const aimIndicator = new AimIndicator();
    const ammoIndicator = new AmmoIndicator();

    const player = new Player(aimIndicator, ammoIndicator);

    this.add(tilemap);
    this.add(player);
    this.add(aimIndicator);
    this.add(ammoIndicator);

    const difficulty = DifficultySystem.getDifficulty(this.currentPhase);

    const spawnPositions = EnemySpawner.getSpawnPositions(
      level,
      difficulty.enemyCount,
      player.pos,
      suaSeed + this.currentPhase * 100,
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
        player,
        position,
        pathfinding,
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

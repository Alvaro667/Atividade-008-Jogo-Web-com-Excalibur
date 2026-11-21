
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
import { HeartHud } from "../ui/HeartHud";
import { AimIndicator }     from "../actors/AimIndicator";
import { AmmoIndicator }    from "../actors/AmmoIndicator";
import { Zombie }           from "../actors/Zombie";
import { Door }           from "../actors/Doors";
import { Resources }        from "../resources/resources";
import { DifficultySystem } from "../systems/DifficultySystem";
import { EnemySpawner }     from "../systems/EnemySpawner";
import { Pathfinding }      from "../systems/Pathfinding";
import { MazeGenerator }    from "../systems/MazeGenerator";
import { RoomParameters }   from "../systems/RoomParameters";
import { Z, DOORS }  from "../config/RoomConfig";

type Sprites = {
  floor: Sprite; floor1: Sprite; floor2: Sprite;
  wall: Sprite; roof: Sprite;
  borderT: Sprite; borderR: Sprite; borderL: Sprite;
  doorH: Sprite; doorV: Sprite;
};

export class GameScene extends Scene {

  private baseSeed = 0;
  private level: string[][] = [];
  private tilemap!: TileMap;
  private overlay!: TileMap;
  private pathfinding!: Pathfinding;
  private player!: Player;

  private sprites!: Sprites;  
  private roomX = 0;
  private roomY = 0;
  
  private roomSeed = 0;

  readonly phaseSignals = new EventEmitter<{
    phasecleared: { x: number; y: number };
  }>();

  private remainingZombies = 0;
  private phaseCleared = false;
  private isGameOver = false;
  private heartHud!: HeartHud;

  private doors: Door[] = [];



  private loadRoom(x:number, y:number): void {
    this.roomX = x;
    this.roomY = y;

    const isTutorialRoom = x === 0 && y === 0;
    const tutorial = document.getElementById("tutorial-controls");
    if (tutorial) tutorial.hidden = !isTutorialRoom || this.isGameOver;


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

    if (this.sprites.floor && this.sprites.wall && this.sprites.roof) {
      for (let y = 0; y < this.level.length; y++) {
        for (let x = 0; x < this.level[y].length; x++) {
          const tileChar = this.level[y][x];
          let tile = this.tilemap.getTile(x, y);
          if (tile == null) console.error("Tile nulo!");
          else if(tileChar == "w"){
            tile.addGraphic(this.sprites.wall);
            tile.solid = true;
            if (this.level[y][x + 1] != "w") tile.addGraphic(this.sprites.borderR); 
            if (this.level[y][x - 1] != "w") tile.addGraphic(this.sprites.borderL); 
          } else {
            var chance = RNGtiles.integer(1, 100);
            if      (chance <= 5) tile.addGraphic(this.sprites.floor2);
            else if (chance > 95) tile.addGraphic(this.sprites.floor1);
            else tile.addGraphic(this.sprites.floor);
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

    this.doors.forEach(d => d.close());
    
    this.pathfinding = new Pathfinding(this.level);
    
    const spawnPositions = EnemySpawner.getSpawnPositions(
      this.level,
      isTutorialRoom ? 0 : difficulty.enemyCount,
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
    
    console.log(`Fase: X = ` + this.roomX + `, Y = `+ this.roomY);
    console.log(`Zumbis: ${spawnPositions.length}`);
    console.log(`Velocidade: ${difficulty.enemySpeed}`);
    console.log(`Dano: ${difficulty.enemyDamage}`);
    
    if (!isTutorialRoom && spawnPositions.length < difficulty.enemyCount) {
      console.warn("Não há espaço suficiente para todos os zumbis desta fase.");
    }

    if(! spawnPositions.length){
      this.phaseCleared = true;
      this.phaseSignals.emit("phasecleared", { x: this.roomX, y: this.roomY });
    }
  }

  private clearRoom(): void {
    this.remove(this.tilemap)
    this.remove(this.overlay)
    this.remainingZombies = 0;
    this.phaseCleared = false;
  }
  
  private markDoorsOpenInLevel(): void {
    for (const row of this.level)
      for (let x = 0; x < row.length; x++)
        if (row[x] === "d") row[x] = " ";
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
      roof:   rougeLikeSpriteSheet.getSprite(3, 1),
      borderT:rougeLikeSpriteSheet.getSprite(3, 0),
      borderR:rougeLikeSpriteSheet.getSprite(4, 1),
      borderL:rougeLikeSpriteSheet.getSprite(2, 1),
      doorH: Resources.DoorH.toSprite(),
      doorV: Resources.DoorV.toSprite(),
    };

    this.doors = DOORS.map(d =>
      new Door(d.center, d.size, this.sprites[d.sprite])
    );
    this.doors.forEach(d => this.add(d));

    //preparação para criar o labirinto

    const random = new Random();

    this.baseSeed = random.integer(1, 1000000);

    
    // Scene.onInitialize is where we recommend you perform the composition for your game
    const aimIndicator = new AimIndicator();
    const ammoIndicator = new AmmoIndicator();
    this.player = new Player(aimIndicator, ammoIndicator);
    this.heartHud = new HeartHud();
    this.heartHud.setHealth(this.player.health);
    this.player.onHealthChanged = (health) => this.heartHud.setHealth(health);
    this.player.onDeath = () => this.handleGameOver(engine);
    this.player.pos = DOORS[0].entry.clone()
    this.player.z = Z.actors;
    
    this.add(this.player);
    this.add(aimIndicator);
    this.add(ammoIndicator);

    // ! Alvaro: Teste pra verificar se a signal de fase está funcionando corretamente. 
    // ! Você deve colocar a lógica que abre as portas dentro desse método.
    
    this.phaseSignals.on("phasecleared", ({ x, y }) => {
      console.log(`FASE ${x}, ${y} CONCLUÍDA!`);
      this.doors.forEach(d => d.open());
      this.markDoorsOpenInLevel();
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
    if (this.isGameOver || !this.phaseCleared) return;

    let i = -1;

    if      (this.player.pos.x <  24) i = 0;
    else if (this.player.pos.y <  24) i = 1;
    else if (this.player.pos.x > 744) i = 2;
    else if (this.player.pos.y > 424) i = 3; 

    if (i == -1) return;

    this.clearRoom();
    
    this.player.pos = DOORS[(i + 2) % 4].entry.clone()
    this.player.vel = vec(0, 0);
    
    this.loadRoom(this.roomX + DOORS[i].direction.x, this.roomY + DOORS[i].direction.y);
  }

  override onPreDraw(ctx: ExcaliburGraphicsContext, elapsedMs: number): void {
    // Called before Excalibur draws to the screen
  }

  override onPostDraw(ctx: ExcaliburGraphicsContext, elapsedMs: number): void {
    // Called after Excalibur draws to the screen
  }

  private handleGameOver(engine: Engine): void {
    if (this.isGameOver) return;
    this.isGameOver = true;

    // Oculta os controles do tutorial e mostra a tela de derrota.
    const tutorial = document.getElementById("tutorial-controls");
    if (tutorial) tutorial.hidden = true;

    // Interrompe o jogo imediatamente, mas permite que o coração complete
    // sua última animação antes de exibir a tela de derrota.
    engine.stop();
    this.heartHud.whenAnimationEnds(() => {
      const screen = document.getElementById("game-over-screen");
      if (screen) screen.hidden = false;
    });
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
          x: this.roomX,
          y: this.roomY
        });
      }
    });
  }
}

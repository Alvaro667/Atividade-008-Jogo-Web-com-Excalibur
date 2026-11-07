import { DefaultLoader, Engine, ExcaliburGraphicsContext, Scene, SceneActivationContext, SpriteSheet, TileMap } from "excalibur";
import { Player } from "../actors/Player";
import { Resources } from "../resources/resources";

export class GameScene extends Scene {
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
                spriteWidth: 16
            },
            spacing: {
                margin: {
                    x: 1,
                    y: 1
                }
            }
        });
        
        // Create a tilemap
        const tilemap = new TileMap({ //compare com as dimensões do mapa do jogo
            rows: 9*3,
            columns: 16*3,
            tileWidth: 16,
            tileHeight: 16,
        });
        
        const floor = rougeLikeSpriteSheet.getSprite(0, 0);
        const wall = rougeLikeSpriteSheet.getSprite(4, 3);
        const door = rougeLikeSpriteSheet.getSprite(9, 3);
        
        const level: string[] = [
            "wwwwwwwwwwwwwwwwwwwwwwddddwwwwwwwwwwwwwwwwwwwwww",
            "wffffffffffffffffffffffffffffffffffffffffffffffw",
            "wffffffffffffffffffffffffffffffffffffffffffffffw",
            "wffffffffffffffffffffffffffffffffffffffffffffffw",
            "wffffffffffffffffffffffffffffffffffffffffffffffw",
            "wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww",
            "wffffffffffffffffffffffffffffffffffffffffffffffw",
            "wffffffffffffffffffffffffffffffffffffffffffffffw",
            "wffffffffffffffffffffffffffffffffffffffffffffffw",
            "wffffffffffffffffffffffffffffffffffffffffffffffw",
            "wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww",
            "wffffffffffffffffffffffffffffffffffffffffffffffw",
            "dffffffffffffffffffffffffffffffffffffffffffffffd",
            "dffffffffffffffffffffffffffffffffffffffffffffffd",
            "dffffffffffffffffffffffffffffffffffffffffffffffd",
            "wffffffffffffffffffffffffffffffffffffffffffffffw",
            "wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww",
            "wffffffffffffffffffffffffffffffffffffffffffffffw",
            "wffffffffffffffffffffffffffffffffffffffffffffffw",
            "wffffffffffffffffffffffffffffffffffffffffffffffw",
            "wffffffffffffffffffffffffffffffffffffffffffffffw",
            "wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww",
            "wffffffffffffffffffffffffffffffffffffffffffffffw",
            "wffffffffffffffffffffffffffffffffffffffffffffffw",
            "wffffffffffffffffffffffffffffffffffffffffffffffw",
            "wffffffffffffffffffffffffffffffffffffffffffffffw",
            "wwwwwwwwwwwwwwwwwwwwwwddddwwwwwwwwwwwwwwwwwwwwww"
        ]

        if(floor && wall && door){
            for (let y = 0; y < level.length; y++) {
                for (let x = 0; x < level[y].length; x++) {
                    const tileChar = level[y][x];
                    let tile = tilemap.getTile(x, y);
                    if(tile == null){
                        console.error("Tile nulo!");
                    } else if(tileChar == 'f') tile.addGraphic(floor);
                    else if(tileChar == 'w'){
                        tile.addGraphic(wall);
                        tile.solid = true;
                    } else if(tileChar == 'd'){
                        tile.addGraphic(door);
                        tile.solid = true;
                    }
                }
            }
        }
        
        // Scene.onInitialize is where we recommend you perform the composition for your game
        const player = new Player();
        this.add(player);
        this.add(tilemap); // Actors need to be added to a scene to be drawn
    }

    override onPreLoad(loader: DefaultLoader): void {
        // Add any scene specific resources to load
    }

    override onActivate(context: SceneActivationContext<unknown>): void {
        // Called when Excalibur transitions to this scene
        // Only 1 scene is active at a time
    }

    override onDeactivate(context: SceneActivationContext): void {
        // Called when Excalibur transitions away from this scene
        // Only 1 scene is active at a time
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
}
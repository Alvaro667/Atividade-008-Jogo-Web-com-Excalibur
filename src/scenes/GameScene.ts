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
        
        // loop through tilemap cells
        for (let tile of tilemap.tiles) {
            const floor = rougeLikeSpriteSheet.getSprite(0, 0);
            const wall = rougeLikeSpriteSheet.getSprite(1, 3);
            if(wall && (tile.x == 0 || tile.y == 0 || tile.x == 16*3 - 1 || tile.y == 9*3 - 1) && !((tile.x == 0 || tile.x == 16*3 - 1) && (tile.y >= 12 && tile.y <= 14)) && !((tile.y == 0 || tile.y == 9*3 - 1) && (tile.x >= 22 && tile.x <= 25))){
                tile.addGraphic(wall);
                tile.solid = true;
            } else if(floor) tile.addGraphic(floor);

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
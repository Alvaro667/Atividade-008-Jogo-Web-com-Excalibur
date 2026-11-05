import { DefaultLoader, Engine, ExcaliburGraphicsContext, Scene, SceneActivationContext, Vector } from "excalibur";
import { Player } from "../actors/Player";
import { WallNS } from "../actors/WallsNS";
import { WallEW } from "../actors/WallsEW";


export class GameScene extends Scene {
    override onInitialize(engine: Engine): void {
        // Scene.onInitialize is where we recommend you perform the composition for your game
        const player = new Player();
        this.add(player); // Actors need to be added to a scene to be drawn
        const wallN = new WallNS(new Vector(0, 0));
        this.add(wallN);
        const wallS = new WallNS(new Vector(0, 530));
        this.add(wallS);
        const wallW = new WallEW(new Vector(0, 0));
        this.add(wallW);
        const wallE = new WallEW(new Vector(950, 0));
        this.add(wallE);
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
import { Color, DisplayMode, Engine, FadeInOut, SolverStrategy } from "excalibur";
import { loader } from "./resources/resources";
import { GameScene } from "./scenes/GameScene";

const game = new Engine({
  width: 16 * 16 * 3,
  height: 16 * 9 * 3,
  displayMode: DisplayMode.FitScreenAndFill,
  pixelArt: true,
  scenes: {
    start: GameScene
  },
  physics: {
    solver: SolverStrategy.Realistic,
    substep: 5 // Sub step the physics simulation for more robust simulations
  }
  // fixedUpdateTimestep: 16 // Turn on fixed update timestep when consistent physic simulation is important
});

game.start("start", {
  loader,
  inTransition: new FadeInOut({
    duration: 1000,
    direction: "in",
    color: Color.ExcaliburBlue
  })
}).then(() => {
  // Do something after the game starts
});
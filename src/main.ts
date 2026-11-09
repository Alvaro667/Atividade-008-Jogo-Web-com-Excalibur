import { Color, DisplayMode, Engine, FadeInOut } from "excalibur";
import { loader } from "./resources/resources";
import { GameScene } from "./scenes/GameScene";

const game = new Engine({
  width: 16 * 16 * 3,
  height: 16 * 9 * 3,
  displayMode: DisplayMode.FitScreenAndFill,
  pixelArt: true,
  scenes: {
    start: GameScene
  }
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
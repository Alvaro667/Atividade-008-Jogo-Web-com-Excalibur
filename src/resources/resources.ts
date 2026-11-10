import { ImageSource, Loader } from "excalibur";

export const Resources = {
  Sword: new ImageSource("./images/sword.png"),
  Tiles: new ImageSource("./images/tilemap.png"),
  ZombieIdle: new ImageSource("./images/enemies/zombie/idle.png"),
  ZombieRun: new ImageSource("./images/enemies/zombie/run.png"),
  ZombieHurt: new ImageSource("./images/enemies/zombie/hurt.png"),
  ZombieDeath: new ImageSource("./images/enemies/zombie/death.png"),
  
} as const;
// the 'as const' is a neat typescript trick to get strong typing on your resources.
// So when you type Resources.Sword -> ImageSource

export const loader = new Loader();

for (const res of Object.values(Resources)) {
  loader.addResource(res);
}
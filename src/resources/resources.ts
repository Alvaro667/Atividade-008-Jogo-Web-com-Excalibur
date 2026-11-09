import { ImageSource, Loader } from "excalibur";

export const Resources = {
  Sword: new ImageSource("./images/sword.png"),
  Tiles: new ImageSource("./images/tilemap.png")
} as const;

export const loader = new Loader();

for (const res of Object.values(Resources)) {
  loader.addResource(res);
}
import { Vector, vec } from "excalibur";

export const ENTRY_POINTS: Vector[] = [
  vec( 48, 216), // esquerda  x -= 1
  vec(384,  48), // cima      y -= 1
  vec(704, 216), // direita   x += 1
  vec(384, 384), // baixo     y += 1
];

export const SAIDAS: number[][] = [// x, y
  [-1,  0], // esquerda  x -= 1
  [ 0, -1], // cima      y -= 1
  [ 1,  0], // direita   x += 1
  [ 0,  1], // baixo     y += 1
];

export const Z = { floor: -10, actors: 0, overlay: 10 };
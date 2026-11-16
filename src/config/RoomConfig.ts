import { Vector, vec } from "excalibur"; //dava pra resumir

export const ENTRY_POINTS: Vector[] = [
  vec( 48, 216), // esquerda  x 
  vec(384,  48), // cima      
  vec(704, 216), // direita   
  vec(384, 384), // baixo     
];

export const SAIDAS: number[][] = [// x, y
  [-1,  0], // esquerda  x -= 1
  [ 0, -1], // cima      y -= 1
  [ 1,  0], // direita   x += 1
  [ 0,  1], // baixo     y += 1
];

export const Z = { floor: -10, actors: 0, overlay: 10, hud: 20 };

export type DoorSprite = "doorH" | "doorV";

export const DOORS: { center: Vector; size: Vector; sprite: DoorSprite }[] = [
  { center: vec( 24, 216), size: vec(12, 80), sprite: "doorV" }, // esquerda
  { center: vec(384,  20), size: vec(64, 20), sprite: "doorH" }, // cima
  { center: vec(744, 216), size: vec(12, 80), sprite: "doorV" }, // direita
  { center: vec(384, 420), size: vec(64, 20), sprite: "doorH" }, // baixo
];
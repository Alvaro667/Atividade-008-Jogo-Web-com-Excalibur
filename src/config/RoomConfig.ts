import { Vector, vec } from "excalibur"; //dava pra resumir

export const Z = { floor: -10, actors: 0, overlay: 10, hud: 20 };

export type DoorSprite = "doorH" | "doorV";

export const DOORS: { entry: Vector; direction: Vector; center: Vector; size: Vector; sprite: DoorSprite }[] = [
  { entry: vec( 48, 216), direction: vec(-1,  0), center: vec( 24, 216), size: vec(12, 80), sprite: "doorV" }, // esquerda
  { entry: vec(384,  48), direction: vec( 0, -1), center: vec(384,  20), size: vec(64, 20), sprite: "doorH" }, // cima
  { entry: vec(704, 216), direction: vec( 1,  0), center: vec(744, 216), size: vec(12, 80), sprite: "doorV" }, // direita
  { entry: vec(384, 384), direction: vec( 0,  1), center: vec(384, 420), size: vec(64, 20), sprite: "doorH" }, // baixo
];
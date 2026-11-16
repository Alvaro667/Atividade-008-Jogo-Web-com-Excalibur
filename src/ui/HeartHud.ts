/** Indicador de vida: usa APENAS a primeira linha do spritesheet (23 quadros de 16px). */
import heartSheetUrl from "../assets/spritesheet.png";

const FRAME_SIZE = 16;
const SOURCE_X = 16; // ! primeira coluna útil da imagem original
const SOURCE_Y = 32; // ! primeira linha útil da imagem original
const FRAME_DELAY_MS = 65;

const HEALTH_FRAMES: Record<number, number> = {
  3: 1,
  2: 12,
  1: 21,
  0: 23
};

export class HeartHud {
  private readonly canvas: HTMLCanvasElement;
  private readonly context: CanvasRenderingContext2D;
  private readonly spriteSheet = new Image();
  private currentFrame = 1;
  private destinationFrame = 1;
  private timer: number | undefined;
  private onAnimationFinished: (() => void)[] = [];

  constructor() {
    const canvas = document.getElementById("health-heart");
    if (!(canvas instanceof HTMLCanvasElement)) {
      throw new Error("Canvas #health-heart não encontrado no index.html");
    }
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Não foi possível iniciar o canvas do indicador de vida");

    this.canvas = canvas;
    this.context = context;
    this.canvas.width = FRAME_SIZE;
    this.canvas.height = FRAME_SIZE;
    this.context.imageSmoothingEnabled = false;

    this.spriteSheet.onload = () => this.draw();
    this.spriteSheet.src = heartSheetUrl;
  }

  setHealth(health: number): void {
    const normalized = Math.max(0, Math.min(3, Math.floor(health)));
    this.destinationFrame = HEALTH_FRAMES[normalized];
    if (this.currentFrame === this.destinationFrame) {
      this.resolveFinished();
      return;
    }
    // ! Quando recebe dano durante outra animação, continua de onde parou.
    if (this.timer === undefined) {
      this.timer = window.setInterval(() => {
        if (this.currentFrame < this.destinationFrame) this.currentFrame++;
        else if (this.currentFrame > this.destinationFrame) this.currentFrame--;
        this.draw();
        if (this.currentFrame === this.destinationFrame) {
          window.clearInterval(this.timer);
          this.timer = undefined;
          this.resolveFinished();
        }
      }, FRAME_DELAY_MS);
    }
  }

  whenAnimationEnds(callback: () => void): void {
    if (this.timer === undefined && this.currentFrame === this.destinationFrame) {
      callback();
    } else {
      this.onAnimationFinished.push(callback);
    }
  }

  private resolveFinished(): void {
    if (this.currentFrame !== this.destinationFrame) return;
    const callbacks = this.onAnimationFinished.splice(0);
    callbacks.forEach(callback => callback());
  }

  private draw(): void {
    if (!this.spriteSheet.complete || this.spriteSheet.naturalWidth === 0) return;
    this.context.clearRect(0, 0, FRAME_SIZE, FRAME_SIZE);
    this.context.drawImage(
      this.spriteSheet,
      SOURCE_X + (this.currentFrame - 1) * FRAME_SIZE,
      SOURCE_Y,
      FRAME_SIZE,
      FRAME_SIZE,
      0,
      0,
      FRAME_SIZE,
      FRAME_SIZE
    );
  }
}

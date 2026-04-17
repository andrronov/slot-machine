import type { Container, Sprite, BlurFilter } from "pixi.js";

export type Reel = {
  container: Container;
  symbols: Sprite[];
  position: number;
  previousPosition: number;
  blur: BlurFilter;
  textureQueue: number[];
};

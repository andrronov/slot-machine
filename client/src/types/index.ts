import type { Container, Sprite, BlurFilter } from "pixi.js";

export type Reel = {
  container: Container;
  symbols: Sprite[];
  position: number;
  previousPosition: number;
  blur: BlurFilter;
  textureQueue: number[];
};

export type WinningLine = {
  lineIndex: number;
  symbolId: number;
  matchCount: number;
  amount: number;
};

export type SpinResult = {
  win: number;
  winningLines: WinningLine[];
  serverResult: SlotMatrix;
};

export type SlotMatrix = number[][];

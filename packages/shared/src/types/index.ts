export type SlotMatrix = number[][];

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

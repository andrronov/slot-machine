import type { SlotMatrix, WinningLine } from "@/types";
import {
  REELS_COUNT,
  SYMBOLS_PER_REEL,
  PAYLINES,
  SYMBOLS_MAP,
} from "@/config/game";

const generateResult = (): SlotMatrix => {
  const matrix: SlotMatrix = [];

  for (let i = 0; i < REELS_COUNT; i++) {
    const reel: number[] = [];
    for (let j = 0; j < SYMBOLS_PER_REEL; j++) {
      reel.push(Math.floor(Math.random() * SYMBOLS_PER_REEL));
    }
    matrix.push(reel);
  }
  return matrix;
};

const calculateWin = (matrix: SlotMatrix, stake: number) => {
  let win = 0;
  const winningLines: WinningLine[] = [];

  for (let i = 0; i < PAYLINES.length; i++) {
    const line = PAYLINES[i];

    const firstSymbolPos = line[0];
    const firstSymbolId = matrix[firstSymbolPos[0]][firstSymbolPos[1]];

    let matchCount = 1;

    for (let j = 1; j < line.length; j++) {
      const pos = line[j];
      const symbolId = matrix[pos[0]][pos[1]];

      if (symbolId === firstSymbolId) {
        matchCount++;
      } else {
        break;
      }
    }

    if (matchCount >= 3) {
      const symbolData = SYMBOLS_MAP[firstSymbolId as keyof typeof SYMBOLS_MAP];
      const winAmount =
        stake * symbolData.payoutMultiplier * (matchCount * 0.5);
      win += winAmount;

      winningLines.push({
        lineIndex: i,
        symbolId: firstSymbolId,
        matchCount: matchCount,
        amount: winAmount,
      });
    }
  }

  return { win, winningLines, matrix };
};

export const checkWin = (stake: number) => {
  const serverResult = generateResult();
  console.log("result matrix:", serverResult);

  const { win, winningLines } = calculateWin(serverResult, stake);

  console.log("win, lines", win, winningLines);

  return { win, winningLines, serverResult };
};

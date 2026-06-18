import type { SlotMatrix, WinningLine } from "@slot-machine/shared/types";
import {
  PAYLINES,
  SYMBOLS_MAP,
  WILD_ID,
  SYMBOLS_COUNT,
} from "@slot-machine/shared/config";
import { REELS_COUNT, SYMBOLS_PER_REEL } from "../config/game.js";

type SymbolId = keyof typeof SYMBOLS_MAP;

const generateResult = (): SlotMatrix => {
  const matrix: SlotMatrix = [];

  for (let i = 0; i < REELS_COUNT; i++) {
    const reel: number[] = [];
    for (let j = 0; j < SYMBOLS_PER_REEL; j++) {
      reel.push(Math.floor(Math.random() * SYMBOLS_COUNT));
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
    let targetSymbolId = matrix[firstSymbolPos[0]][firstSymbolPos[1]];
    let matchCount = 1;

    for (let j = 1; j < line.length; j++) {
      const pos = line[j];
      const symbolId = matrix[pos[0]][pos[1]];

      if (targetSymbolId === WILD_ID && symbolId !== WILD_ID) {
        targetSymbolId = symbolId;
      }

      if (symbolId === targetSymbolId || symbolId === WILD_ID) {
        matchCount++;
      } else {
        break;
      }
    }

    if (matchCount >= 3) {
      const symbolData = SYMBOLS_MAP[targetSymbolId as SymbolId];
      const winAmount =
        stake * symbolData.payoutMultiplier * (matchCount * 0.5);
      win += winAmount;

      winningLines.push({
        lineIndex: i,
        symbolId: targetSymbolId,
        matchCount: matchCount,
        amount: winAmount,
      });
    }
  }

  return { win, winningLines, matrix };
};

export const checkWin = (stake: number) => {
  const serverResult = generateResult();

  const { win, winningLines } = calculateWin(serverResult, stake);

  return { win, winningLines, serverResult };
};

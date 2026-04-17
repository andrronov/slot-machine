export const SYMBOLS_MAP = {
  0: { id: 0, name: "YinYang", payoutMultiplier: 1.5 },
  1: { id: 1, name: "Coin", payoutMultiplier: 2.5 },
  2: { id: 2, name: "Bonus", payoutMultiplier: 5 },
  3: { id: 3, name: "Seven", payoutMultiplier: 10 },
} as const;

export const PAYLINES = [
  [
    [0, 0],
    [1, 0],
    [2, 0],
    [3, 0],
    [4, 0],
    [5, 0],
  ],
  [
    [0, 1],
    [1, 1],
    [2, 1],
    [3, 1],
    [4, 1],
    [5, 1],
  ],
  [
    [0, 2],
    [1, 2],
    [2, 2],
    [3, 2],
    [4, 2],
    [5, 2],
  ],
  [
    [0, 3],
    [1, 3],
    [2, 3],
    [3, 3],
    [4, 3],
    [5, 3],
  ],
  [
    [0, 0],
    [1, 1],
    [2, 2],
    [3, 2],
    [4, 1],
    [5, 0],
  ],
] as const;

export const IS_PROD = import.meta.env.PROD;

export const SYMBOL_SIZE = 80 as const;
export const REEL_WIDTH = 90 as const;
export const SYMBOLS_PER_REEL = 7 as const;
export const REELS_COUNT = 6 as const;

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

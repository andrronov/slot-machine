export const WILD_ID = 1;

export const SYMBOLS_MAP = {
  0: {
    id: 0,
    name: "Circle",
    payoutMultiplier: 0.5,
    img: "/img/symbols/circle.png",
  },
  1: {
    id: WILD_ID,
    name: "Wild",
    payoutMultiplier: 1,
    img: "/img/symbols/wild.png",
  },
  2: {
    id: 2,
    name: "Hexagon",
    payoutMultiplier: 0.5,
    img: "/img/symbols/hexagon.png",
  },
  3: {
    id: 3,
    name: "Prism",
    payoutMultiplier: 0.5,
    img: "/img/symbols/prism.png",
  },
  4: {
    id: 4,
    name: "Aura Drop",
    payoutMultiplier: 1.5,
    img: "/img/symbols/aura-drop.png",
  },
  5: {
    id: 5,
    name: "Square",
    payoutMultiplier: 0.5,
    img: "/img/symbols/square.png",
  },
  6: {
    id: 6,
    name: "Triangle",
    payoutMultiplier: 0.5,
    img: "/img/symbols/triangle.png",
  },
  7: {
    id: 7,
    name: "Blue Lotus",
    payoutMultiplier: 1.5,
    img: "/img/symbols/blue-lotus.png",
  },
  8: {
    id: 8,
    name: "Infinity Ring",
    payoutMultiplier: 2,
    img: "/img/symbols/infinity-ring.png",
  },
  9: {
    id: 9,
    name: "Light Feather",
    payoutMultiplier: 1.5,
    img: "/img/symbols/light-feather.png",
  },
} as const;

export const SYMBOLS_COUNT = Object.keys(SYMBOLS_MAP).length;

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
  [
    [0, 3],
    [1, 2],
    [2, 1],
    [3, 1],
    [4, 2],
    [5, 3],
  ],
] as const;

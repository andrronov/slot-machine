import { ref, onUnmounted } from "vue";
import {
  Application,
  Assets,
  Container,
  Sprite,
  BlurFilter,
  Graphics,
} from "pixi.js";
import gsap from "gsap";
import {
  IS_PROD,
  REELS_COUNT,
  REEL_WIDTH,
  SYMBOLS_PER_REEL,
  SYMBOL_SIZE,
  PAYLINES,
} from "../config";
import type { Reel, WinningLine, SlotMatrix } from "../types";

export const useSlotMachine = () => {
  const balance = ref(500);
  const stake = ref(1);
  const isSpinning = ref(false);

  const app = new Application();
  const reels: Reel[] = [];
  let slotTextures: any[] = [];
  const winSymbolGraphics = new Graphics();

  const initPixi = async (canvasContainer: HTMLElement) => {
    if (!IS_PROD) {
      window.__PIXI_APP__ = app;
    }

    await app.init({
      backgroundAlpha: 0,
      antialias: true,
      resizeTo: canvasContainer,
    });

    canvasContainer.appendChild(app.canvas);

    await loadAssets();
    buildReels();
    startTicker();
  };

  const loadAssets = async () => {
    const urls = [
      "https://i.imgur.com/hpjuqb1.png",
      "https://i.imgur.com/S2GtCJP.png",
      "https://i.imgur.com/YYoVVYv.png",
      "https://i.imgur.com/9za3Pl0.png",
    ];

    slotTextures = await Promise.all(urls.map((url) => Assets.load(url)));
  };

  const buildReels = () => {
    const reelContainer = new Container();
    reelContainer.y = 0;
    reelContainer.x = 50;

    const graphics = new Graphics();
    const mask = graphics
      .rect(
        50,
        0,
        REEL_WIDTH * REELS_COUNT,
        SYMBOL_SIZE * (SYMBOLS_PER_REEL - 3) + 5,
      )
      .fill("0x000000");

    app.stage.addChild(mask);

    reelContainer.mask = mask;

    for (let i = 0; i < REELS_COUNT; i++) {
      const rc = new Container();
      rc.x = i * REEL_WIDTH;
      reelContainer.addChild(rc);

      const blurFilter = new BlurFilter();
      blurFilter.strengthX = 0;
      blurFilter.strengthY = 0;
      rc.filters = [blurFilter];

      const reel: Reel = {
        container: rc,
        symbols: [],
        position: 0,
        previousPosition: 0,
        blur: blurFilter,
        textureQueue: [],
      };

      for (let j = 0; j < SYMBOLS_PER_REEL; j++) {
        const texture =
          slotTextures[Math.floor(Math.random() * slotTextures.length)];
        const symbol = new Sprite(texture);

        symbol.y = j * SYMBOL_SIZE;
        symbol.scale.set(
          Math.min(SYMBOL_SIZE / symbol.width, SYMBOL_SIZE / symbol.height),
        );
        symbol.x = Math.round((SYMBOL_SIZE - symbol.width) / 2);

        reel.symbols.push(symbol);
        rc.addChild(symbol);
      }
      reels.push(reel);
    }
    app.stage.addChild(reelContainer);

    winSymbolGraphics.x = 50;
    winSymbolGraphics.y = 0;
    app.stage.addChild(winSymbolGraphics);
  };

  const drawWinningSymbols = (winningLines: WinningLine[]) => {
    winSymbolGraphics.clear();

    winningLines.forEach((win) => {
      const linePath = PAYLINES[win.lineIndex];

      for (let i = 0; i < win.matchCount; i++) {
        const [col, row] = linePath[i];

        const x = col * REEL_WIDTH - 5;
        const y = row * SYMBOL_SIZE;

        winSymbolGraphics
          .rect(x, y, REEL_WIDTH, SYMBOL_SIZE)
          .stroke({ width: 2.5, color: "#FFD700" });
      }
    });
  };

  const fetchResult = async () => {
    const result = await fetch("http://localhost:3124/spin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ stake: stake.value }),
    });
    const data = (await result.json()) as {
      win: number;
      winningLines: WinningLine[];
      serverResult: SlotMatrix;
    };
    return data;
  };

  const spin = async () => {
    if (isSpinning.value || balance.value < stake.value) return;

    winSymbolGraphics.clear();
    const { win, winningLines, serverResult } = await fetchResult();

    isSpinning.value = true;
    balance.value -= stake.value;

    reels.forEach((r, i) => {
      const extraLoops = Math.floor(Math.random() * 3);
      const targetPosition = Math.ceil(r.position) + 15 + i * 5 + extraLoops;

      const steps = Math.floor(targetPosition - r.position);

      r.textureQueue = [];
      for (let k = 0; k < steps - 5; k++) {
        r.textureQueue.push(Math.floor(Math.random() * slotTextures.length));
      }

      r.textureQueue.push(serverResult[i][3]);
      r.textureQueue.push(serverResult[i][2]);
      r.textureQueue.push(serverResult[i][1]);
      r.textureQueue.push(serverResult[i][0]);
      r.textureQueue.push(Math.floor(Math.random() * slotTextures.length));

      gsap.to(r, {
        position: targetPosition,
        duration: 1.75 + i * 0.35,
        ease: "back.out(0.4)",
        onComplete: () => {
          if (i === reels.length - 1) {
            isSpinning.value = false;
            checkWin(win, winningLines);
          }
        },
      });
    });
  };

  const checkWin = (winAmount: number, lines: WinningLine[]) => {
    if (winAmount > 0) {
      console.log(`🤑 БОМБА! ВЫИГРЫШ: $${winAmount} 🤑`);

      drawWinningSymbols(lines);

      balance.value += winAmount;
    }
  };

  const startTicker = () => {
    app.ticker.add(() => {
      for (const r of reels) {
        r.blur.strengthY = (r.position - r.previousPosition) * 80;
        r.previousPosition = r.position;

        for (let j = 0; j < r.symbols.length; j++) {
          const s = r.symbols[j];
          const prevy = s.y;
          s.y =
            ((r.position + j) % r.symbols.length) * SYMBOL_SIZE - SYMBOL_SIZE;

          if (s.y < 0 && prevy > SYMBOL_SIZE) {
            let nextId;
            if (r.textureQueue.length > 0) {
              nextId = r.textureQueue.shift() as number;
            } else {
              nextId = Math.floor(Math.random() * slotTextures.length);
            }

            s.texture = slotTextures[nextId];
            s.scale.set(
              Math.min(
                SYMBOL_SIZE / s.texture.width,
                SYMBOL_SIZE / s.texture.height,
              ),
            );
            s.x = Math.round((SYMBOL_SIZE - s.width) / 2);
          }
        }
      }
    });
  };

  onUnmounted(() => {
    app.destroy(true, true);
  });

  return {
    initPixi,
    spin,
    balance,
    stake,
    isSpinning,
  };
};

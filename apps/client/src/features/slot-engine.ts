import {
  Application,
  Assets,
  Container,
  Sprite,
  BlurFilter,
  Graphics,
  type Texture,
} from "pixi.js";
import gsap from "gsap";
import { PAYLINES } from "@slot-machine/shared/config";
import type { WinningLine, SlotMatrix } from "@slot-machine/shared/types";
import {
  IS_PROD,
  REELS_COUNT,
  REEL_WIDTH,
  SYMBOLS_PER_REEL,
  SYMBOL_SIZE,
} from "../config";
import type { Reel } from "../types";

export class SlotEngine {
  public app: Application;
  private reels: Reel[] = [];
  private slotTextures: Texture[] = [];
  private winSymbolGraphics: Graphics;
  private paylinesGraphics: Graphics;

  constructor() {
    this.app = new Application();
    this.winSymbolGraphics = new Graphics();
    this.paylinesGraphics = new Graphics();
  }

  public async init(canvasContainer: HTMLElement) {
    if (!IS_PROD) {
      window.__PIXI_APP__ = this.app;
    }

    await this.app.init({
      backgroundAlpha: 0,
      antialias: true,
      resizeTo: canvasContainer,
    });

    canvasContainer.appendChild(this.app.canvas);

    await this.loadAssets();
    this.buildReels();
    this.startTicker();
  }

  private async loadAssets() {
    const urls = [
      "https://i.imgur.com/hpjuqb1.png",
      "https://i.imgur.com/S2GtCJP.png",
      "https://i.imgur.com/YYoVVYv.png",
      "https://i.imgur.com/9za3Pl0.png",
    ];

    this.slotTextures = await Promise.all(urls.map((url) => Assets.load(url)));
  }

  private buildGraphics() {
    this.winSymbolGraphics.x = 50;
    this.winSymbolGraphics.y = 0;
    this.app.stage.addChild(this.winSymbolGraphics);
    this.paylinesGraphics.x = 50;
    this.paylinesGraphics.y = 0;
    this.app.stage.addChild(this.paylinesGraphics);
  }

  private buildReels() {
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

    this.app.stage.addChild(mask);

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
          this.slotTextures[
            Math.floor(Math.random() * this.slotTextures.length)
          ];
        const symbol = new Sprite(texture);

        symbol.y = j * SYMBOL_SIZE;
        symbol.scale.set(
          Math.min(SYMBOL_SIZE / symbol.width, SYMBOL_SIZE / symbol.height),
        );
        symbol.x = Math.round((SYMBOL_SIZE - symbol.width) / 2);

        reel.symbols.push(symbol);
        rc.addChild(symbol);
      }
      this.reels.push(reel);
    }
    this.app.stage.addChild(reelContainer);

    this.buildGraphics();
  }

  private drawWinningSymbols(winningLines: WinningLine[]) {
    this.winSymbolGraphics.clear();

    winningLines.forEach((win) => {
      const linePath = PAYLINES[win.lineIndex];

      for (let i = 0; i < win.matchCount; i++) {
        const [col, row] = linePath[i];

        const x = col * REEL_WIDTH - 5;
        const y = row * SYMBOL_SIZE;

        this.winSymbolGraphics
          .rect(x, y, REEL_WIDTH, SYMBOL_SIZE)
          .stroke({ width: 2.5, color: "#FFD700" });
      }
    });
  }

  public toggleAllPaylines(show: boolean) {
    this.paylinesGraphics.clear();

    if (!show) return;

    const colors = [0xff0055, 0x00ff99, 0x00ccff, 0xffaa00, 0xcc00ff];

    PAYLINES.forEach((linePath, index) => {
      const color = colors[index % colors.length];

      for (let i = 0; i < linePath.length; i++) {
        const [col, row] = linePath[i];

        const x = col * REEL_WIDTH + REEL_WIDTH / 2;
        const y = row * SYMBOL_SIZE + SYMBOL_SIZE / 2;

        if (i === 0) {
          this.paylinesGraphics.moveTo(x, y);
        } else {
          this.paylinesGraphics.lineTo(x, y);
        }
      }

      this.paylinesGraphics.stroke({
        width: 3,
        color: color,
        alpha: 0.6,
        join: "round",
      });
    });
  }

  public startSpin() {
    this.winSymbolGraphics.clear();
    this.paylinesGraphics.clear();

    this.reels.forEach((r) => {
      r.textureQueue = [];

      gsap.to(r, {
        position: "+=1000",
        duration: 15,
        ease: "power1.in",
      });
    });
  }

  public async completeSpin(serverResult: SlotMatrix, onComplete?: () => void) {
    this.reels.forEach((r, i) => {
      const extraLoops = Math.floor(Math.random() * 3);
      const targetPosition = Math.ceil(r.position) + 15 + i * 5 + extraLoops;

      const steps = targetPosition - Math.floor(r.position);

      r.textureQueue = [];
      for (let k = 0; k < steps - 5; k++) {
        r.textureQueue.push(
          Math.floor(Math.random() * this.slotTextures.length),
        );
      }

      for (let k = 3; k >= 0; k--) {
        r.textureQueue.push(serverResult[i][k]);
      }

      gsap.to(r, {
        position: targetPosition,
        duration: 1.75 + i * 0.35,
        ease: "back.out(0.4)",
        overwrite: true,
        onComplete: () => {
          if (i === this.reels.length - 1) {
            onComplete?.();
          }
        },
      });
    });
  }

  public stopSpin(onComplete?: () => void) {
    this.reels.forEach((r, i) => {
      gsap.to(r, {
        position: Math.ceil(r.position) + 2,
        duration: 0.5,
        overwrite: true,
        onComplete: () => {
          if (i === this.reels.length - 1) {
            onComplete?.();
          }
        },
      });
    });
  }

  public checkWin(winAmount: number, lines: WinningLine[]) {
    if (winAmount > 0) {
      this.drawWinningSymbols(lines);
    }
  }

  private startTicker() {
    this.app.ticker.add(() => {
      for (const r of this.reels) {
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
              nextId = Math.floor(Math.random() * this.slotTextures.length);
            }

            s.texture = this.slotTextures[nextId];
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
  }

  public destroy() {
    this.app.destroy(true, true);
  }
}

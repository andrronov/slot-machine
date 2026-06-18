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
import { PAYLINES, SYMBOLS_MAP } from "@slot-machine/shared/config";
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

  private mainContainer: Container;
  private winSymbolGraphics: Graphics;
  private paylinesGraphics: Graphics;

  private gameWidth: number;
  private gameHeight: number;

  constructor() {
    this.app = new Application();
    this.mainContainer = new Container();
    this.winSymbolGraphics = new Graphics();
    this.paylinesGraphics = new Graphics();

    this.gameWidth = REEL_WIDTH * REELS_COUNT + 100;
    this.gameHeight = SYMBOL_SIZE * 4;
  }

  public async init(canvasContainer: HTMLElement) {
    if (!IS_PROD) {
      window.__PIXI_APP__ = this.app;
    }

    await this.app.init({
      backgroundAlpha: 0,
      antialias: true,
      resizeTo: canvasContainer,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    canvasContainer.appendChild(this.app.canvas);

    this.app.stage.addChild(this.mainContainer);

    await this.loadAssets();
    this.buildReels();
    this.startTicker();

    window.addEventListener("resize", this.handleResize);
    this.handleResize();
  }

  private handleResize() {
    const screenWidth = this.app.screen.width;
    const screenHeight = this.app.screen.height;

    const scale = Math.min(
      screenWidth / this.gameWidth,
      screenHeight / this.gameHeight,
    );

    this.mainContainer.scale.set(scale);

    this.mainContainer.x = (screenWidth - this.gameWidth * scale) / 2;
    this.mainContainer.y = (screenHeight - this.gameHeight * scale) / 2;
  }

  private async loadAssets() {
    const urls = Object.values(SYMBOLS_MAP).map((symbol) => symbol.img);

    this.slotTextures = await Promise.all(
      urls.map((url) =>
        Assets.load({
          src: url,
          data: {
            mipmap: true,
          },
        }),
      ),
    );
  }

  private buildGraphics() {
    this.winSymbolGraphics.x = 50;
    this.winSymbolGraphics.y = 0;
    this.mainContainer.addChild(this.winSymbolGraphics);

    this.paylinesGraphics.x = 50;
    this.paylinesGraphics.y = 0;
    this.mainContainer.addChild(this.paylinesGraphics);
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

    this.mainContainer.addChild(mask);
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

    this.mainContainer.addChild(reelContainer);
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

    const colors = [0xff0055, 0x00ff99, 0x00ccff, 0xffaa00, 0xcc00ff, 0xab00ff];

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
      r.textureQueue.push(Math.floor(Math.random() * this.slotTextures.length));

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
    window.removeEventListener("resize", this.handleResize);
    this.app.destroy(true, true);
  }
}

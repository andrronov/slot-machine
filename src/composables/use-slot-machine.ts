import { ref, onUnmounted, type Ref } from "vue";
import {
  Application,
  Assets,
  Container,
  Sprite,
  BlurFilter,
  ResizePlugin,
} from "pixi.js";
import gsap from "gsap";

type Reel = {
  container: Container;
  symbols: Sprite[];
  position: number;
  previousPosition: number;
  blur: BlurFilter;
};

const SYMBOL_SIZE = 80 as const;
const REEL_WIDTH = 90 as const;
const SYMBOLS_PER_REEL = 4 as const;
const REELS_COUNT = 6 as const;

export const useSlotMachine = () => {
  const balance = ref(500);
  const stake = ref(1);
  const isSpinning = ref(false);

  const app = new Application();
  const reels: Reel[] = [];
  let slotTextures: any[] = [];

  const initPixi = async (canvasContainer: HTMLElement) => {
    await app.init({
      // width: 640,
      // height: 360,
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
    reelContainer.y = 100;
    reelContainer.x = 50;

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
  };

  const spin = () => {
    if (isSpinning.value || balance.value < stake.value) return;

    isSpinning.value = true;
    balance.value -= stake.value;

    reels.forEach((r, i) => {
      const extraLoops = Math.floor(Math.random() * 3);
      const targetPosition = r.position + 10 + i * 5 + extraLoops;

      gsap.to(r, {
        position: targetPosition,
        duration: 1.75 + i * 0.6,
        ease: "back.out(0.4)",
        onComplete: () => {
          if (i === reels.length - 1) {
            isSpinning.value = false;
            checkWin();
          }
        },
      });
    });
  };

  const checkWin = () => {
    console.log("Спин окончен. Проверяем матрицу...");
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
            s.texture =
              slotTextures[Math.floor(Math.random() * slotTextures.length)];
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

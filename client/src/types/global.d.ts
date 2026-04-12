import type { Application } from "pixi.js";

declare global {
  interface Window {
    __PIXI_APP__?: Application;
  }
}

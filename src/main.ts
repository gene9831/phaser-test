import Phaser from "phaser";

import HelloWorldScene from "./scenes/HelloWorldScene";
import { TileMapLoader } from "./scenes/tilemap/TileMapLoader";

const config: Phaser.Types.Core.GameConfig = {
  parent: "phaser3",
  type: Phaser.AUTO,
  width: 1152,
  height: 672,
  zoom: 0.75,
  physics: {
    default: "arcade",
    arcade: {
      debug: true,
    },
  },
  scale: {
    autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,
  },
  scene: [TileMapLoader, HelloWorldScene],
};

export default new Phaser.Game(config);

import Phaser from "phaser";
import { AnimatedTile, ShadowManager, SuperMarioBlock } from "~/plugins";
import { addKeys, addSprite } from "./TestAdder";
import { TileMapConfig } from "./tilemap/Types";
import * as path from "path";

export default class HelloWorldScene extends Phaser.Scene {
  private tileMapConfig!: TileMapConfig;

  private elapsedFrames: number = 0;

  private animatedTile?: AnimatedTile;
  private superMarioBlock?: SuperMarioBlock;
  private shadowManager?: ShadowManager;

  private drawDebug = true;
  private debugText?: Phaser.GameObjects.Text;

  constructor() {
    super("hello-world");
  }

  init(data: { tileMapConfig: TileMapConfig }) {
    this.tileMapConfig = data.tileMapConfig;
  }

  preload() {
    this.load.spritesheet("mario", "objects/mario@3x.png", {
      spacing: 3,
      margin: 3,
      frameWidth: 48,
      frameHeight: 48,
    });

    this.load.scenePlugin({
      key: "AnimatedTile",
      url: AnimatedTile,
      sceneKey: "animatedTile",
    });

    this.load.scenePlugin({
      key: "SuperMarioBlock",
      url: SuperMarioBlock,
      sceneKey: "superMarioBlock",
    });

    this.load.scenePlugin({
      key: "ShadowManager",
      url: ShadowManager,
      sceneKey: "shadowManager",
    });
  }

  create() {
    const level = this.make.tilemap({ key: this.tileMapConfig.mapKeys[0] });
    const tilesets = level.tilesets.map((tileset) =>
      level.addTilesetImage(tileset.name, path.join(this.tileMapConfig.setsPath || "", tileset.name))
    );

    const layers = level.layers
      .filter((layerData) => layerData.name.startsWith("地形"))
      .map((layerData) => level.createLayer(layerData.name, tilesets));

    this.animatedTile?.init({ layers, tilesets });
    this.shadowManager?.init({ offsetX: 9, offsetY: 9 });
    this.superMarioBlock?.init({ layers, shadow: { offsetX: 9, offsetY: 9 } });

    const sprite = addSprite(this);
    const keys = addKeys(this, sprite);

    this.shadowManager?.shade(sprite);

    this.physics.add.collider(
      sprite,
      layers,
      this.superMarioBlock?.playerTileCollideCallback,
      this.superMarioBlock?.playerTileProcessCallback,
      this.superMarioBlock
    );
    this.physics.world.setBoundsCollision(true, true, false, false);

    this.cameras.main.setBackgroundColor("#7686ff");
    // this.cameras.main.startFollow(sprite);

    this.events.on("postupdate", this.postUpdate, this);

    this.debugText = this.addDebugText();
  }

  update(t: number, dt: number) {
    this.animatedTile?.update(t, dt, this.elapsedFrames, this.cameras.main);
  }

  postUpdate(t: number, dt: number) {
    this.elapsedFrames += 1;
  }

  private addDebugText() {
    const debugText = this.add
      .text(5, 5, "debug", {
        color: "#FFF",
        fontSize: "24px",
        shadow: {
          offsetX: 1,
          offsetY: 1,
          fill: true,
        },
      })
      .setScrollFactor(0);

    this.input.keyboard.on("keydown-BACKSPACE", () => {
      this.drawDebug = !this.drawDebug;
      this.physics.world.drawDebug = this.drawDebug;
      this.physics.world.debugGraphic.setVisible(this.drawDebug);
      this.debugText?.setActive(this.drawDebug).setVisible(this.drawDebug);
    });

    this.events.on("update", (t: number, dt: number) => {
      if (this.elapsedFrames % 10 === 0) {
        this.debugText?.setText(`fps: ${this.game.loop.actualFps.toFixed(3)}\ndelta: ${dt.toFixed(3)}\n`);
      }
    });

    return debugText;
  }
}

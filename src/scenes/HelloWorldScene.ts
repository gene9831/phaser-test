import Phaser from "phaser";
import { AnimatedTile, SuperMarioBlock } from "~/plugins";
import TileMapUtils from "./tilemap/TileMapUtils";
import { TileMapConfig } from "./tilemap/Types";

type NESController = Record<"left" | "right" | "up" | "down" | "buttonA" | "buttonB", Phaser.Input.Keyboard.Key>;

export default class HelloWorldScene extends Phaser.Scene {
  private tileMapConfig!: TileMapConfig;

  private keys?: NESController;
  private sprite?: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

  private elapsedFrames: number = 0;

  private animatedTile?: AnimatedTile;
  private superMarioBlock?: SuperMarioBlock;

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
  }

  create() {
    const { tilemap: map, tilesets } = TileMapUtils.makeTileMap(this, 0, this.tileMapConfig);

    const layers = map.layers
      .filter((layerData) => layerData.name.startsWith("地形"))
      .map((layerData) => map.createLayer(layerData.name, tilesets));

    this.animatedTile?.init({ layers, tilesets });
    this.superMarioBlock?.init({ layers, shadow: { offsetX: 9, offsetY: 9 } });

    this.keys = this.addKeys();
    this.sprite = this.addSprite();

    this.physics.add.collider(this.sprite, layers, (obj1, obj2: unknown) => {
      const tile = obj2 as Phaser.Tilemaps.Tile;
      if (obj1.body.blocked.up && tile.collideDown && tile.faceBottom) {
        console.log();
        // 顶砖块动画
        console.log(tile);
      }
    });
    this.physics.world.setBoundsCollision(true, true, false, false);

    this.cameras.main.setBackgroundColor("#7686ff");
    // this.cameras.main.startFollow(this.sprite);

    this.debugText = this.addDebugText();
  }

  update(t: number, dt: number) {
    this.animatedTile?.update(t, dt, this.elapsedFrames, this.cameras.main);

    if (this.elapsedFrames % 30 === 0) {
      this.debugText?.setText(`fps: ${this.game.loop.actualFps.toFixed(3)}
delta: ${dt.toFixed(3)}
`);
    }

    this.elapsedFrames += 1;
  }

  private addKeys() {
    const controller = this.input.keyboard.addKeys({
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      buttonA: Phaser.Input.Keyboard.KeyCodes.SPACE,
      buttonB: Phaser.Input.Keyboard.KeyCodes.SHIFT,
    }) as NESController;

    this.events.on("update", () => {
      if (this.sprite) {
        const speed = 200;
        if (controller.left.isDown) {
          this.sprite.setVelocityX(-speed);
        } else if (controller.right.isDown) {
          this.sprite.setVelocityX(speed);
        } else {
          this.sprite.setVelocityX(0);
        }
      }
    });

    controller.buttonA.on("down", () => {
      if (this.sprite?.body.blocked.down) {
        this.sprite.setVelocityY(-800);
      }
    });

    return controller;
  }

  private addSprite() {
    const sprite = this.physics.add
      .sprite(150, this.scale.height - 48 * 2.5, "mario")
      .setGravityY(1000)
      .setMaxVelocity(Infinity, 800)
      .setCollideWorldBounds(true);

    return sprite;
  }

  private removeTile(layer: Phaser.Tilemaps.TilemapLayer, x: number, y: number) {
    const tile = layer.layer.data[y][x];
    tile.destroy();
    // 设置index为-1之后，tile.tileset会变成null
    tile.index = -1;
    tile.setCollision(false);
  }

  private addDebugText() {
    return this.add
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
  }
}

type Properties = {
  /**
   * 是否碰撞。collides 为 true，则四面都会碰撞
   */
  collides?: boolean;
  collideLeft?: boolean;
  collideRight?: boolean;
  collideUp?: boolean;
  collideDown?: boolean;

  /**
   * 是否能被大马里奥顶坏，以及顶坏的碎片 id
   */
  breakable?: boolean;
  brokenPieceId?: number;

  /**
   * 隐藏砖，以及对应的真实 id
   */
  invisible?: boolean;
  visibleId?: number;

  /**
   * 顶砖块，砖块有被顶的动画；动画完成后变成 hitid；还可以设置哪个 tile 为被顶后默认变成的 id
   */
  hitable?: boolean;
  hitId?: number;
  defaultHit?: boolean;
};

type Tile = Phaser.Tilemaps.Tile & {
  shadow?: Phaser.GameObjects.Image;
};

export class SuperMarioBlock extends Phaser.Plugins.ScenePlugin {
  constructor(scene: Phaser.Scene, pluginManager: Phaser.Plugins.PluginManager) {
    super(scene, pluginManager);

    if (!scene.sys.settings.isBooted) {
      scene.sys.events.once("boot", this.boot, this);
    }
  }

  init(data: {
    layers: Phaser.Tilemaps.TilemapLayer[];
    shadow?: {
      offsetX?: number;
      offsetY?: number;
      alpha?: number;
      color?: number;
      depth?: number;
    };
  }) {
    data.layers.forEach((layer) => {
      layer.layer.data.forEach((row) => {
        row
          .filter((tile) => tile.index >= 0)
          .forEach((tile) => {
            const properties = tile.properties as Properties;

            if (properties.collides) {
              tile.setCollision(true);
            } else {
              tile.setCollision(
                properties.collideLeft || false,
                properties.collideRight || false,
                properties.collideUp || false,
                properties.collideDown || false
              );
            }

            if (properties.invisible) {
              tile.setVisible(false);
              tile.index = properties.visibleId ? tile.tileset.firstgid + properties.visibleId : tile.index;
            }

            // 处理 shadow
            const tile_ = tile as Tile;
            if (!tile_.shadow) {
              tile_.shadow = this.scene.add
                .image(
                  tile_.pixelX + tile_.width / 2 + (data.shadow?.offsetX || 0),
                  tile_.pixelY + tile_.height / 2 + (data.shadow?.offsetY || 0),
                  tile_.tileset.image,
                  tile_.index - tile_.tileset.firstgid
                )
                .setOrigin(0.5, 0.5)
                .setRotation(tile_.rotation)
                .setFlip(tile_.flipX, tile_.flipY)
                .setVisible(tile.visible)
                .setTint(data.shadow?.color || 0)
                .setAlpha(data.shadow?.alpha || 0.3)
                .setDepth(data.shadow?.depth || -1);
            }
          });
      });
    });
  }

  boot() {
    const eventEmitter = this.systems.events;

    // eventEmitter.on("update", this.update, this);
    eventEmitter.on("shutdown", this.shutdown, this);
    eventEmitter.on("destroy", this.destroy, this);
  }

  shutdown() {}

  destroy() {
    this.shutdown();
    super.destroy();
  }
}

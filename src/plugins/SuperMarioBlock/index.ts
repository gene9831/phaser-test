import { HittingBlock } from "./HittingBlock";

export class SuperMarioBlock extends Phaser.Plugins.ScenePlugin {
  private shadowGroup: Phaser.GameObjects.Group;

  private hittingBlockGroup: Phaser.GameObjects.Group;

  constructor(scene: Phaser.Scene, pluginManager: Phaser.Plugins.PluginManager) {
    super(scene, pluginManager);

    this.shadowGroup = this.scene.add.group();
    this.hittingBlockGroup = this.scene.add.group();

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
          .forEach((_tile) => {
            const tile = _tile as Tile;
            const properties = tile.properties;

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

            tile.setCollisionCallback(() => {}, this);

            if (properties.invisible) {
              tile.setVisible(false);
              tile.index = properties.visibleId ? tile.tileset.firstgid + properties.visibleId : tile.index;
            }

            // 处理 shadow
            if (!tile.shadow) {
              tile.shadow = this.scene.make
                .image({
                  key: tile.tileset.image,
                  frame: tile.index - tile.tileset.firstgid,
                  x: tile.pixelX + tile.width / 2 + (data.shadow?.offsetX || 0),
                  y: tile.pixelY + tile.height / 2 + (data.shadow?.offsetY || 0),
                  rotation: tile.rotation,
                  flipX: tile.flipX,
                  flipY: tile.flipY,
                  visible: tile.visible,
                  alpha: 0.3,
                  depth: -1,
                })
                .setTint(0);

              this.shadowGroup.add(tile.shadow);
            }
          });
      });
    });
  }

  boot() {
    const eventEmitter = this.systems.events;

    eventEmitter.on("update", this.update, this);
    eventEmitter.on("shutdown", this.shutdown, this);
    eventEmitter.on("destroy", this.destroy, this);
  }

  update(t: number, dt: number) {
    this.hittingBlockGroup.getChildren().forEach((child) => {
      (child as HittingBlock).update(t, dt);
    });
  }

  shutdown() {}

  destroy() {
    this.shutdown();

    this.shadowGroup.destroy(true);

    super.destroy();
  }

  private collidesWidthRatio = 6 / 16;
  playerTileProcessCallback(_player: any, _tile: any) {
    const player = _player as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    const tile = _tile as Tile;

    if (!tile.visible && tile.properties.hitable && tile.bottom < player.body.center.y && player.body.velocity.y < 0) {
      const collidesWidth = player.body.width * this.collidesWidthRatio;

      if (player.body.right - collidesWidth < tile.pixelX || player.body.left + collidesWidth > tile.right) {
        return false;
      }
    }

    return true;
  }

  playerTileCollideCallback(player: Phaser.Types.Physics.Arcade.GameObjectWithBody, _tile: any) {
    if (player.body.blocked.up) {
      const tile1 = _tile as Tile;
      const pBody = player.body;

      const tiles: Tile[] = [];
      const collidesWidth = pBody.width * this.collidesWidthRatio;

      tiles.push(tile1);

      const direction = pBody.left < tile1.pixelX ? -1 : pBody.right > tile1.right ? 1 : 0;
      if (direction !== 0) {
        tile1.tilemap.layers.reverse().find((layerData) => {
          const tile2 = layerData.tilemapLayer.getTileAt(tile1.x + direction, tile1.y);
          if (tile2) {
            tiles.push(tile2);
            return true;
          }
          return false;
        });
      }

      tiles
        .sort((a, b) => a.x - b.x)
        .forEach((tile) => {
          if (
            tile.properties.hitable &&
            pBody.right - collidesWidth >= tile.pixelX &&
            pBody.left + collidesWidth <= tile.right
          ) {
            this.hittingBlockGroup.add(new HittingBlock(this.scene, tile));
          }
        });

      // 顶到边缘补偿一段横向位移
      if (tiles.length === 1) {
        const playerAtLeft = pBody.right - tiles[0].pixelX;
        const playerAtRight = tiles[0].right - pBody.left;

        if (playerAtLeft < collidesWidth) {
          player.body.x = tiles[0].pixelX - player.body.width;
          player.body.velocity.y = player.getData("preUpV");
        } else if (playerAtRight < collidesWidth) {
          player.body.x = tiles[0].right;
          player.body.velocity.y = player.getData("preUpV");
        }
      }
    }
  }
}

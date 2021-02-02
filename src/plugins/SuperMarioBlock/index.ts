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

    // eventEmitter.on("spriteCollidesTile", this.spriteCollidesTile, this);
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
  playerTileCollideCallback(player: Phaser.Types.Physics.Arcade.GameObjectWithBody, _tile: any) {
    return;

    const tile = _tile as Tile;
    const pBody = player.body;

    if (pBody.blocked.up) {
      const collidesWidth = pBody.width * this.collidesWidthRatio;

      if (
        tile.properties.hitable &&
        pBody.right - collidesWidth >= tile.pixelX &&
        pBody.left + collidesWidth <= tile.right
      ) {
        console.log(tile);

        this.hittingBlockGroup.add(new HittingBlock(this.scene, tile));
      }

      // 还要collision check透明砖块
      const offsetX = pBody.left < tile.pixelX ? -1 : pBody.right > tile.right ? 1 : 0;
      if (offsetX !== 0) {
        tile.tilemap.layers.reverse().find((layerData) => {
          const tile2 = layerData.tilemapLayer.getTileAt(tile.x + offsetX, tile.y);
          if (tile2) {
            if (
              tile2.properties.hitable &&
              pBody.right - collidesWidth >= tile2.pixelX &&
              pBody.left + collidesWidth <= tile2.right
            ) {
              console.log(tile2);

              this.hittingBlockGroup.add(new HittingBlock(this.scene, tile2));
            }
            return true;
          }
          return false;
        });
      }
    }
  }

  playerTileProcessCallback(player: Phaser.Types.Physics.Arcade.GameObjectWithBody, _tile: any) {
    const tile = _tile as Tile;
    if (tile.index >= 0 && tile.collideDown && tile.pixelY < player.body.y) {
      console.log(player.body.x, player.body.y);
      console.log(tile.pixelX, tile.pixelY);
      console.log(player.body.velocity);
      // return false;
    }

    return true;

    if (player.body.blocked.up) {
      const tile = _tile as Tile;
      const pBody = player.body;
      const tiles: Tile[] = [];
      const collidesWidth = pBody.width * this.collidesWidthRatio;
      console.log(tile);
      console.log(player.getData("preVelocity"));

      if (
        tile.properties.hitable &&
        pBody.right - collidesWidth >= tile.pixelX &&
        pBody.left + collidesWidth <= tile.right
      ) {
        // console.log(tile);
        // tiles.push(tile);
        // this.hittingBlockGroup.add(new HittingBlock(this.scene, tile));
      }

      // player在被撞击的tile的左边还是右边
      // const direction = pBody.left < tile.pixelX ? -1 : pBody.right > tile.right ? 1 : 0;

      // if (direction !== 0) {
      //   tile.tilemap.layers.reverse().find((layerData) => {
      //     const tile2 = layerData.tilemapLayer.getTileAt(tile.x + direction, tile.y);
      //     if (tile2) {
      //       if (
      //         tile2.properties.hitable &&
      //         pBody.right - collidesWidth >= tile2.pixelX &&
      //         pBody.left + collidesWidth <= tile2.right
      //       ) {
      //         console.log(tile2);
      //         tiles.push(tile2);
      //         // this.hittingBlockGroup.add(new HittingBlock(this.scene, tile2));
      //       }
      //       return true;
      //     } else {
      //       return false;
      //     }
      //   });
      // }
      return false;
      return tiles.length > 0;
    }

    return true;
  }
}

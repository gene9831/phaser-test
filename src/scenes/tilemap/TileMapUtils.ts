import { Tile, TileMapConfig } from "./Types";
import * as path from "path";

export default class TileMapUtils {
  static makeTileMap(scene: Phaser.Scene, key: string | number, tileMapConfig: TileMapConfig) {
    const tilemap = scene.make.tilemap({
      key: typeof key === "string" ? key : tileMapConfig.mapKeys[key],
    });
    const tilesets = tilemap.tilesets.map((tileset) =>
      tilemap.addTilesetImage(tileset.name, path.join(tileMapConfig.setsPath || "", tileset.name))
    );

    return {
      tilemap,
      tilesets,
    };
  }

  // 这个有待优化，或许可以做成插件
  static makeShadow(
    scene: Phaser.Scene,
    layer: Phaser.Tilemaps.TilemapLayer,
    offsetX: number,
    offsetY: number,
    alpha: number = 0.3,
    color: number = 0x0,
    depth: number = -1
  ) {
    layer.layer.data.forEach((row) => {
      row
        .filter((tile) => tile.index >= 0)
        .forEach((tile) => {
          const tile_ = tile as Tile;
          if (tile_.shadowImage) {
            return;
          }
          tile_.shadowImage = scene.add
            .image(
              tile_.pixelX + tile_.width / 2 + offsetX,
              tile_.pixelY + tile_.height / 2 + offsetY,
              tile_.tileset.image,
              tile_.index - tile_.tileset.firstgid
            )
            .setOrigin(0.5, 0.5)
            .setRotation(tile_.rotation)
            .setFlip(tile_.flipX, tile_.flipY)
            .setVisible(tile.visible)
            .setTint(color)
            .setAlpha(alpha)
            .setDepth(depth);
        });
    });
  }
}

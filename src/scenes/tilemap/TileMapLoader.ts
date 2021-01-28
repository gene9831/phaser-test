import * as config from "./config";
import { TileMapConfig } from "./Types";
import * as path from "path";

class TileMapLoader extends Phaser.Scene {
  private tileMapConfig: TileMapConfig;
  private tilesetLoaded: Set<string>;

  constructor() {
    super("tilemap-loader");

    this.tileMapConfig = config.tileMapConfig;
    this.tilesetLoaded = new Set<string>();
  }

  preload() {
    // 加载 tilemaps
    this.load.setPath(this.tileMapConfig.mapPath);
    this.tileMapConfig.mapKeys.forEach((key) => {
      this.load.tilemapTiledJSON(key);
    });
  }

  create() {
    // 加载 tilesets
    this.load.setPath();
    this.tileMapConfig.mapKeys.forEach((key) => {
      if (!this.cache.tilemap.has(key)) {
        console.warn(`tilemap not loaded. key: "${key}"`);
        return;
      }

      (this.cache.tilemap.get(key).data.tilesets as Array<{
        name: string;
        margin: number;
        spacing: number;
        tilewidth: number;
        tileheight: number;
      }>)
        .filter((tileset) => !this.tilesetLoaded.has(tileset.name))
        .forEach((tileset) => {
          this.load.spritesheet({
            // 加上 tilesetsPath 的目的是让 key 唯一
            key: path.join(this.tileMapConfig.setsPath || "", tileset.name),
            frameConfig: {
              margin: tileset.margin,
              spacing: tileset.spacing,
              frameWidth: tileset.tilewidth,
              frameHeight: tileset.tileheight,
            },
          });

          this.tilesetLoaded.add(tileset.name);
        });
    });

    this.load
      .on("complete", () => {
        this.scene.start(config.startScene, {
          tileMapConfig: this.tileMapConfig,
        });
      })
      .start();
  }
}

export { TileMapLoader };

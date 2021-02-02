type Animation = Array<{
  duration: number;
  tileid: number;
  frames: number;
  frameBegin: number;
  frameEnd: number;
}>;
type TileData = { animation: Animation; animationFrames: number };
type IdToTileData = { [key: number]: TileData };
type TileDataOrNull = TileData | undefined;

export class AnimatedTile extends Phaser.Plugins.ScenePlugin {
  private layers?: Phaser.Tilemaps.TilemapLayer[];
  private fps: number = 60;

  constructor(scene: Phaser.Scene, pluginManager: Phaser.Plugins.PluginManager) {
    super(scene, pluginManager);

    if (!scene.sys.settings.isBooted) {
      scene.sys.events.once("boot", this.boot, this);
    }
  }

  init(data: { layers: Phaser.Tilemaps.TilemapLayer[]; tilesets: Phaser.Tilemaps.Tileset[]; fps?: number }) {
    this.layers = data.layers;
    this.fps = data.fps || this.fps;

    data.tilesets.forEach((tileset) => {
      const idToTileData = tileset.tileData as IdToTileData;

      Object.entries(idToTileData).map(([id, tileData]) => {
        let frameEnd = 0;

        tileData.animation.forEach((anim) => {
          if (!anim.frames) {
            anim.frames = Phaser.Math.RoundTo((anim.duration / 1000) * this.fps);
            anim.frameBegin = frameEnd;
            frameEnd += anim.frames;
            anim.frameEnd = frameEnd - 1;
          }

          const data = tileset.getTileData(anim.tileid + tileset.firstgid) as TileDataOrNull;
          if (!data?.animation) {
            idToTileData[anim.tileid] = {
              ...(idToTileData[anim.tileid] || {}),
              animation: tileData.animation,
            };
          }
        });

        tileData.animationFrames = frameEnd;

        return tileData;
      });
    });
  }

  boot() {
    const eventEmitter = this.systems.events;

    // eventEmitter.on("update", this.update, this);
    eventEmitter.on("shutdown", this.shutdown, this);
    eventEmitter.on("destroy", this.destroy, this);
  }

  /**
   *
   * @param t Need to be called manually
   * @param dt
   * @param frames Elapsed frames
   * @param camera
   */
  update(t: number, dt: number, frames: number, camera: Phaser.Cameras.Scene2D.Camera) {
    const currentFrame = frames % this.fps;
    this.layers?.forEach((layer) => {
      layer.layer.data
        .filter((row) => row[0].bottom >= camera.scrollY && row[0].pixelY <= camera.scrollY + camera.height)
        .forEach((row) => {
          row
            .filter((tile) => tile.index >= 0)
            .filter((tile) => tile.right >= camera.scrollX && tile.pixelX <= camera.scrollX + camera.width)
            .forEach((tile) => {
              const data = tile.tileset.getTileData(tile.index) as TileDataOrNull;

              data?.animation?.find((anim) => {
                if (anim.frameBegin <= currentFrame && currentFrame <= anim.frameEnd) {
                  // console.log(anim.tileid);
                  tile.index = anim.tileid + tile.tileset.firstgid;
                  return true;
                }
                return false;
              });
            });
        });
    });
  }

  shutdown() {}

  destroy() {
    this.shutdown();
    super.destroy();
  }
}

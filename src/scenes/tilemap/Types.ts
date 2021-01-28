export type Tile = Phaser.Tilemaps.Tile & {
  shadowImage?: Phaser.GameObjects.Image;
};

export type TileMapConfig = {
  mapPath?: string;
  mapKeys: string[];

  setsPath?: string;
};

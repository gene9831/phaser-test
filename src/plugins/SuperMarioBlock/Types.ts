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

type Tile = Omit<Phaser.Tilemaps.Tile, "properties"> & {
  shadow?: Phaser.GameObjects.Image;
  properties: Properties;
};

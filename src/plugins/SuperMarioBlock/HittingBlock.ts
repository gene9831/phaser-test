export class HittingBlock extends Phaser.GameObjects.Image {
  tile: Tile;

  rising: boolean = true;

  private elapsedFrames = 0;

  private deltaY = (-6 / 64) * 48;
  private deltaDeltaY = (1 / 64) * 48;

  private deltaScale = 0.087;
  private deltaDeltaScale = -0.0145;

  constructor(scene: Phaser.Scene, tile: Tile) {
    super(
      scene,
      tile.pixelX + tile.width / 2,
      tile.pixelY + tile.height / 2,
      tile.tileset.image,
      tile.index - tile.tileset.firstgid
    );
    this.setFlip(tile.flipX, tile.flipY).setRotation(tile.rotation);

    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);

    this.tile = tile;
    this.tile.setVisible(false).setCollision(false);
  }

  update(t: number, dt: number) {
    if (this.elapsedFrames < 13) {
      this.y += this.deltaY;
      this.scale += this.deltaScale;

      if (this.tile.shadow) {
        this.tile.shadow.y += this.deltaY;
        this.tile.shadow.scale += this.deltaScale;
      }

      this.deltaY += this.deltaDeltaY;
      this.deltaScale += this.deltaDeltaScale;
    } else {
      this.tile.setVisible(true).setCollision(true);
      this.destroy();
    }

    if (this.elapsedFrames >= 7) {
      this.rising = false;
    }

    this.elapsedFrames += 1;
  }
}

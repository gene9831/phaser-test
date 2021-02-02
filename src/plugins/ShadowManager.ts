type ShadedObject = (Phaser.Physics.Arcade.Image | Phaser.Physics.Arcade.Sprite) & {
  shadow?: Phaser.GameObjects.Image;
};

type ShadowConfig = {
  key: string | Phaser.Textures.Texture;
  frame: number | string;
  x: number;
  y: number;
  depth: number;
  flipX: boolean;
  flipY: boolean;
  scale: {
    x: number;
    y: number;
  };
  rotation: number;
  alpha: number;
  origin: {
    x: number;
    y: number;
  };
  visible: boolean;
};

export class ShadowManager extends Phaser.Plugins.ScenePlugin {
  offsetX: number;
  offsetY: number;
  alpha: number;
  depth: number;
  tint: number;

  private shadedGroup: Phaser.GameObjects.Group;

  constructor(scene: Phaser.Scene, pluginManager: Phaser.Plugins.PluginManager) {
    super(scene, pluginManager);

    if (!scene.sys.settings.isBooted) {
      scene.sys.events.once("boot", this.boot, this);
    }

    this.offsetX = 0;
    this.offsetY = 0;
    this.alpha = 0.3;
    this.depth = -1;
    this.tint = 0;
    this.shadedGroup = scene.add.group();
  }

  init(data: { offsetX?: number; offsetY?: number }) {
    this.offsetX = data.offsetX || 0;
    this.offsetY = data.offsetY || 0;
  }

  boot() {
    const eventEmitter = this.systems.events;

    // eventEmitter.on("update", this.update, this);
    eventEmitter.on("postupdate", this.postUpdate, this);
    eventEmitter.on("shutdown", this.shutdown, this);
    eventEmitter.on("destroy", this.destroy, this);
  }

  postUpdate(t: number, dt: number) {
    this.shadedGroup.getChildren().forEach((object) => {
      const shaded = object as ShadedObject;
      if (shaded.shadow) {
        this.setShadowConfig(shaded);
      }
    });
  }

  shutdown() {}

  destroy() {
    this.shutdown();
    super.destroy();
  }

  shade(object: Phaser.Physics.Arcade.Image | Phaser.Physics.Arcade.Sprite) {
    const shaded = object as ShadedObject;
    if (!shaded.shadow) {
      shaded.shadow = this.scene.make.image(this.getShadowConfig(shaded)).setTint(this.tint);

      shaded.on("destroy", () => {
        shaded.shadow?.destroy();
      });

      this.shadedGroup.add(shaded);
    }
  }

  private getShadowConfig(object: Phaser.Physics.Arcade.Image | Phaser.Physics.Arcade.Sprite): ShadowConfig {
    return {
      key: object.texture,
      frame: object.frame.name,
      x: object.x + this.offsetX,
      y: object.y + this.offsetY,
      rotation: object.rotation,
      scale: {
        x: object.scaleX,
        y: object.scaleY,
      },
      origin: {
        x: object.originX,
        y: object.originY,
      },
      flipX: object.flipX,
      flipY: object.flipY,
      visible: object.visible,
      alpha: this.alpha,
      depth: this.depth,
    };
  }

  private setShadowConfig(object: ShadedObject) {
    if (!object.shadow) {
      return;
    }

    const config = this.getShadowConfig(object);
    object.shadow
      .setPosition(config.x, config.y)
      .setFrame(config.frame)
      .setRotation(config.rotation)
      .setScale(config.scale.x, config.scale.y)
      .setFlip(config.flipX, config.flipY)
      .setVisible(config.visible);
  }
}

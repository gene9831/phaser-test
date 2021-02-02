export const addSprite = (scene: Phaser.Scene) => {
  const sprite = scene.physics.add
    .sprite(150, scene.scale.height - 48 * 2.5 + 3, "mario")
    .setGravityY(1000)
    .setMaxVelocity(Infinity, 800)
    .setCollideWorldBounds(true)
    .setSize(36, 36);

  sprite.body.offset.y += 3;

  sprite.anims.create({
    key: "idle",
    frames: [{ key: "mario", frame: 0 }],
    repeat: -1,
  });

  sprite.anims.create({
    key: "walk",
    frames: sprite.anims.generateFrameNumbers("mario", {
      start: 2,
      end: 4,
    }),
    frameRate: 12,
  });

  scene.events.on("preupdate", () => {
    if (sprite.body.velocity.y < 0) {
      sprite.setData("preUpV", sprite.body.velocity.y);
    }
  });

  scene.events.on("update", (t: number, dt: number) => {
    const vx = sprite.body.velocity.x;
    if (vx === 0) {
      sprite.anims.play("idle", true);
    } else {
      sprite.setFlipX(vx <= 0);
      sprite.anims.play("walk", true);
    }
  });

  return sprite;
};

type NESController = Record<"left" | "right" | "up" | "down" | "buttonA" | "buttonB", Phaser.Input.Keyboard.Key>;

export const addKeys = (scene: Phaser.Scene, sprite: Phaser.Physics.Arcade.Sprite) => {
  const controller = scene.input.keyboard.addKeys({
    left: Phaser.Input.Keyboard.KeyCodes.A,
    right: Phaser.Input.Keyboard.KeyCodes.D,
    up: Phaser.Input.Keyboard.KeyCodes.W,
    down: Phaser.Input.Keyboard.KeyCodes.S,
    buttonA: Phaser.Input.Keyboard.KeyCodes.SPACE,
    buttonB: Phaser.Input.Keyboard.KeyCodes.SHIFT,
  }) as NESController;

  scene.events.on("update", () => {
    if (sprite.scene) {
      const speed = 60 * 3;
      // const speed = 90 * 3;
      if (controller.left.isDown) {
        sprite.setVelocityX(-speed);
      } else if (controller.right.isDown) {
        sprite.setVelocityX(speed);
      } else {
        sprite.setVelocityX(0);
      }
    }
  });

  controller.buttonA.on("down", () => {
    if (sprite?.body.blocked.down) {
      sprite.setVelocityY(-800);
    }
  });

  return controller;
};

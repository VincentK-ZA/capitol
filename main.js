// Initialize kontra

import { createBasicSprite } from "./units/basic.js";

// This assumes kontra is loaded as a global variable from the script tag
const { init, Sprite, GameLoop } = kontra;

const { canvas } = init();

const sprite = createBasicSprite({ canvas });

// Create the game loop
const loop = GameLoop({
  update: function () {
    sprite.update();

    // Loop the sprite around the canvas
    sprite.move();
  },
  render: function () {
    sprite.render();
  },
});

// Start the game loop
loop.start();

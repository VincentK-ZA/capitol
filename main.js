// Initialize kontra

import { createBasicSprite } from "./units/basic.js";
import { UnitSelection } from "./unit_selection.js";

// This assumes kontra is loaded as a global variable from the script tag
const { init, Sprite, GameLoop } = kontra;

const { canvas, context } = init();

// Create multiple sprites
const sprites = [];
for (let i = 0; i < 5; i++) {
  const s = createBasicSprite({ canvas });
  s.x = 50 + Math.random() * (canvas.width - 100);
  s.y = 50 + Math.random() * (canvas.height - 100);
  s.dx = 1 + Math.random() * 2;
  sprites.push(s);
}

// Initialize unit selection
const unitSelection = new UnitSelection(canvas, sprites);

// Create the game loop
const loop = GameLoop({
  update: function () {
    sprites.forEach((sprite) => {
      sprite.update();
      sprite.move();
    });
  },
  render: function () {
    sprites.forEach((sprite) => sprite.render());

    // Draw selection box
    unitSelection.render(context);
  },
});

// Start the game loop
loop.start();

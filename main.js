// Initialize kontra
// This assumes kontra is loaded as a global variable from the script tag
const { init, Sprite, GameLoop } = kontra;

const { canvas } = init();

// Create a red sprite
const sprite = Sprite({
  x: 100,
  y: 80,
  color: "red",
  width: 20,
  height: 40,
  dx: 2, // Move 2 pixels to the right every frame
});

// Create the game loop
const loop = GameLoop({
  update: function () {
    sprite.update();

    // Loop the sprite around the canvas
    if (sprite.x > canvas.width) {
      sprite.x = -sprite.width;
    }
  },
  render: function () {
    sprite.render();
  },
});

// Start the game loop
loop.start();

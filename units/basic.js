const { init, Sprite, GameLoop } = kontra;

export const createBasicSprite = ({ canvas }) => {
  const basicSprite = Sprite({
    x: 100,
    y: 80,
    color: "red",
    width: 20,
    height: 40,
    dx: 2, // Move 2 pixels to the right every frame
  });

  basicSprite.move = function () {
    if (this.x > canvas.width) {
      this.x = -this.width;
    }
  };

  return basicSprite;
};

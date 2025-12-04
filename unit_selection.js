export class UnitSelection {
  constructor(canvas, sprites) {
    this.canvas = canvas;
    this.sprites = sprites;
    this.isDragging = false;
    this.dragStart = { x: 0, y: 0 };
    this.dragEnd = { x: 0, y: 0 };
    this.selectedSprites = [];

    this.initListeners();
  }

  initListeners() {
    this.canvas.addEventListener("mousedown", (e) => this.onMouseDown(e));
    this.canvas.addEventListener("mousemove", (e) => this.onMouseMove(e));
    this.canvas.addEventListener("mouseup", (e) => this.onMouseUp(e));
  }

  rectIntersect(r1, r2) {
    return !(
      r2.x > r1.x + r1.width ||
      r2.x + r2.width < r1.x ||
      r2.y > r1.y + r1.height ||
      r2.y + r2.height < r1.y
    );
  }

  onMouseDown(e) {
    const rect = this.canvas.getBoundingClientRect();
    this.dragStart = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    this.dragEnd = { ...this.dragStart };
    this.isDragging = true;

    // Clear selection on new click
    this.selectedSprites.forEach((s) => (s.color = "red"));
    this.selectedSprites = [];
  }

  onMouseMove(e) {
    if (!this.isDragging) return;
    const rect = this.canvas.getBoundingClientRect();
    this.dragEnd = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  onMouseUp(e) {
    if (!this.isDragging) return;
    this.isDragging = false;

    // Calculate selection box
    const x = Math.min(this.dragStart.x, this.dragEnd.x);
    const y = Math.min(this.dragStart.y, this.dragEnd.y);
    const width = Math.abs(this.dragEnd.x - this.dragStart.x);
    const height = Math.abs(this.dragEnd.y - this.dragStart.y);
    const selectionRect = { x, y, width, height };

    // Find selected sprites
    this.sprites.forEach((sprite) => {
      if (this.rectIntersect(selectionRect, sprite)) {
        this.selectedSprites.push(sprite);
        sprite.color = "yellow"; // Highlight selected
      }
    });
  }

  render(context) {
    if (this.isDragging) {
      context.strokeStyle = "white";
      context.lineWidth = 1;
      const width = this.dragEnd.x - this.dragStart.x;
      const height = this.dragEnd.y - this.dragStart.y;
      context.strokeRect(this.dragStart.x, this.dragStart.y, width, height);
    }
  }
}

// Initialize kontra

import { createBasicSprite } from "./units/basic.js";

// This assumes kontra is loaded as a global variable from the script tag
const { init, Sprite, GameLoop } = kontra;

const { canvas, context } = init();

// Grid settings
const GRID_SIZE = 40;

// Create multiple units for demonstration
const units = [
  createBasicSprite({
    canvas,
    playerId: 1,
    x: 2 * GRID_SIZE,
    y: 5 * GRID_SIZE,
    gridSize: GRID_SIZE,
  }),
  createBasicSprite({
    canvas,
    playerId: 1,
    x: 3 * GRID_SIZE,
    y: 7 * GRID_SIZE,
    gridSize: GRID_SIZE,
  }),
  createBasicSprite({
    canvas,
    playerId: 2,
    x: 15 * GRID_SIZE,
    y: 6 * GRID_SIZE,
    gridSize: GRID_SIZE,
  }),
  createBasicSprite({
    canvas,
    playerId: 2,
    x: 16 * GRID_SIZE,
    y: 8 * GRID_SIZE,
    gridSize: GRID_SIZE,
  }),
];

// Game state
let showDamageRadius = false;
let showGrid = true;
let gameTime = 0;
let selectedUnit = 0; // Index of currently selected unit

// Keyboard controls
const keys = {};
window.addEventListener("keydown", (e) => {
  keys[e.key] = true;

  // Toggle options
  if (e.key === "r" || e.key === "R") {
    showDamageRadius = !showDamageRadius;
    console.log("Damage radius visibility:", showDamageRadius ? "ON" : "OFF");
  }
  if (e.key === "g" || e.key === "G") {
    showGrid = !showGrid;
    console.log("Grid visibility:", showGrid ? "ON" : "OFF");
  }

  // Unit selection
  if (e.key >= "1" && e.key <= "9") {
    const unitIndex = parseInt(e.key) - 1;
    if (unitIndex < units.length && units[unitIndex].health > 0) {
      selectedUnit = unitIndex;
      console.log(`Selected unit ${unitIndex + 1}`);
    }
  }

  // Movement controls for selected unit
  if (units[selectedUnit] && units[selectedUnit].health > 0) {
    const unit = units[selectedUnit];

    // Arrow keys and WASD for movement
    switch (e.key) {
      case "ArrowUp":
      case "w":
      case "W":
        unit.moveInDirection("up");
        break;
      case "ArrowDown":
      case "s":
      case "S":
        unit.moveInDirection("down");
        break;
      case "ArrowLeft":
      case "a":
      case "A":
        unit.moveInDirection("left");
        break;
      case "ArrowRight":
      case "d":
      case "D":
        unit.moveInDirection("right");
        break;
      // Diagonal movement
      case "q":
      case "Q":
        unit.moveInDirection("up-left");
        break;
      case "e":
      case "E":
        unit.moveInDirection("up-right");
        break;
      case "z":
      case "Z":
        unit.moveInDirection("down-left");
        break;
      case "c":
      case "C":
        unit.moveInDirection("down-right");
        break;
    }
  }
});

window.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

// Function to render grid
function renderGrid(context, canvas, gridSize) {
  if (!showGrid) return;

  context.strokeStyle = "rgba(100, 100, 100, 0.3)";
  context.lineWidth = 1;

  // Vertical lines
  for (let x = 0; x <= canvas.width; x += gridSize) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, canvas.height);
    context.stroke();
  }

  // Horizontal lines
  for (let y = 0; y <= canvas.height; y += gridSize) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(canvas.width, y);
    context.stroke();
  }
}

// Create the game loop
const loop = GameLoop({
  update: function (dt) {
    gameTime += dt;

    // Update all units
    for (let i = units.length - 1; i >= 0; i--) {
      const unit = units[i];

      // Update movement animation
      unit.updateMovement(dt);

      // Regular sprite update (for built-in properties)
      unit.update();

      // Get enemies for this unit
      const enemies = units.filter(
        (other) => other.playerId !== unit.playerId && other.health > 0
      );

      // Update combat
      const isAlive = unit.updateCombat(enemies, gameTime * 1000);

      // Remove dead units and update selected unit if needed
      if (!isAlive) {
        console.log(`Removing destroyed unit ${unit.playerId}`);
        if (i === selectedUnit && selectedUnit > 0) {
          selectedUnit--;
        } else if (i < selectedUnit) {
          selectedUnit--;
        }
        units.splice(i, 1);
      }
    }

    // Ensure selected unit is valid
    if (selectedUnit >= units.length) {
      selectedUnit = Math.max(0, units.length - 1);
    }
  },
  render: function () {
    // Clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Render grid
    renderGrid(context, canvas, GRID_SIZE);

    // Render all units
    units.forEach((unit, index) => {
      if (unit.health > 0) {
        // Render damage radius if enabled
        unit.renderDamageRadius(context, showDamageRadius);

        // Highlight selected unit's grid
        if (index === selectedUnit) {
          context.fillStyle = "rgba(255, 255, 0, 0.3)";
          context.fillRect(
            unit.gridX * GRID_SIZE,
            unit.gridY * GRID_SIZE,
            GRID_SIZE,
            GRID_SIZE
          );
        }

        // Render grid highlight
        unit.renderGridHighlight(context);

        // Render unit
        unit.render();

        // Render health bar
        unit.renderHealthBar(context);
      }
    });

    // Render UI
    context.fillStyle = "white";
    context.font = "16px Arial";
    context.fillText(
      `Units alive: ${units.filter((u) => u.health > 0).length}`,
      10,
      30
    );
    context.fillText("Controls:", 10, 60);
    context.fillText(
      "1-9: Select unit | WASD/Arrows: Move | Q/E/Z/C: Diagonal",
      10,
      80
    );
    context.fillText("R: Toggle damage radius | G: Toggle grid", 10, 100);

    // Show selected unit info
    if (units[selectedUnit]) {
      context.fillText(
        `Selected: Unit ${selectedUnit + 1} (Player ${
          units[selectedUnit].playerId
        })`,
        10,
        130
      );
      context.fillText(
        `Health: ${units[selectedUnit].health}/${units[selectedUnit].maxHealth}`,
        10,
        150
      );
      context.fillText(
        `Position: (${units[selectedUnit].gridX}, ${units[selectedUnit].gridY})`,
        10,
        170
      );
    }

    // Show unit counts by team
    const team1Alive = units.filter(
      (u) => u.playerId === 1 && u.health > 0
    ).length;
    const team2Alive = units.filter(
      (u) => u.playerId === 2 && u.health > 0
    ).length;
    context.fillText(`Red Team: ${team1Alive}`, 10, 200);
    context.fillText(`Blue Team: ${team2Alive}`, 10, 220);
  },
});

// Start the game loop
loop.start();

console.log("Game started! Press 'R' to toggle damage radius visibility");

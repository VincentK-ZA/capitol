const { init, Sprite, GameLoop } = kontra;

export const createBasicSprite = ({
  canvas,
  playerId = 1,
  x = 100,
  y = 80,
  gridSize = 40,
}) => {
  const basicSprite = Sprite({
    x: x,
    y: y,
    color: playerId === 1 ? "red" : "blue",
    width: 20,
    height: 20, // Square units for grid movement
    dx: 0,
    dy: 0,

    // Grid movement properties
    gridSize: gridSize,
    gridX: Math.floor(x / gridSize),
    gridY: Math.floor(y / gridSize),
    targetX: x,
    targetY: y,
    moveSpeed: 200, // pixels per second
    isMoving: false,

    // Combat properties
    maxHealth: 100,
    health: 100,
    damageRadius: 60, // Radius within which damage is dealt
    minDamage: 10,
    maxDamage: 25,
    lastDamageTime: 0,
    damageInterval: 1000, // Deal damage every 1000ms
    playerId: playerId,

    // Visual feedback
    flashTimer: 0,
    originalColor: playerId === 1 ? "red" : "blue",
  });

  // Move to a grid position
  basicSprite.moveToGrid = function (gridX, gridY) {
    if (this.isMoving || this.health <= 0) return false;

    // Check bounds
    const maxGridX = Math.floor(canvas.width / this.gridSize) - 1;
    const maxGridY = Math.floor(canvas.height / this.gridSize) - 1;

    if (gridX < 0 || gridX > maxGridX || gridY < 0 || gridY > maxGridY) {
      return false;
    }

    this.gridX = gridX;
    this.gridY = gridY;
    this.targetX = gridX * this.gridSize;
    this.targetY = gridY * this.gridSize;
    this.isMoving = true;

    return true;
  };

  // Move in a direction (8-directional)
  basicSprite.moveInDirection = function (direction) {
    if (this.isMoving || this.health <= 0) return false;

    let newGridX = this.gridX;
    let newGridY = this.gridY;

    switch (direction) {
      case "up":
        newGridY--;
        break;
      case "down":
        newGridY++;
        break;
      case "left":
        newGridX--;
        break;
      case "right":
        newGridX++;
        break;
      case "up-left":
        newGridX--;
        newGridY--;
        break;
      case "up-right":
        newGridX++;
        newGridY--;
        break;
      case "down-left":
        newGridX--;
        newGridY++;
        break;
      case "down-right":
        newGridX++;
        newGridY++;
        break;
      default:
        return false;
    }

    return this.moveToGrid(newGridX, newGridY);
  };

  // Update smooth movement animation
  basicSprite.updateMovement = function (dt) {
    if (!this.isMoving) return;

    const deltaX = this.targetX - this.x;
    const deltaY = this.targetY - this.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (distance < 2) {
      // Snap to target
      this.x = this.targetX;
      this.y = this.targetY;
      this.isMoving = false;
    } else {
      // Move towards target
      const moveDistance = this.moveSpeed * dt;
      this.x += (deltaX / distance) * moveDistance;
      this.y += (deltaY / distance) * moveDistance;
    }
  };

  // Check if this unit is within damage radius of another unit
  basicSprite.isWithinDamageRadius = function (otherUnit) {
    if (this.playerId === otherUnit.playerId) return false; // Same team, no damage

    const dx = this.x - otherUnit.x;
    const dy = this.y - otherUnit.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    return distance <= this.damageRadius;
  };

  // Deal random damage to this unit
  basicSprite.takeDamage = function (attacker) {
    const damage =
      Math.floor(
        Math.random() * (attacker.maxDamage - attacker.minDamage + 1)
      ) + attacker.minDamage;
    this.health -= damage;

    // Visual feedback - flash white when taking damage
    this.color = "white";
    this.flashTimer = 200; // Flash for 200ms

    console.log(
      `Unit ${this.playerId} took ${damage} damage! Health: ${this.health}`
    );

    if (this.health <= 0) {
      this.health = 0;
      console.log(`Unit ${this.playerId} destroyed!`);
    }

    return damage;
  };

  // Update method for combat and visual effects
  basicSprite.updateCombat = function (enemies, currentTime) {
    // Handle flash effect
    if (this.flashTimer > 0) {
      this.flashTimer -= 16; // Assuming 60fps
      if (this.flashTimer <= 0) {
        this.color = this.originalColor;
      }
    }

    // Check if unit is dead
    if (this.health <= 0) {
      return false; // Signal that this unit should be removed
    }

    // Deal damage to nearby enemies
    if (currentTime - this.lastDamageTime >= this.damageInterval) {
      enemies.forEach((enemy) => {
        if (this.isWithinDamageRadius(enemy) && enemy.health > 0) {
          enemy.takeDamage(this);
          this.lastDamageTime = currentTime;
        }
      });
    }

    return true; // Unit is still alive
  };

  // Render health bar
  basicSprite.renderHealthBar = function (context) {
    if (this.health <= 0) return;

    const barWidth = this.width;
    const barHeight = 4;
    const barX = this.x;
    const barY = this.y - 10;

    // Background (red)
    context.fillStyle = "red";
    context.fillRect(barX, barY, barWidth, barHeight);

    // Health (green)
    const healthPercent = this.health / this.maxHealth;
    context.fillStyle = "green";
    context.fillRect(barX, barY, barWidth * healthPercent, barHeight);

    // Border
    context.strokeStyle = "black";
    context.lineWidth = 1;
    context.strokeRect(barX, barY, barWidth, barHeight);
  };

  // Render damage radius (for debugging)
  basicSprite.renderDamageRadius = function (context, showRadius = false) {
    if (!showRadius || this.health <= 0) return;

    context.strokeStyle =
      this.playerId === 1 ? "rgba(255, 0, 0, 0.3)" : "rgba(0, 0, 255, 0.3)";
    context.lineWidth = 1;
    context.beginPath();
    context.arc(
      this.x + this.width / 2,
      this.y + this.height / 2,
      this.damageRadius,
      0,
      2 * Math.PI
    );
    context.stroke();
  };

  // Render grid position indicator
  basicSprite.renderGridHighlight = function (context) {
    if (this.health <= 0) return;

    context.strokeStyle =
      this.playerId === 1 ? "rgba(255, 0, 0, 0.5)" : "rgba(0, 0, 255, 0.5)";
    context.lineWidth = 2;
    context.strokeRect(
      this.gridX * this.gridSize,
      this.gridY * this.gridSize,
      this.gridSize,
      this.gridSize
    );
  };

  return basicSprite;
};

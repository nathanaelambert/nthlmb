// js/LineOfSight.js
export class LineOfSight {
    constructor(audioSpace) {
      this.audioSpace = audioSpace;
      // Start with initial values
      this.display_x = audioSpace.finger_x;
      this.display_y = audioSpace.finger_y;
      this.display_direction = audioSpace.direction_facing;
      this.target_x = this.display_x;
      this.target_y = this.display_y;
      this.target_direction = this.display_direction;
      this.animate();
    }
  
    update({ finger_x, finger_y, direction_facing }) {
      // Set the new target position and direction
      this.target_x = finger_x;
      this.target_y = finger_y;
      this.target_direction = direction_facing;
    }
  
    animate() {
      // Easing factor (0.1 = slow, 1 = instant)
      const ease = 0.15;
      // Move display position toward target
      this.display_x += (this.target_x - this.display_x) * ease;
      this.display_y += (this.target_y - this.display_y) * ease;
      this.display_direction += (this.target_direction - this.display_direction) * ease;
  
      // Draw the line
      const { ctx, width, height } = this.audioSpace;
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = "#00FFAA";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(this.display_x, this.display_y);
      const length = Math.max(width, height);
      const end_x = this.display_x + length * Math.cos(this.display_direction);
      const end_y = this.display_y + length * Math.sin(this.display_direction);
      ctx.lineTo(end_x, end_y);
      ctx.stroke();
  
      // Continue animation
      requestAnimationFrame(() => this.animate());
    }
  }
  
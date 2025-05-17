// Helper function for shortest angle interpolation
function lerpAngle(a, b, t) {
    let diff = b - a;
    while (diff < -Math.PI) diff += 2 * Math.PI;
    while (diff > Math.PI) diff -= 2 * Math.PI;
    return a + diff * t;
  }
  
  class LineOfSight {
    constructor(audioSpace) {
      this.audioSpace = audioSpace;
      this.display_x = audioSpace.finger_x;
      this.display_y = audioSpace.finger_y;
      this.display_direction = audioSpace.direction_facing;
      this.target_x = this.display_x;
      this.target_y = this.display_y;
      this.target_direction = this.display_direction;
      this.animate();
    }
  
    update({ finger_x, finger_y, direction_facing }) {
      this.target_x = finger_x;
      this.target_y = finger_y;
      this.target_direction = direction_facing;
    }
  
    animate() {
      const ease = 0.15;
      this.display_x += (this.target_x - this.display_x) * ease;
      this.display_y += (this.target_y - this.display_y) * ease;
      this.display_direction = lerpAngle(this.display_direction, this.target_direction, ease);
  
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
  
      requestAnimationFrame(() => this.animate());
    }
  }
  
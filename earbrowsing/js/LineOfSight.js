// js/LineOfSight.js
export class LineOfSight {
    constructor(audioSpace) {
      this.audioSpace = audioSpace;
    }
    update({ finger_x, finger_y, direction_facing }) {
      const { ctx, width, height } = this.audioSpace;
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = "#00FFAA";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(finger_x, finger_y);
      const length = Math.max(width, height);
      const end_x = finger_x + length * Math.cos(direction_facing);
      const end_y = finger_y + length * Math.sin(direction_facing);
      ctx.lineTo(end_x, end_y);
      ctx.stroke();
    }
  }
  
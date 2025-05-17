import { Observable } from './Observable.js';

export class TouchMovement extends Observable {
  constructor(container) {
    super();
    this.container = container;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.direction_facing = 0;
    this.finger_x = this.width / 2;
    this.finger_y = this.height / 2;

    this.canvas = document.createElement('canvas');
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.canvas.style.width = '100vw';
    this.canvas.style.height = '100vh';
    this.ctx = this.canvas.getContext('2d');
    this.container.appendChild(this.canvas);

		this.lastTimestamp = null;
		this.finger_speed = 0;
    this.isTouching = false;
    this.lastX = null;
    this.lastY = null;

    this.canvas.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false });
    this.canvas.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
    this.canvas.addEventListener('touchend', this.onTouchEnd.bind(this), { passive: false });

    window.addEventListener('resize', () => this.onResize());
  }

  onResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.notify(this.getState());
  }

  getState() {
		return {
			finger_x: this.finger_x,
			finger_y: this.finger_y,
			direction_facing: this.direction_facing,
			finger_speed: this.finger_speed,
			width: this.width,
			height: this.height
		};
	}

  onTouchStart(e) {
		e.preventDefault();
		const touch = e.touches[0];
		this.isTouching = true;
		this.finger_x = touch.clientX;
		this.finger_y = touch.clientY;
		this.lastX = touch.clientX;
		this.lastY = touch.clientY;
		this.lastTimestamp = performance.now();
		this.finger_speed = 0;
		this.notify(this.getState());
	}
	
	onTouchMove(e) {
		e.preventDefault();
		if (!this.isTouching) return;
		const touch = e.touches[0];
		const now = performance.now();
		const dx = touch.clientX - this.lastX;
		const dy = touch.clientY - this.lastY;
		const dt = (now - this.lastTimestamp) / 1000; // seconds
	
		if (dx !== 0 || dy !== 0) {
			this.direction_facing = Math.atan2(dy, dx);
			// Calculate speed (pixels per second)
			const distance = Math.sqrt(dx * dx + dy * dy);
			this.finger_speed = dt > 0 ? distance / dt : 0;
		}
	
		this.finger_x = touch.clientX;
		this.finger_y = touch.clientY;
		this.lastX = touch.clientX;
		this.lastY = touch.clientY;
		this.lastTimestamp = now;
		this.notify(this.getState());
	}
	
	onTouchEnd(e) {
		e.preventDefault();
		this.isTouching = false;
		this.finger_speed = 0;
	}
	
}

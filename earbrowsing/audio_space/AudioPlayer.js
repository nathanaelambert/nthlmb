import * as Tone from "tone";

export class AudioPlayer {
  constructor(div) {
    this.div = div;
    this.listener = Tone.Listener;
    this.activePlayers = [];
    this.scheduledEvents = [];
    this.isStarted = false;
  }

  // Converts canvas coordinates to Tone.js 3D space (z=0 for 2D)
  _canvasTo3D(x, y) {
    // Example: map canvas (0,0) top-left to (-1,1), bottom-right to (1,-1)
    const rect = this.div.getBoundingClientRect();
    return [
      ((x - rect.left) / rect.width) * 2 - 1,
      -(((y - rect.top) / rect.height) * 2 - 1),
      0
    ];
  }

  // Places the listener at (x, y) coordinates on the canvas
  place_listener(x, y) {
    const [lx, ly, lz] = this._canvasTo3D(x, y);
    this.listener.positionX.value = lx;
    this.listener.positionY.value = ly;
    this.listener.positionZ.value = lz;
  }

  // Schedules an audio file to play spatialized along a path
  async schedule_audio(audio, time_start, path2d, height = 0) {
    if (!this.isStarted) {
      await Tone.start();
      this.isStarted = true;
    }
  
    const player = new Tone.Player(audio).toDestination();
    await Tone.loaded();
  
    // Set the initial z coordinate to the given height
    const panner = new Tone.Panner3D({
      positionX: 0,
      positionY: 0,
      positionZ: height
    });
    player.connect(panner);
    panner.toDestination();
  
    const duration = player.buffer.duration;
    const totalLength = path2d.totalLength();
    const points = path2d.points;
    if (points.length < 2) return;
  
    let startTime = Tone.now() + time_start;
  
    function interpolate(p1, p2, t) {
      return new Point2D(
        p1.x + (p2.x - p1.x) * t,
        p1.y + (p2.y - p1.y) * t
      );
    }
  
    const steps = Math.ceil(duration * 60);
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      let dist = t * totalLength;
      let segLen = 0, idx = 0;
      while (idx < points.length - 1) {
        const d = Path2D.distance(points[idx], points[idx + 1]);
        if (segLen + d >= dist) break;
        segLen += d;
        idx++;
      }
      const segT = (dist - segLen) / Path2D.distance(points[idx], points[idx + 1]);
      const pos = interpolate(points[idx], points[idx + 1], segT);
      const [px, py] = this._canvasTo3D(pos.x, pos.y);
  
      // Keep height (z) fixed
      Tone.Transport.scheduleOnce((time) => {
        panner.positionX.linearRampTo(px, 0.05, time);
        panner.positionY.linearRampTo(py, 0.05, time);
        panner.positionZ.linearRampTo(height, 0.05, time); // fixed z
      }, startTime + t * duration);
    }
  
    Tone.Transport.scheduleOnce((time) => {
      player.start(time);
      this.activePlayers.push(player);
    }, startTime);
  
    Tone.Transport.scheduleOnce((time) => {
      player.stop(time);
      player.disconnect();
      panner.disconnect();
      this.activePlayers = this.activePlayers.filter(p => p !== player);
    }, startTime + duration);
  
    this.scheduledEvents.push(player);
  }
  

  // Stops all playing and scheduled audios
  stop_all() {
    this.activePlayers.forEach(player => {
      player.stop();
      player.disconnect();
    });
    this.activePlayers = [];
    this.scheduledEvents.forEach(event => Tone.Transport.clear(event));
    this.scheduledEvents = [];
  }
}

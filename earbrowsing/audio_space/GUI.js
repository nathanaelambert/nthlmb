import { Point2D, closestPointInRectangle } from './math.js';
import { items } from './items.js';

function buildSoundMap(items) {
  const map = {};
  for (const item of items) {
    // Encode for file path
    const type = encodeURIComponent(item.type.trim());
    const content = encodeURIComponent(item.content.trim());
    // e.g. ./sounds/buttons/about.mp3 or ./sounds/texts/add%20to%20cart.mp3
    const path = `./sounds/${type}s/${content}.mp3`;
    // Use a composite key for easy lookup
    map[`${item.type}:${item.content}`] = path;
  }
  // Add instruction sounds
  const instructionContents = [
    'double tap to activate',
    'find the button',
    'find the text',
    'use a single tap on the screen to scan from that area'
  ];

  for (const keyContent of instructionContents) {
    const encodedContent = encodeURIComponent(keyContent);
    const path = `./sounds/instructions/${encodedContent}.mp3`;
    map[`instruction:${keyContent}`] = path;
  }

  map['kick'] = './sounds/kick-11.wav';
  map['half-click'] = './sounds/half-click.mp3'

  return map;
}

const REF_DISTANCE = 1;
const ROLL_OFF = 2.5;
const MAX_VERTICAL_DISTANCE = 50;


export class GUI {
  constructor(gameLogic, level, canvas) {
    this.gameLogic = gameLogic;
    this.level = level;
    this.canvas = canvas;
    this._setupCanvasEvents();
    this._loadToken = 0;
    this.listenerPosition = {x: canvas.width / 2, y: canvas.height / 2, z: 0};
    this.gameLogic.addObserver(this);
    this.panners = {};
    this.currentRectKey = null;
    

    // Build the sound map and preload all sounds
    this.soundMap = buildSoundMap(items);
    this.playersLoaded = new Promise((resolve) => {
      this.players = new Tone.Players(this.soundMap, () => {
        console.log('All sounds loaded!');
        this.gameLogic.assets_loaded();
        if (gameLogic.getButtonStarted()) {
          this._hide_intro();
        }
        resolve();
      }).toDestination();
    });
    

    // Optionally, handle canvas resize
    window.addEventListener('resize', () => this.onCanvasResize());
  }

  _hide_intro() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.style.display = 'none';
  }



  update({ phase }) {
    if (phase === 'instructions') {
      // Stop sounds if needed
      this.stop_sounds();
      this._hide_intro();
    } else if (phase === 'search') {
      this.start_sounds();
      // Could start sounds here if desired
    } else if (phase === 'new game') {
      this.stop_sounds();
    }
  }

  // Start and loop 3D sounds for each element
  async start_sounds() {
    await this.playersLoaded;
    this.stop_sounds();
    this.panners = {};

    // Set listener position at canvas center (z=0)
    
    const elements = this.level.getLevel();
    
    for (const e of elements) {
      if (!e.item || typeof e.item.type !== 'string' || typeof e.item.content !== 'string' ||
        !e.item.type.trim() || !e.item.content.trim()) {
          console.error('Skipped invalid item:', e.item);
          continue;
        }

        // Composite key for lookup
        const key = `${e.item.type}:${e.item.content}`;
        const player = this.players.player(key);
        
        if (!player.buffer.loaded) {
          console.warn(`Sound not loaded for: ${key}`);
          continue;
        }
        
        const x = (e.rectangle.x1 + e.rectangle.x2) / 2;
        const y = (e.rectangle.y1 + e.rectangle.y2) / 2;
        const z = (e.rectangle.x2 - e.rectangle.x1) * (e.rectangle.y2 - e.rectangle.y1);
        const dx = x - this.listenerPosition.x;
        const dy = y - this.listenerPosition.y;
        const dz = z - this.listenerPosition.z;
        const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);
        // console.log(`Distance from listener to sound: ${distance}`);
        const panner = new Tone.Panner3D({
          positionX: x * 0.066,
          positionY: y * 0.066,
          positionZ: 0,
          panningModel: 'HRTF',
          distanceModel: 'inverse',
          maxDistance: 50,  // smaller value for testing
          refDistance: REF_DISTANCE,
          rolloffFactor: ROLL_OFF
        }).toDestination();
        this.panners[key] = panner;
        
        player.disconnect();
        player.connect(panner);
        player.loop = true;
        player.start();
        // console.log(`Started sound (panner at listener): ${key}`);
      }
      
    this._drawSoundAndListenerMarkers();
  }




  async play_instructions() {
    await Tone.start();
    this.stop_sounds();

    const secret = this.gameLogic.getSecretItem();
    const player1 = this.players.player(`instruction:find the ${secret.type}`);
    const player2 = new Tone.Player(`./sounds/${secret.type}s/${secret.content}.mp3`).toDestination();

    await Tone.loaded();

    // Get durations
    const duration1 = player1.buffer.duration;
    const duration2 = player2.buffer.duration;

    // Start player1
    player1.start(0);

    // Schedule player2 to start after player1 finishes
    setTimeout(() => {
        player2.start();
    }, duration1 * 1000);

    // Wait until both sounds have finished playing
    await new Promise(resolve => {
        setTimeout(() => {
            Tone.Transport.stop(); // Optional: stop transport after playback
            resolve();
        }, (duration1 + duration2) * 1000); // Convert seconds to ms
    });
}

  
  
  
  

  _updatePannerPositions(finger_x, finger_y, finger_z) {      
    const elements = this.level.getLevel();
    const finger = new Point2D(finger_x, finger_y);

    for (const e of elements) {
      const key = `${e.item.type}:${e.item.content}`;
      const panner = this.panners[key];
      const closest = closestPointInRectangle(e.rectangle, finger);
      const isInside = finger.isInside(e.rectangle);
      const inStrip = (Math.abs(closest.y - finger_y) < MAX_VERTICAL_DISTANCE);

      if (panner) {
        // Use the current rectangle center, mapped to meters
        const x = closest.x * 0.066;
        const y = (closest.y * 0.066);
        const z1 = inStrip ? 10 : -100;
        const z = isInside ? 1 : z1;

        panner.setPosition(x, y, z);
      } else {
        // Optional: log missing panners for debugging
        console.warn(`No panner found for key: ${key}`);
      }
    }
  } 
  

  // Stop all sounds
  stop_sounds() {
    // Stop all currently playing sounds
    this.players._players.forEach((player) => {
      try { player.stop(); } catch {}
    });
  }


  // Set the Tone.js listener position
  _setListenerPosition(x, y, z) {
    Tone.Listener.positionX.value = x*0.066;
    Tone.Listener.positionY.value = y*0.066;
    Tone.Listener.positionZ.value = z=3;
    this.listenerPosition = {x, y, z};
    this._updatePannerPositions(x,y,z);
  }

  // Double tap: start sounds and set listener to tap position
  _onDoubleTap(finger_x, finger_y) {
    console.log('tap tap')
    const elements = this.level.getLevel();
    const finger = new Point2D(finger_x, finger_y);
    for (const e of elements) {
      
      if (finger.isInside(e.rectangle)) {
        this.gameLogic.guess(e.item)
      }
    }
  }

  // Drag: move listener to follow finger
  async _onTouchDrag(finger_x, finger_y) {
    this._setListenerPosition(finger_x, finger_y, 0);
    this._drawSoundAndListenerMarkers();
  
    // Check if the listener is inside any rectangle
    const elements = this.level.getLevel();
    let insideKey = null;
    const finger = new Point2D(finger_x, finger_y);
    for (const e of elements) {
      if (finger.isInside(e.rectangle)){
        insideKey = `${e.item.type}:${e.item.content}`;
        // console.log(e.item.content);
        break;
      }
    }
  
    // if key is in the margin
    if (insideKey === null && this.currentRectKey !== insideKey) {
      // console.log('margin');

      await Tone.start();

      const kick = this.players.player('half-click');
  +
      await Tone.loaded();
      // Start player1
      kick.start(0);
      if (window.navigator.vibrate) {
        window.navigator.vibrate(50);
      }
    }
    this.currentRectKey = insideKey;
  }
  

  // On canvas resize: restart sounds and reset listener to center
  onCanvasResize() {
    if (this.gameLogic.getPhase() === "search"){
      this.start_sounds();
    this._setListenerPosition(this.canvas.width / 2, this.canvas.height / 2, 0);
    this._drawSoundAndListenerMarkers();
    }
  }
  _setupCanvasEvents() {
    // Double tap detection
    let lastTapTime = 0;
    let lastTapX = 0;
    let lastTapY = 0;
  
    this.canvas.addEventListener('touchstart', async (e) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        const now = Date.now();
    
        if (now - lastTapTime < 300) {
          // Double tap detected
          await Tone.start(); // Ensure AudioContext is running
          this._onDoubleTap(x, y);
          lastTapTime = 0; // reset
        } else {
          lastTapTime = now;
          lastTapX = x;
          lastTapY = y;
        }
      }
    });
    
    // Mouse double click for desktop
    this.canvas.addEventListener('dblclick', async (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      await Tone.start(); // Ensure AudioContext is running
      this._onDoubleTap(x, y);
    });
    
  
    // Touch drag
    this.canvas.addEventListener('touchmove', async (e) => {

      if (e.touches.length === 1) {
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        this._onTouchDrag(x, y);
      }
    });
  
    let isMouseDown = false;
  
    this.canvas.addEventListener('mousedown', (e) => {
      isMouseDown = true;
    });
    this.canvas.addEventListener('mouseup', (e) => {
      isMouseDown = false;
    });
    this.canvas.addEventListener('mousemove', async (e) => {
      if (isMouseDown) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        this._onTouchDrag(x, y);
      }
    });
  }

  _drawSoundAndListenerMarkers() {
    const ctx = this.canvas.getContext('2d');
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.level.show_level()
  
    // Draw sound sources (red)
    const elements = this.level.getLevel();
    for (const e of elements) {
      // Use the center of the rectangle for the sound source
      const key = `${e.item.type}:${e.item.content}`;
      const panner = this.panners[key];
      const x = panner.positionX.value * 15;
      const y = panner.positionY.value * 15;
      const color = (panner.positionZ.value > 0) ? 'rgba(0, 4, 255, 0.6)' :'rgba(255,0,0,0.6)';
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = 'rgba(128,0,0,0.7)';
      ctx.lineWidth = 3;
      ctx.stroke();
    }
  
    // Draw listener (green)
    const lx = this.listenerPosition.x;
    const ly = this.listenerPosition.y;
    ctx.beginPath();
    ctx.arc(lx, ly,REF_DISTANCE/0.066, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(0,200,0,0.6)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,100,0,0.7)';
    ctx.lineWidth = 3;
    ctx.stroke();
  }
  
  
}

  // _showInstruction() {
  //   const secret = this.gameLogic.getSecretItem().content;
  //   this.instructionDiv.textContent = `Find the item: ${secret}`;
  //   this.instructionDiv.style.display = 'flex';
  //   this.instructionDiv.style.justifyContent = 'center';
  //   this.instructionDiv.style.alignItems = 'center';
  //   this.instructionDiv.style.fontSize = '2em';
  // }

  // _showSearch() {
  //   this.searchDiv.style.display = 'block';
  //   // Level rendering is handled elsewhere
  // }



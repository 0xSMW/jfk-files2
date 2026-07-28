import * as THREE from 'three';

// Polyfill Timer on window.THREE & THREE namespace
// A-Frame sets window.THREE to an older version (^0.147.0) which lacks THREE.Timer.
// three-render-objects uses global.THREE.Timer if global.THREE exists.
if (typeof window !== 'undefined') {
  class Timer {
    private _previousTime = (typeof performance !== 'undefined' ? performance.now() : Date.now()) / 1000;
    private _currentTime = 0;
    private _delta = 0;
    private _elapsed = 0;
    private _timescale = 1;

    update(timestamp?: number) {
      const now = (timestamp !== undefined ? timestamp : (typeof performance !== 'undefined' ? performance.now() : Date.now())) / 1000;
      this._delta = (now - this._previousTime) * this._timescale;
      this._elapsed += this._delta;
      this._previousTime = now;
      return this;
    }

    getDelta() {
      return this._delta;
    }

    getElapsed() {
      return this._elapsed;
    }

    getTimescale() {
      return this._timescale;
    }

    setTimescale(tf: number) {
      this._timescale = tf;
      return this;
    }

    reset() {
      this._previousTime = (typeof performance !== 'undefined' ? performance.now() : Date.now()) / 1000;
      this._delta = 0;
      this._elapsed = 0;
      return this;
    }

    dispose() {
      return this;
    }
  }

  // Attach to imported THREE namespace
  if (!(THREE as any).Timer) {
    (THREE as any).Timer = Timer;
  }

  // Attach to window.THREE if present, and define property getter/setter to protect it
  const ensureWindowTimer = () => {
    const win = window as any;
    if (win.THREE) {
      if (!win.THREE.Timer) {
        try {
          win.THREE.Timer = Timer;
        } catch (e) {
          // ignore
        }
      }
    }
  };

  ensureWindowTimer();

  // Define property on window to catch when A-frame sets window.THREE
  let currentVal = (window as any).THREE;
  try {
    Object.defineProperty(window, 'THREE', {
      get() {
        return currentVal;
      },
      set(v) {
        currentVal = v;
        if (v && !v.Timer) {
          v.Timer = Timer;
        }
      },
      configurable: true,
      enumerable: true
    });
  } catch (e) {
    // fallback interval if defineProperty fails
    const timerId = setInterval(ensureWindowTimer, 50);
    setTimeout(() => clearInterval(timerId), 5000);
  }
}

export default THREE;

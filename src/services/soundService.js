/**
 * SoundService – Mobile Ringing Alert & Vibration Manager
 *
 * Provides a reliable, zero-latency looping delivery chime using the Web Audio API
 * and Vibration API. Works seamlessly across mobile browsers (Chrome, Safari, Firefox)
 * without needing external MP3 downloads that might fail or get blocked by CORS.
 */

class SoundService {
  constructor() {
    this.audioCtx = null;
    this.ringInterval = null;
    this.vibrateInterval = null;
    this.isRingingActive = false;
    this.activeOscillators = [];
  }

  getAudioContext() {
    if (!this.audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.audioCtx = new AudioCtx();
      }
    }
    return this.audioCtx;
  }

  /**
   * Unlock AudioContext on first user interaction to comply with browser autoplay policies
   */
  async unlockAudio() {
    const ctx = this.getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch (err) {
        console.warn('AudioContext resume error:', err);
      }
    }
    return ctx?.state === 'running';
  }

  isUnlocked() {
    return this.audioCtx && this.audioCtx.state === 'running';
  }

  /**
   * Play a single dual-tone delivery alert chime (two harmonious tones: 750Hz and 950Hz)
   */
  playSingleChime() {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    try {
      const now = ctx.currentTime;
      const duration = 0.7;

      // Primary tone (750 Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(750, now);
      osc1.frequency.exponentialRampToValueAtTime(820, now + duration);

      gain1.gain.setValueAtTime(0, now);
      gain1.gain.linearRampToValueAtTime(0.35, now + 0.05);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);

      // Harmonious secondary tone (950 Hz)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(950, now);
      osc2.frequency.exponentialRampToValueAtTime(1050, now + duration);

      gain2.gain.setValueAtTime(0, now);
      gain2.gain.linearRampToValueAtTime(0.25, now + 0.05);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);

      osc1.stop(now + duration);
      osc2.stop(now + duration);

      this.activeOscillators.push(osc1, osc2);

      // Clean up reference after stopping
      setTimeout(() => {
        this.activeOscillators = this.activeOscillators.filter(
          (o) => o !== osc1 && o !== osc2
        );
      }, (duration + 0.1) * 1000);
    } catch (err) {
      console.warn('Error synthesizing chime:', err);
    }
  }

  /**
   * Start looping mobile ringing alert with rhythmic cadence and vibration
   */
  startOrderRingtone() {
    // Prevent overlapping ring loops
    if (this.isRingingActive) {
      return;
    }

    this.isRingingActive = true;
    this.unlockAudio();

    // 1. Play immediate first chime
    this.playSingleChime();

    // 2. Schedule looping chime every 1.8 seconds (cadence: ring -> pause -> ring)
    this.ringInterval = setInterval(() => {
      if (!this.isRingingActive) {
        this.stopOrderRingtone();
        return;
      }
      this.playSingleChime();
    }, 1800);

    // 3. Trigger mobile vibration pattern where supported
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate([600, 300, 600, 300, 600]);
        this.vibrateInterval = setInterval(() => {
          if (!this.isRingingActive) {
            clearInterval(this.vibrateInterval);
            return;
          }
          navigator.vibrate([600, 300, 600, 300, 600]);
        }, 3000);
      } catch (err) {
        console.warn('Vibration not permitted:', err);
      }
    }
  }

  /**
   * Stop ringtone and vibration immediately
   */
  stopOrderRingtone() {
    this.isRingingActive = false;

    if (this.ringInterval) {
      clearInterval(this.ringInterval);
      this.ringInterval = null;
    }

    if (this.vibrateInterval) {
      clearInterval(this.vibrateInterval);
      this.vibrateInterval = null;
    }

    // Stop hardware vibration
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(0);
      } catch {
        // ignore
      }
    }

    // Terminate any active sound nodes
    try {
      this.activeOscillators.forEach((osc) => {
        try {
          osc.stop();
        } catch {
          // already stopped
        }
      });
      this.activeOscillators = [];
    } catch {
      // ignore
    }
  }

  isRinging() {
    return this.isRingingActive;
  }

  /**
   * Show HTML5 Browser Notification if tab is in the background
   */
  showSystemNotification(order) {
    if (typeof window === 'undefined' || !('Notification' in window)) return;

    if (Notification.permission === 'granted') {
      try {
        const notif = new Notification(`New GharKaSwad Order #${order.orderNumber}!`, {
          body: `Order for ₹${order.totalAmount} received. Tap to review and accept.`,
          icon: '/favicon.svg',
          tag: `order-${order.orderId || order._id}`,
          requireInteraction: true,
        });

        notif.onclick = () => {
          window.focus();
          notif.close();
        };
      } catch (err) {
        console.warn('Notification display failed:', err);
      }
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  }
}

export const soundService = new SoundService();
export default soundService;

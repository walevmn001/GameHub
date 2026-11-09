/**
 * Âm thanh hiệu ứng tối giản sinh bằng Web Audio API.
 * Không cần tệp âm thanh, không phụ thuộc mạng — phù hợp bản web tĩnh.
 */

export type SoundName =
  | 'shuffle'
  | 'deal'
  | 'play'
  | 'cut'
  | 'win'
  | 'lose'
  | 'coin';

let enabled = true;
let ctx: AudioContext | null = null;

/** Bật/tắt âm thanh (theo tuỳ chọn người dùng). */
export function setSoundEnabled(value: boolean): void {
  enabled = value;
}

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (ctx) return ctx;
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  ctx = new Ctor();
  return ctx;
}

function blip(
  freq: number,
  duration: number,
  options: { type?: OscillatorType; gain?: number; delay?: number; sweep?: number } = {},
): void {
  const audio = getContext();
  if (!audio) return;
  const { type = 'sine', gain = 0.05, delay = 0, sweep = 0 } = options;
  const start = audio.currentTime + delay;
  const osc = audio.createOscillator();
  const amp = audio.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (sweep) osc.frequency.linearRampToValueAtTime(freq + sweep, start + duration);

  amp.gain.setValueAtTime(0.0001, start);
  amp.gain.exponentialRampToValueAtTime(gain, start + 0.01);
  amp.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  osc.connect(amp);
  amp.connect(audio.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

/** Phát một hiệu ứng âm thanh theo tên. */
export function playSound(name: SoundName): void {
  if (!enabled) return;
  const audio = getContext();
  if (!audio) return;
  if (audio.state === 'suspended') void audio.resume();

  switch (name) {
    case 'shuffle':
      for (let i = 0; i < 6; i += 1) {
        blip(220 + i * 40, 0.07, { type: 'triangle', gain: 0.03, delay: i * 0.12 });
      }
      break;
    case 'deal':
      blip(520, 0.08, { type: 'triangle', gain: 0.04, sweep: 180 });
      break;
    case 'play':
      blip(360, 0.09, { type: 'square', gain: 0.03, sweep: -90 });
      break;
    case 'cut':
      blip(180, 0.18, { type: 'sawtooth', gain: 0.06, sweep: -60 });
      blip(90, 0.22, { type: 'square', gain: 0.05, delay: 0.05 });
      break;
    case 'coin':
      blip(880, 0.09, { type: 'square', gain: 0.04 });
      blip(1320, 0.12, { type: 'square', gain: 0.035, delay: 0.07 });
      break;
    case 'win':
      [523, 659, 784, 1047].forEach((f, i) =>
        blip(f, 0.2, { type: 'triangle', gain: 0.05, delay: i * 0.12 }),
      );
      break;
    case 'lose':
      [392, 330, 262].forEach((f, i) =>
        blip(f, 0.24, { type: 'sine', gain: 0.05, delay: i * 0.14 }),
      );
      break;
    default:
      break;
  }
}

import * as Tone from 'tone';

// 定义不同的音景（和弦）
const SOUNDSCAPES = [
  { name: "治愈之光 (C Major)", notes: ["C4", "E4", "G4", "D5"] },
  { name: "深邃之境 (A Minor)", notes: ["A3", "C4", "E4", "A4"] },
  { name: "空灵之云 (F Lydian)", notes: ["F3", "A3", "C4", "G4"] }
];

export class AudioEngine {
  constructor() {
    this.synth = null;
    this.isPlaying = false;
    this.currentIndex = 0;
    
    // 环境音（底噪）相关
    this.noise = null;
    this.noiseFilter = null;
  }

  async init() {
    await Tone.start();
    if (!this.synth) {
      // 1. 初始化程序合成的和弦（主角）
      this.synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "sine" },
        envelope: { attack: 2, decay: 1, sustain: 0.5, release: 3 }
      }).toDestination();
      
      const reverb = new Tone.Reverb(3).toDestination();
      this.synth.connect(reverb);
      this.synth.volume.value = -10;

      // 2. 初始化环境底噪（背景垫底）
      // 使用 'pink' 噪音，听起来更像自然的雨声或海浪，不像 'white' 那么刺耳
      this.noise = new Tone.Noise("pink").start();
      // 用一个低通滤波器，把噪音的高频部分砍掉，听起来更像远处的雷雨或海潮
      this.noiseFilter = new Tone.Filter(800, "lowpass").toDestination();
      this.noise.connect(this.noiseFilter);
      // 把噪音音量压得非常低（-25dB），不要盖过和弦
      this.noise.volume.value = -25;
    }
  }

  // 启动环境底噪（在点击开始正念时调用）
  startAmbience() {
    if (this.noise) {
      this.noise.start(); // 如果之前停了，重新启动
      console.log("Audio: 环境底噪已开启");
    }
  }

  // 停止环境底噪（在结束正念时调用）
  stopAmbience() {
    if (this.noise) {
      this.noise.stop();
      console.log("Audio: 环境底噪已停止");
    }
  }

  getCurrentSoundscapeName() {
    return SOUNDSCAPES[this.currentIndex].name;
  }

  switchSoundscape(direction) {
    const wasPlaying = this.isPlaying;
    if (wasPlaying) this.stop();

    if (direction === 'next') {
      this.currentIndex = (this.currentIndex + 1) % SOUNDSCAPES.length;
    } else if (direction === 'prev') {
      this.currentIndex = (this.currentIndex - 1 + SOUNDSCAPES.length) % SOUNDSCAPES.length;
    }
    console.log(`切换音景至: ${this.getCurrentSoundscapeName()}`);

    if (wasPlaying) {
      setTimeout(() => this.play(), 100);
    }
  }

  play() {
    if (this.isPlaying || !this.synth) return;
    const notes = SOUNDSCAPES[this.currentIndex].notes;
    this.synth.triggerAttack(notes);
    this.isPlaying = true;
    console.log("Audio: Play");
  }

  stop() {
    if (!this.isPlaying || !this.synth) return;
    this.synth.triggerRelease();
    this.isPlaying = false;
    console.log("Audio: Stop");
  }
}
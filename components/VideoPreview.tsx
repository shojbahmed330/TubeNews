
import React, { useRef, useEffect, useState } from 'react';
import { VideoState, BgTheme } from '../types';

interface VideoPreviewProps {
  state: VideoState;
  onGenerationComplete: (blob: Blob) => void;
}

const THEME_COLORS: Record<BgTheme, { bg: string, header: string, accent: string, text: string }> = {
  midnight: { bg: '#0f172a', header: '#1e293b', accent: '#60a5fa', text: '#f8fafc' },
  deepsea: { bg: '#020617', header: '#1e1b4b', accent: '#38bdf8', text: '#e2e8f0' },
  bloodred: { bg: '#180808', header: '#450a0a', accent: '#f87171', text: '#fee2e2' },
  forest: { bg: '#06201b', header: '#064e3b', accent: '#4ade80', text: '#ecfdf5' },
  gold: { bg: '#1c1917', header: '#44403c', accent: '#fbbf24', text: '#fffbeb' },
  carbon: { bg: '#0a0a0a', header: '#262626', accent: '#a3a3a3', text: '#fafafa' },
  neon: { bg: '#0f0720', header: '#2e1065', accent: '#c084fc', text: '#f5f3ff' },
  sunset: { bg: '#1c0a00', header: '#7c2d12', accent: '#fb923c', text: '#fff7ed' },
  cream: { bg: '#fffbeb', header: '#fef3c7', accent: '#d97706', text: '#451a03' },
  contrast: { bg: '#000000', header: '#171717', accent: '#ffffff', text: '#e5e5e5' }
};

const VideoPreview: React.FC<VideoPreviewProps> = ({ state, onGenerationComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(Date.now());

  // Image cache refs to prevent performance issues
  const leftImgRef = useRef<HTMLImageElement | null>(null);
  const rightImgRef = useRef<HTMLImageElement | null>(null);

  const WIDTH = 1280;
  const HEIGHT = 720;

  // Sync images to refs when they change
  useEffect(() => {
    if (state.speakerLeft.image) {
      const img = new Image();
      img.src = state.speakerLeft.image;
      img.onload = () => { leftImgRef.current = img; };
    } else {
      leftImgRef.current = null;
    }
  }, [state.speakerLeft.image]);

  useEffect(() => {
    if (state.speakerRight.image) {
      const img = new Image();
      img.src = state.speakerRight.image;
      img.onload = () => { rightImgRef.current = img; };
    } else {
      rightImgRef.current = null;
    }
  }, [state.speakerRight.image]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    
    const loop = () => {
      let frequencyData: Uint8Array | undefined;
      if (analyserRef.current && (isPlaying || isRecording)) {
        frequencyData = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(frequencyData);
      }
      
      drawFrame(frequencyData);
      animationRef.current = requestAnimationFrame(loop);
    };

    animationRef.current = requestAnimationFrame(loop);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [state, isPlaying, isRecording]);

  const drawShape = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, shape: string) => {
    ctx.beginPath();
    const r = size / 2;
    const cx = x + r;
    const cy = y + r;
    
    if (shape === 'circle') {
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
    } else if (shape === 'square') {
      ctx.rect(x, y, size, size);
    } else if (shape === 'rounded') {
      ctx.roundRect(x, y, size, size, 40);
    } else if (shape === 'hexagon') {
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const px = cx + r * Math.cos(angle);
        const py = cy + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath();
    } else if (shape === 'diamond') {
      ctx.moveTo(cx, y);
      ctx.lineTo(x + size, cy);
      ctx.lineTo(cx, y + size);
      ctx.lineTo(x, cy);
      ctx.closePath();
    }
  };

  const drawFrame = (frequencyData?: Uint8Array) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    const theme = THEME_COLORS[state.bgTheme];

    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.save();
    ctx.globalAlpha = 0.15;
    for (let i = 0; i < 5; i++) {
      const px = (Math.sin(elapsed * 0.2 + i * 1.5) + 1) * WIDTH / 2;
      const py = (Math.cos(elapsed * 0.3 + i * 2) + 1) * HEIGHT / 2;
      const grad = ctx.createRadialGradient(px, py, 0, px, py, 400);
      grad.addColorStop(0, theme.accent);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
    }
    ctx.restore();

    ctx.fillStyle = theme.header;
    ctx.fillRect(0, 0, WIDTH, 180);
    ctx.strokeStyle = theme.accent;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, 180); ctx.lineTo(WIDTH, 180); ctx.stroke();

    const drawTitle = (text: string, x: number, y: number, fontSize: number, color: string, delay: number) => {
      ctx.save();
      const cycleTime = 6.0;
      const localTime = (elapsed + delay) % cycleTime;
      const progress = Math.min(1, localTime / 0.8);
      
      let opacity = 1, scale = 1, yOff = 0, blur = 0, rot = 0;
      
      switch(state.titleAnimStyle) {
        case 'fade': opacity = progress; break;
        case 'slide_down': yOff = (1 - progress) * -60; opacity = progress; break;
        case 'zoom': scale = 0.5 + progress * 0.5; opacity = progress; break;
        case 'blur': blur = (1 - progress) * 20; opacity = progress; break;
        case 'bounce': yOff = -Math.abs(Math.sin(localTime * 10)) * 20 * (1 - progress); break;
        case 'glow': ctx.shadowColor = theme.accent; ctx.shadowBlur = Math.sin(elapsed * 4) * 15 + 15; break;
        case 'rainbow': color = `hsl(${(elapsed * 60 + delay * 100) % 360}, 70%, 60%)`; break;
        case 'flip': rot = (1 - progress) * Math.PI / 2; break;
        case 'typewriter':
          const charCount = Math.floor(text.length * progress);
          text = text.substring(0, charCount);
          break;
      }
      
      if (blur > 0) ctx.filter = `blur(${blur}px)`;
      ctx.globalAlpha = opacity;
      ctx.translate(x, y + yOff);
      ctx.scale(scale, scale);
      ctx.rotate(rot);
      ctx.fillStyle = color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `bold ${fontSize}px "Hind Siliguri", sans-serif`;
      ctx.fillText(text, 0, 0);
      ctx.restore();
    };

    let titleBaseY = 70;
    if (state.titleStyle === 'breaking') {
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px "Inter", sans-serif';
      ctx.fillText("BREAKING NEWS", WIDTH/2, 30);
      titleBaseY = 90;
    }

    drawTitle(state.title1, WIDTH/2, titleBaseY, 52, state.title1Color, 0);
    drawTitle(state.title2, WIDTH/2, titleBaseY + 60, 38, state.title2Color, 0.4);

    const speakerY = 380;
    const speakerSize = 310;
    const drawSpeaker = (side: 'left' | 'right', x: number) => {
      const speaker = side === 'left' ? state.speakerLeft : state.speakerRight;
      const img = side === 'left' ? leftImgRef.current : rightImgRef.current;
      
      ctx.save();
      drawShape(ctx, x, speakerY - speakerSize / 2, speakerSize, state.imageShape);
      ctx.clip();
      if (img) {
        ctx.drawImage(img, x, speakerY - speakerSize / 2, speakerSize, speakerSize);
      } else if (speaker.image) {
        const tempImg = new Image(); tempImg.src = speaker.image;
        ctx.drawImage(tempImg, x, speakerY - speakerSize / 2, speakerSize, speakerSize);
      } else {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(x, speakerY - speakerSize / 2, speakerSize, speakerSize);
      }
      ctx.restore();
      
      ctx.strokeStyle = theme.accent;
      ctx.lineWidth = 6;
      ctx.shadowBlur = 15;
      ctx.shadowColor = theme.accent;
      drawShape(ctx, x, speakerY - speakerSize / 2, speakerSize, state.imageShape);
      ctx.stroke();
    };
    drawSpeaker('left', 160);
    drawSpeaker('right', WIDTH - 160 - speakerSize);

    const centerX = WIDTH / 2;
    const centerY = 380;
    let volume = 0;
    if (frequencyData) {
      let sum = 0;
      for(let i=0; i<32; i++) sum += frequencyData[i];
      volume = sum / (32 * 255);
    }

    ctx.save();
    ctx.translate(centerX, centerY);
    const accentColor = theme.accent;

    switch(state.micStyle) {
      case 'classic': {
        const pulse = Math.sin(elapsed * 6) * 0.1 + 1 + volume * 0.6;
        ctx.scale(pulse, pulse);
        ctx.shadowBlur = 30; ctx.shadowColor = accentColor; ctx.fillStyle = theme.text;
        ctx.beginPath(); ctx.roundRect(-25, -60, 50, 80, 25); ctx.fill();
        ctx.strokeStyle = theme.text; ctx.lineWidth = 6;
        ctx.beginPath(); ctx.arc(0, -5, 50, 0, Math.PI, false); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, 45); ctx.lineTo(0, 75); ctx.stroke();
        break;
      }
      case 'neon_ring': {
        for (let i = 0; i < 3; i++) {
          const size = 60 + volume * 120 + i * 20;
          const spin = elapsed * (1 + i);
          ctx.beginPath(); ctx.arc(0, 0, size, spin, spin + Math.PI * 1.5);
          ctx.shadowBlur = 20; ctx.shadowColor = accentColor; ctx.strokeStyle = accentColor; ctx.lineWidth = 10 - i * 2;
          ctx.stroke();
        }
        ctx.beginPath(); ctx.arc(0, 0, 40 + volume * 20, 0, Math.PI * 2); ctx.fillStyle = theme.text; ctx.fill();
        break;
      }
      case 'radial_bars': {
        const bars = 36;
        for(let i=0; i<bars; i++) {
          const angle = (i / bars) * Math.PI * 2 + elapsed * 0.5;
          const freqValue = frequencyData ? (frequencyData[i % 32] / 255) : 0;
          const h = 50 + freqValue * 150;
          ctx.save(); ctx.rotate(angle);
          const barGrad = ctx.createLinearGradient(0, 50, 0, 50 + h);
          barGrad.addColorStop(0, accentColor); barGrad.addColorStop(1, theme.text);
          ctx.fillStyle = barGrad; ctx.fillRect(-4, 50, 8, h); ctx.restore();
        }
        break;
      }
      case 'concentric': {
        for(let i=0; i<5; i++) {
          const shift = (elapsed * 2 + i / 5) % 1;
          const radius = shift * 200 + volume * 100;
          ctx.beginPath(); ctx.arc(0, 0, radius, 0, Math.PI * 2); ctx.strokeStyle = accentColor;
          ctx.globalAlpha = 1 - shift; ctx.lineWidth = 6 * (1 - shift); ctx.stroke();
        }
        ctx.globalAlpha = 1;
        break;
      }
      case 'pulse_orb': {
        const radius = 60 + volume * 120;
        for (let i = 0; i < 3; i++) {
          const r = radius - i * 30 * volume;
          const orbGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
          orbGrad.addColorStop(0, theme.text); orbGrad.addColorStop(0.4, accentColor); orbGrad.addColorStop(1, 'transparent');
          ctx.fillStyle = orbGrad; ctx.beginPath(); ctx.arc(Math.sin(elapsed*3+i)*10, Math.cos(elapsed*3-i)*10, r, 0, Math.PI * 2); ctx.fill();
        }
        break;
      }
      case 'spectrum': {
        if (frequencyData) {
          ctx.beginPath(); ctx.strokeStyle = accentColor; ctx.lineWidth = 8;
          for(let i=0; i<128; i++) {
            const angle = (i / 128) * Math.PI * 2;
            const freqVal = frequencyData[i % 32] / 255;
            const r = 100 + freqVal * 120;
            const px = Math.cos(angle) * r; const py = Math.sin(angle) * r;
            if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
          }
          ctx.closePath(); ctx.stroke();
          ctx.globalAlpha = 0.2; ctx.fillStyle = accentColor; ctx.fill(); ctx.globalAlpha = 1.0;
        }
        break;
      }
      case 'liquid': {
        ctx.beginPath();
        for(let i=0; i<180; i++) {
          const angle = (i / 180) * Math.PI * 2;
          const noise = Math.sin(angle * 5 + elapsed*2.5) * 15 + Math.cos(angle * 3 - elapsed*3.75) * 20;
          const r = 80 + volume * 100 + noise;
          const px = Math.cos(angle) * r; const py = Math.sin(angle) * r;
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.closePath();
        const liquidGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 200);
        liquidGrad.addColorStop(0, theme.text); liquidGrad.addColorStop(0.7, accentColor); liquidGrad.addColorStop(1, accentColor + '00');
        ctx.fillStyle = liquidGrad; ctx.fill();
        break;
      }
    }
    ctx.restore();

    const channelParts = ["রাজনীতি", "ও", "জনমত"];
    const brandingY = HEIGHT - 85; 
    const brandingSpacing = 210; 
    
    const drawBrandingPart = (text: string, x: number, y: number, partIdx: number) => {
      ctx.save();
      const bLocalTime = elapsed % 4.0;
      const bDelay = partIdx * 0.8;
      const progress = Math.min(1, Math.max(0, bLocalTime - bDelay) / 0.5);
      
      let opacity = 1, scale = 1, yOff = 0, blur = 0, rot = 0;
      let partColor = theme.text;
      
      switch (state.channelAnimStyle) {
        case 'fade': opacity = progress; break;
        case 'slide': yOff = (1 - progress) * 50; opacity = progress; break;
        case 'scale': scale = progress; break;
        case 'blur': blur = (1 - progress) * 20; opacity = progress; break;
        case 'bounce': yOff = -Math.abs(Math.sin((bLocalTime-bDelay)*10)) * 40 * (1-progress); break;
        case 'rotate': rot = (1-progress) * Math.PI; break;
        case 'glow': ctx.shadowColor = theme.accent; ctx.shadowBlur = Math.sin(elapsed * 5) * 20 + 20; break;
        case 'rainbow': partColor = `hsl(${(elapsed * 100 + partIdx * 60) % 360}, 75%, 65%)`; break;
      }
      
      if (blur > 0) ctx.filter = `blur(${blur}px)`;
      ctx.globalAlpha = opacity;
      ctx.translate(x, y + yOff);
      ctx.scale(scale, scale);
      ctx.rotate(rot);
      
      ctx.fillStyle = partColor;
      ctx.font = 'bold 82px "Hind Siliguri", sans-serif';
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 4;
      ctx.shadowOffsetY = 4;
      ctx.fillText(text, 0, 0);
      ctx.restore();
    };
    
    drawBrandingPart(channelParts[0], WIDTH/2 - brandingSpacing, brandingY, 0);
    drawBrandingPart(channelParts[1], WIDTH/2, brandingY, 1);
    drawBrandingPart(channelParts[2], WIDTH/2 + brandingSpacing, brandingY, 2);

    if (frequencyData) {
      ctx.save();
      ctx.globalAlpha = 0.2;
      ctx.fillStyle = accentColor;
      const floorBars = 100;
      const fbWidth = WIDTH / floorBars;
      for (let i = 0; i < floorBars; i++) {
        const val = (frequencyData[i % 32] / 255) * 120;
        ctx.fillRect(i * fbWidth, HEIGHT, fbWidth - 1, -val);
      }
      ctx.restore();
    }
  };

  const setupAnalyser = () => {
    if (analyserRef.current) return;
    const audio = audioRef.current;
    if (!audio) return;
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const source = audioCtx.createMediaElementSource(audio);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
    analyserRef.current = analyser;
  };

  const togglePlayback = async () => {
    if (!state.audioUrl) return;
    const audio = audioRef.current; if (!audio) return;
    if (isPlaying) { 
      audio.pause(); 
      setIsPlaying(false); 
    } else {
      setupAnalyser();
      audio.play(); 
      setIsPlaying(true);
    }
  };

  const startRecording = async () => {
    const canvas = canvasRef.current; const audio = audioRef.current;
    if (!canvas || !audio || !state.audioUrl) return;
    setupAnalyser();
    setIsRecording(true); 
    audio.currentTime = 0;
    const canvasStream = canvas.captureStream(30);
    const audioStream = (audio as any).captureStream ? (audio as any).captureStream() : (audio as any).mozCaptureStream ? (audio as any).mozCaptureStream() : null;
    const combinedTracks = [...canvasStream.getTracks()];
    if (audioStream) combinedTracks.push(...audioStream.getTracks());
    const combinedStream = new MediaStream(combinedTracks);
    const recorder = new MediaRecorder(combinedStream, { 
      mimeType: 'video/webm;codecs=vp9,opus', 
      videoBitsPerSecond: 8000000 
    });
    recorder.ondataavailable = (e) => { 
      if (e.data.size > 0) audioChunksRef.current.push(e.data); 
    };
    recorder.onstop = () => {
      const blob = new Blob(audioChunksRef.current, { type: 'video/mp4' });
      onGenerationComplete(blob); 
      audioChunksRef.current = []; 
      setIsRecording(false); 
      setIsPlaying(false);
    };
    mediaRecorderRef.current = recorder; 
    recorder.start();
    audio.play(); 
    setIsPlaying(true);
    audio.onended = () => { 
      if (recorder.state === 'recording') recorder.stop(); 
      audio.onended = null; 
    };
  };

  return (
    <div className="w-full h-full flex flex-col relative">
      <canvas ref={canvasRef} className="w-full h-full object-contain" />
      <audio ref={audioRef} src={state.audioUrl || undefined} crossOrigin="anonymous" />
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-black/70 backdrop-blur-3xl p-5 rounded-[2.5rem] border border-white/20 shadow-[0_0_50px_rgba(0,0,0,0.5)] scale-90 lg:scale-100 transition-all hover:scale-105">
        <button onClick={togglePlayback} className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl text-white transition-all active:scale-90" disabled={!state.audioUrl || isRecording}>
          {isPlaying ? (
            <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
          ) : (
            <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          )}
        </button>
        <button onClick={startRecording} disabled={!state.audioUrl || isRecording} className={`relative px-12 py-5 rounded-2xl font-black text-base uppercase tracking-[0.2em] transition-all overflow-hidden group active:scale-95 ${isRecording ? 'bg-red-600 text-white animate-pulse' : 'bg-blue-600 text-white hover:bg-blue-500 shadow-[0_0_30px_rgba(37,99,235,0.6)]'}`}>
          <span className="relative z-10">{isRecording ? "Recording..." : "Export Video"}</span>
          {!isRecording && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>}
        </button>
      </div>
      <style>{`@keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }`}</style>
    </div>
  );
};

export default VideoPreview;

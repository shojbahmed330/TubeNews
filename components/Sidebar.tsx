
import React from 'react';
import { VideoState, TitleStyle, ChannelAnimStyle, ImageShape, BgTheme, MicStyle, TitleAnimStyle } from '../types';

interface SidebarProps {
  state: VideoState;
  onUpdate: (updates: Partial<VideoState>) => void;
  onSpeakerUpdate: (side: 'left' | 'right', updates: Partial<{ image: string | null; name: string }>) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ state, onUpdate, onSpeakerUpdate }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, side: 'left' | 'right') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onSpeakerUpdate(side, { image: event.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpdate({ audioFile: file, audioUrl: URL.createObjectURL(file) });
    }
  };

  const titleStyles: { id: TitleStyle; name: string }[] = [
    { id: 'modern', name: 'Modern' }, { id: 'breaking', name: 'Breaking' },
    { id: 'minimalist', name: 'Minimalist' }, { id: 'podcast', name: 'Podcast' },
    { id: 'talkshow', name: 'Talk Show' }, { id: 'election', name: 'Election' },
    { id: 'documentary', name: 'Docu' }, { id: 'social', name: 'Social' },
    { id: 'latenight', name: 'Late Night' }, { id: 'retro', name: 'Retro' }
  ];

  const titleAnimStyles: { id: TitleAnimStyle; name: string }[] = [
    { id: 'none', name: 'None' },
    { id: 'fade', name: 'Fade' },
    { id: 'slide_down', name: 'Slide' },
    { id: 'zoom', name: 'Zoom' },
    { id: 'typewriter', name: 'Type' },
    { id: 'blur', name: 'Blur' },
    { id: 'bounce', name: 'Bounce' },
    { id: 'glow', name: 'Glow' },
    { id: 'rainbow', name: 'Rainbow' },
    { id: 'flip', name: 'Flip' }
  ];

  const animStyles: { id: ChannelAnimStyle; name: string }[] = [
    { id: 'fade', name: 'Fade' }, { id: 'slide', name: 'Slide' },
    { id: 'scale', name: 'Scale' }, { id: 'typewriter', name: 'Type' },
    { id: 'blur', name: 'Blur' }, { id: 'glow', name: 'Glow' },
    { id: 'bounce', name: 'Bounce' }, { id: 'rotate', name: 'Rotate' },
    { id: 'flip', name: 'Flip' }, { id: 'rainbow', name: 'Rainbow' }
  ];

  const micStyles: { id: MicStyle; name: string }[] = [
    { id: 'classic', name: 'Classic Mic' },
    { id: 'neon_ring', name: 'Neon Ring' },
    { id: 'radial_bars', name: 'Radial Bars' },
    { id: 'concentric', name: 'Concentric' },
    { id: 'pulse_orb', name: 'Pulse Orb' },
    { id: 'spectrum', name: 'Spectrum' },
    { id: 'liquid', name: 'Liquid Vibe' }
  ];

  const shapes: { id: ImageShape; name: string }[] = [
    { id: 'circle', name: 'Circle' }, { id: 'square', name: 'Square' },
    { id: 'rounded', name: 'Round' }, { id: 'hexagon', name: 'Hex' },
    { id: 'diamond', name: 'Diamond' }
  ];

  const themes: { id: BgTheme; name: string; color: string }[] = [
    { id: 'midnight', name: 'Midnight', color: '#1e293b' },
    { id: 'deepsea', name: 'Deep Sea', color: '#1e1b4b' },
    { id: 'bloodred', name: 'Maroon', color: '#450a0a' },
    { id: 'forest', name: 'Forest', color: '#064e3b' },
    { id: 'gold', name: 'Stone', color: '#44403c' },
    { id: 'carbon', name: 'Onyx', color: '#262626' },
    { id: 'neon', name: 'Twilight', color: '#2e1065' },
    { id: 'sunset', name: 'Sienna', color: '#7c2d12' },
    { id: 'cream', name: 'Sand', color: '#fef3c7' },
    { id: 'contrast', name: 'Charcoal', color: '#171717' }
  ];

  const presetColors = [
    '#ffffff', '#cbd5e1', '#60a5fa', '#38bdf8', '#4ade80', '#fbbf24', '#f87171', 
    '#c084fc', '#f472b6', '#a3a3a3', '#525252', '#0f172a', '#1e3a8a', '#7f1d1d'
  ];

  const renderSection = (title: string, content: React.ReactNode) => (
    <section className="mb-8 last:mb-0">
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-4 border-b border-slate-800 pb-2">{title}</h3>
      {content}
    </section>
  );

  return (
    <div className="pb-10">
      {renderSection("Content", 
        <div className="space-y-6">
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Headline 1</label>
              <input type="text" value={state.title1} onChange={(e) => onUpdate({ title1: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {presetColors.map(color => (
                <button 
                  key={color} 
                  onClick={() => onUpdate({ title1Color: color })}
                  className={`w-5 h-5 rounded-full border border-slate-600 transition-all ${state.title1Color === color ? 'scale-125 border-white ring-1 ring-white/50' : 'hover:scale-110'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
              <input type="color" value={state.title1Color} onChange={(e) => onUpdate({ title1Color: e.target.value })} className="w-5 h-5 bg-transparent border-0 p-0 cursor-pointer overflow-hidden rounded-full" />
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Headline 2</label>
              <input type="text" value={state.title2} onChange={(e) => onUpdate({ title2: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {presetColors.map(color => (
                <button 
                  key={color} 
                  onClick={() => onUpdate({ title2Color: color })}
                  className={`w-5 h-5 rounded-full border border-slate-600 transition-all ${state.title2Color === color ? 'scale-125 border-white ring-1 ring-white/50' : 'hover:scale-110'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
              <input type="color" value={state.title2Color} onChange={(e) => onUpdate({ title2Color: e.target.value })} className="w-5 h-5 bg-transparent border-0 p-0 cursor-pointer overflow-hidden rounded-full" />
            </div>
          </div>
        </div>
      )}

      {renderSection("Template Style",
        <div className="grid grid-cols-2 gap-2">
          {titleStyles.map((s) => (
            <button key={s.id} onClick={() => onUpdate({ titleStyle: s.id })} className={`py-2 px-1 rounded text-xs font-semibold transition-all border ${state.titleStyle === s.id ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/30' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'}`}>
              {s.name}
            </button>
          ))}
        </div>
      )}

      {renderSection("Title Animation Style",
        <div className="grid grid-cols-2 gap-2">
          {titleAnimStyles.map((s) => (
            <button key={s.id} onClick={() => onUpdate({ titleAnimStyle: s.id })} className={`py-2 px-1 rounded text-xs font-semibold transition-all border ${state.titleAnimStyle === s.id ? 'bg-blue-600 border-blue-500 text-white shadow-lg' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'}`}>
              {s.name}
            </button>
          ))}
        </div>
      )}

      {renderSection("Microphone Animation Style",
        <div className="grid grid-cols-2 gap-2">
          {micStyles.map((s) => (
            <button key={s.id} onClick={() => onUpdate({ micStyle: s.id })} className={`py-2 px-1 rounded text-xs font-semibold transition-all border ${state.micStyle === s.id ? 'bg-orange-600 border-orange-500 text-white shadow-lg shadow-orange-900/30' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'}`}>
              {s.name}
            </button>
          ))}
        </div>
      )}

      {renderSection("Channel Animation Style",
        <div className="grid grid-cols-2 gap-2">
          {animStyles.map((s) => (
            <button key={s.id} onClick={() => onUpdate({ channelAnimStyle: s.id })} className={`py-2 px-1 rounded text-xs font-semibold transition-all border ${state.channelAnimStyle === s.id ? 'bg-purple-600 border-purple-500 text-white shadow-lg' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'}`}>
              {s.name}
            </button>
          ))}
        </div>
      )}

      {renderSection("Speaker Shape",
        <div className="grid grid-cols-5 gap-2">
          {shapes.map((s) => (
            <button key={s.id} onClick={() => onUpdate({ imageShape: s.id })} className={`p-2 rounded text-[10px] font-bold transition-all border ${state.imageShape === s.id ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
              {s.id.charAt(0).toUpperCase()}
            </button>
          ))}
        </div>
      )}

      {renderSection("Color Theme",
        <div className="grid grid-cols-5 gap-2">
          {themes.map((t) => (
            <button key={t.id} onClick={() => onUpdate({ bgTheme: t.id })} className={`w-full aspect-square rounded-full transition-all border-2 ${state.bgTheme === t.id ? 'border-white scale-110 shadow-lg' : 'border-transparent hover:scale-105'}`} style={{ backgroundColor: t.color }} title={t.name} />
          ))}
        </div>
      )}

      {renderSection("Assets",
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div onClick={() => document.getElementById('left-img-input')?.click()} className="aspect-square bg-slate-800 border-2 border-dashed border-slate-700 rounded-xl flex items-center justify-center cursor-pointer hover:border-blue-500 relative overflow-hidden">
              {state.speakerLeft.image ? <img src={state.speakerLeft.image} className="w-full h-full object-cover" /> : <span className="text-[10px] text-slate-500">Left Img</span>}
              <input id="left-img-input" type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'left')} />
            </div>
            <div onClick={() => document.getElementById('right-img-input')?.click()} className="aspect-square bg-slate-800 border-2 border-dashed border-slate-700 rounded-xl flex items-center justify-center cursor-pointer hover:border-blue-500 relative overflow-hidden">
              {state.speakerRight.image ? <img src={state.speakerRight.image} className="w-full h-full object-cover" /> : <span className="text-[10px] text-slate-500">Right Img</span>}
              <input id="right-img-input" type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'right')} />
            </div>
          </div>
          <div onClick={() => document.getElementById('audio-input')?.click()} className="p-3 bg-slate-800 border border-slate-700 rounded-xl cursor-pointer hover:bg-slate-750">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
              <p className="text-xs font-medium text-slate-200 truncate">{state.audioFile ? state.audioFile.name : "Select Audio"}</p>
            </div>
            <input id="audio-input" type="file" accept="audio/*" className="hidden" onChange={handleAudioChange} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;

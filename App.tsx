
import React, { useState } from 'react';
import { VideoState, YoutubeAssets } from './types';
import VideoPreview from './components/VideoPreview';
import Sidebar from './components/Sidebar';
import YouTubeToolkit from './components/YouTubeToolkit';

const App: React.FC = () => {
  const [state, setState] = useState<VideoState>({
    title1: "ভোটের মাঠে রাজনীতিবিদদের ভণ্ডামি ফাঁস!",
    title1Color: "#ffffff",
    title2: "টুপি-পাঞ্জাবি পড়েও রক্ষা নেই",
    title2Color: "#3b82f6",
    titleStyle: 'modern',
    channelAnimStyle: 'slide',
    titleAnimStyle: 'fade',
    imageShape: 'circle',
    bgTheme: 'midnight',
    micStyle: 'classic',
    speakerLeft: { image: null, name: "Speaker 1" },
    speakerRight: { image: null, name: "Speaker 2" },
    audioFile: null,
    audioUrl: null,
    isGenerating: false,
    progress: 0,
  });

  const [videoBlobUrl, setVideoBlobUrl] = useState<string | null>(null);

  const handleUpdate = (updates: Partial<VideoState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const handleSpeakerUpdate = (side: 'left' | 'right', updates: Partial<{ image: string | null; name: string }>) => {
    setState(prev => ({
      ...prev,
      [side === 'left' ? 'speakerLeft' : 'speakerRight']: {
        ...prev[side === 'left' ? 'speakerLeft' : 'speakerRight'],
        ...updates
      }
    }));
  };

  const handleAssetsGenerated = (assets: YoutubeAssets) => {
    setState(prev => ({ ...prev, ytAssets: assets }));
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen overflow-hidden bg-slate-950">
      {/* Sidebar Controls */}
      <div className="w-full lg:w-96 bg-slate-900 border-r border-slate-800 p-5 overflow-y-auto custom-scrollbar">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
             <span className="text-white font-bold">V</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Pro Video Maker</h1>
        </div>
        <Sidebar 
          state={state} 
          onUpdate={handleUpdate} 
          onSpeakerUpdate={handleSpeakerUpdate} 
        />
      </div>

      {/* Main Preview Area */}
      <div className="flex-1 flex flex-col items-start p-4 lg:p-10 overflow-y-auto custom-scrollbar bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 to-black">
        <div className="w-full max-w-5xl mx-auto">
          <div className="w-full aspect-video bg-black rounded-2xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden border border-slate-800 relative group mb-8">
            <VideoPreview 
              state={state} 
              onGenerationComplete={(blob) => setVideoBlobUrl(URL.createObjectURL(blob))}
            />
          </div>

          {videoBlobUrl && (
            <div className="mb-8 flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 px-6 py-3 rounded-xl text-sm font-semibold flex items-center gap-2">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                   <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                 </svg>
                 Video Ready for Download!
               </div>
              <a 
                href={videoBlobUrl} 
                download="politics-video.mp4"
                className="px-10 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all flex items-center gap-3 shadow-xl shadow-emerald-900/40 hover:scale-105 active:scale-95"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Download MP4 High Quality
              </a>
            </div>
          )}

          <YouTubeToolkit state={state} onAssetsGenerated={handleAssetsGenerated} />
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #0f172a; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default App;

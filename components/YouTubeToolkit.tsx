
import React, { useRef, useState } from 'react';
import { VideoState, YoutubeAssets, BgTheme } from '../types';
import { GoogleGenAI } from "@google/genai";

interface YouTubeToolkitProps {
  state: VideoState;
  onAssetsGenerated: (assets: YoutubeAssets) => void;
}

const YouTubeToolkit: React.FC<YouTubeToolkitProps> = ({ state, onAssetsGenerated }) => {
  const [loading, setLoading] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

  const generateAIContent = async () => {
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // 1. Generate Metadata (Titles, Bangla Description, Tags)
      const textPrompt = `Based on the video title "${state.title1} ${state.title2}", generate the following for a viral YouTube video:
      1. 5 attractive trending titles in a mix of Bangla and English.
      2. A long professional SEO-friendly description (approx 200 words) written ENTIRELY in Bangla language (Bengali font).
      3. 15 relevant hashtags starting with #.
      4. The same hashtags/keywords but separated only by commas, WITHOUT any # sign.
      
      Return the response in JSON format with keys: "titles" (array), "description" (string), "hashtags" (string), "keywords" (string).`;

      const textResponse = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: textPrompt,
        config: { responseMimeType: "application/json" }
      });

      const data = JSON.parse(textResponse.text);
      onAssetsGenerated(data);

      // 2. Generate Attractive AI Thumbnail (Improved Prompt for Visuals)
      const parts: any[] = [
        { text: `Create an ultra-high-quality, professional, viral 16:9 YouTube thumbnail background based on: "${state.title1} ${state.title2}".
        CRITICAL INSTRUCTION: DO NOT INCLUDE ANY TEXT, LETTERS, WORDS, OR GIBBERISH CHARACTERS IN THE IMAGE.
        STYLE: Cinematic, high-contrast, dramatic lighting (rim light), vibrant saturated colors. 
        COMPOSITION: Focus on the subjects provided in the images. The background should be a blurred high-stakes environment (like a dark studio, a political rally, or an abstract digital grid). 
        The mood should be intense, mysterious, and click-worthy. Look like a top-tier documentary or news analysis channel.
        Theme: ${state.bgTheme}.` }
      ];

      // Include speaker images if they exist for better AI context
      if (state.speakerLeft.image) {
        parts.push({
          inlineData: {
            data: state.speakerLeft.image.split(',')[1],
            mimeType: 'image/png'
          }
        });
      }
      if (state.speakerRight.image) {
        parts.push({
          inlineData: {
            data: state.speakerRight.image.split(',')[1],
            mimeType: 'image/png'
          }
        });
      }

      const imgResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts },
        config: {
          imageConfig: {
            aspectRatio: "16:9"
          }
        }
      });

      for (const part of imgResponse.candidates[0].content.parts) {
        if (part.inlineData) {
          setThumbnailUrl(`data:image/png;base64,${part.inlineData.data}`);
        }
      }

    } catch (error) {
      console.error("AI Generation failed:", error);
      alert("Failed to generate AI assets. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  return (
    <div className="mt-8 p-6 bg-slate-800/50 rounded-2xl border border-slate-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 4-8 4z"/></svg>
          YouTube Growth Toolkit (AI Powered)
        </h2>
        <button 
          onClick={generateAIContent}
          disabled={loading}
          className={`px-8 py-3 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2 ${loading ? 'bg-slate-700 text-slate-400' : 'bg-red-600 hover:bg-red-700 text-white hover:scale-105 active:scale-95'}`}
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              AI Generating...
            </>
          ) : "Generate AI Thumbnail & SEO Assets"}
        </button>
      </div>

      {thumbnailUrl && (
        <div className="mb-8 space-y-4 animate-in fade-in zoom-in duration-500">
          <label className="text-sm font-bold text-slate-400 block">AI Generated Trending Thumbnail</label>
          <div className="relative aspect-video w-full max-w-2xl rounded-2xl overflow-hidden border-4 border-slate-700 shadow-2xl">
            <img src={thumbnailUrl} className="w-full h-full object-cover" alt="AI Thumbnail" />
            <a href={thumbnailUrl} download="ai-youtube-thumbnail.png" className="absolute bottom-4 right-4 bg-red-600 text-white px-6 py-2 rounded-xl font-bold shadow-xl hover:bg-red-500 transition-colors flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Download Thumbnail
            </a>
          </div>
          <p className="text-xs text-slate-500 italic">Note: Text is intentionally omitted from the image to prevent font errors. Use a photo editor to add custom Bengali text if needed.</p>
        </div>
      )}

      {state.ytAssets && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Top 5 Trending Titles</label>
              <button onClick={() => copyToClipboard(state.ytAssets!.titles.join('\n'))} className="text-xs text-blue-400 hover:text-blue-300 font-bold uppercase">Copy All</button>
            </div>
            <div className="space-y-2">
              {state.ytAssets.titles.map((t, i) => (
                <div key={i} className="flex justify-between items-center bg-slate-900/80 p-3 rounded-xl text-sm group border border-slate-800 hover:border-slate-600 transition-colors">
                  <span className="font-medium">{t}</span>
                  <button onClick={() => copyToClipboard(t)} className="opacity-0 group-hover:opacity-100 p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-all">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Bangla SEO Description</label>
              <button onClick={() => copyToClipboard(state.ytAssets!.description)} className="text-xs text-blue-400 hover:text-blue-300 font-bold uppercase">Copy Description</button>
            </div>
            <div className="bg-slate-900/80 p-5 rounded-xl text-sm leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap border border-slate-800 font-['Hind_Siliguri']">
              {state.ytAssets.description}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Viral Hashtags (#)</label>
                <button onClick={() => copyToClipboard(state.ytAssets!.hashtags)} className="text-xs text-blue-400 hover:text-blue-300 font-bold uppercase">Copy</button>
              </div>
              <div className="bg-slate-900/80 p-4 rounded-xl text-xs break-words border border-slate-800 text-blue-300 leading-6">
                {state.ytAssets.hashtags}
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Keywords (Comma separated)</label>
                <button onClick={() => copyToClipboard(state.ytAssets!.keywords)} className="text-xs text-blue-400 hover:text-blue-300 font-bold uppercase">Copy</button>
              </div>
              <div className="bg-slate-900/80 p-4 rounded-xl text-xs break-words border border-slate-800 text-slate-300 leading-6">
                {state.ytAssets.keywords}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default YouTubeToolkit;

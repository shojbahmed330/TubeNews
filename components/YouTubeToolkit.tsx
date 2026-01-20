
import React, { useState } from 'react';
import { VideoState, YoutubeAssets } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

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
      // Create new instance to ensure latest API key is used
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // 1. Generate Metadata with strict Schema for reliability
      const textPrompt = `Based on the video title "${state.title1} ${state.title2}", generate:
      1. 5 attractive trending titles in a mix of Bangla and English.
      2. A long professional SEO-friendly description (approx 200 words) in Bangla.
      3. 15 relevant hashtags with #.
      4. Keywords separated by commas (no #).`;

      const textResponse = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: textPrompt,
        config: { 
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              titles: { type: Type.ARRAY, items: { type: Type.STRING } },
              description: { type: Type.STRING },
              hashtags: { type: Type.STRING },
              keywords: { type: Type.STRING }
            },
            required: ["titles", "description", "hashtags", "keywords"]
          }
        }
      });

      if (textResponse.text) {
        const data = JSON.parse(textResponse.text);
        onAssetsGenerated(data);
      }

      // 2. Generate Thumbnail Image
      const imageParts: any[] = [
        { text: `A professional, high-impact 16:9 YouTube thumbnail background for a video titled: "${state.title1} ${state.title2}". 
        Theme: ${state.bgTheme}. Visuals: Intense, cinematic, documentary style, vibrant lighting. 
        IMPORTANT: ABSOLUTELY NO TEXT OR CHARACTERS IN THE IMAGE.` }
      ];

      // Add speaker images if available
      if (state.speakerLeft.image?.startsWith('data:image')) {
        imageParts.push({
          inlineData: {
            data: state.speakerLeft.image.split(',')[1],
            mimeType: state.speakerLeft.image.split(';')[0].split(':')[1]
          }
        });
      }
      if (state.speakerRight.image?.startsWith('data:image')) {
        imageParts.push({
          inlineData: {
            data: state.speakerRight.image.split(',')[1],
            mimeType: state.speakerRight.image.split(';')[0].split(':')[1]
          }
        });
      }

      const imgResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: imageParts },
        config: {
          imageConfig: {
            aspectRatio: "16:9"
          }
        }
      });

      const firstImagePart = imgResponse.candidates?.[0]?.content?.parts.find(p => p.inlineData);
      if (firstImagePart?.inlineData) {
        setThumbnailUrl(`data:${firstImagePart.inlineData.mimeType};base64,${firstImagePart.inlineData.data}`);
      }

    } catch (error: any) {
      console.error("AI Generation failed:", error);
      // Detailed error handling for key issues
      if (error.message?.includes("entity was not found")) {
        alert("API Key error. Please re-configure your API Key in Vercel.");
      } else {
        alert("Failed to generate AI assets. Please ensure your API Key is valid and try again.");
      }
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
          className={`px-8 py-3 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2 ${loading ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 text-white hover:scale-105 active:scale-95'}`}
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              AI Thinking...
            </>
          ) : "Generate AI Thumbnail & SEO Assets"}
        </button>
      </div>

      {thumbnailUrl && (
        <div className="mb-8 space-y-4 animate-in fade-in zoom-in duration-500">
          <label className="text-sm font-bold text-slate-400 block">AI Generated Background</label>
          <div className="relative aspect-video w-full max-w-2xl rounded-2xl overflow-hidden border-4 border-slate-700 shadow-2xl group">
            <img src={thumbnailUrl} className="w-full h-full object-cover" alt="AI Thumbnail" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <a href={thumbnailUrl} download="ai-background.png" className="bg-white text-black px-6 py-2 rounded-xl font-bold shadow-xl hover:bg-slate-200 transition-colors flex items-center gap-2">
                Download Image
              </a>
            </div>
          </div>
          <p className="text-xs text-slate-500 italic">Pro Tip: Add your own Bengali text over this professional background for maximum CTR.</p>
        </div>
      )}

      {state.ytAssets && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-bold text-slate-400 uppercase">Suggested Titles</label>
              <button onClick={() => copyToClipboard(state.ytAssets!.titles.join('\n'))} className="text-xs text-blue-400 hover:underline">Copy All</button>
            </div>
            <div className="space-y-2">
              {state.ytAssets.titles.map((t, i) => (
                <div key={i} className="flex justify-between items-center bg-slate-900/60 p-3 rounded-xl text-sm border border-slate-700/50">
                  <span className="font-medium">{t}</span>
                  <button onClick={() => copyToClipboard(t)} className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-bold text-slate-400 uppercase">Bangla SEO Description</label>
              <button onClick={() => copyToClipboard(state.ytAssets!.description)} className="text-xs text-blue-400 hover:underline">Copy</button>
            </div>
            <div className="bg-slate-900/60 p-4 rounded-xl text-sm leading-relaxed max-h-40 overflow-y-auto whitespace-pre-wrap border border-slate-700/50 font-['Hind_Siliguri']">
              {state.ytAssets.description}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Hashtags</label>
              <div className="bg-slate-900/60 p-3 rounded-xl text-xs text-blue-300 border border-slate-700/50">
                {state.ytAssets.hashtags}
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Tags/Keywords</label>
              <div className="bg-slate-900/60 p-3 rounded-xl text-xs text-slate-300 border border-slate-700/50">
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

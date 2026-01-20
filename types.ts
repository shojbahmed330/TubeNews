
export interface SpeakerData {
  image: string | null;
  name: string;
}

export type TitleStyle = 'modern' | 'breaking' | 'minimalist' | 'podcast' | 'talkshow' | 'election' | 'documentary' | 'social' | 'latenight' | 'retro';
export type ChannelAnimStyle = 'fade' | 'slide' | 'scale' | 'typewriter' | 'blur' | 'glow' | 'bounce' | 'rotate' | 'flip' | 'rainbow';
export type TitleAnimStyle = 'none' | 'fade' | 'slide_down' | 'zoom' | 'typewriter' | 'blur' | 'bounce' | 'glow' | 'rainbow' | 'flip';
export type ImageShape = 'circle' | 'square' | 'rounded' | 'hexagon' | 'diamond';
export type BgTheme = 'midnight' | 'deepsea' | 'bloodred' | 'forest' | 'gold' | 'carbon' | 'neon' | 'sunset' | 'cream' | 'contrast';
export type MicStyle = 'classic' | 'neon_ring' | 'radial_bars' | 'concentric' | 'pulse_orb' | 'spectrum' | 'liquid';

export interface YoutubeAssets {
  titles: string[];
  description: string;
  hashtags: string;
  keywords: string;
}

export interface VideoState {
  title1: string;
  title1Color: string;
  title2: string;
  title2Color: string;
  titleStyle: TitleStyle;
  channelAnimStyle: ChannelAnimStyle;
  titleAnimStyle: TitleAnimStyle;
  imageShape: ImageShape;
  bgTheme: BgTheme;
  micStyle: MicStyle;
  speakerLeft: SpeakerData;
  speakerRight: SpeakerData;
  audioFile: File | null;
  audioUrl: string | null;
  isGenerating: boolean;
  progress: number;
  ytAssets?: YoutubeAssets;
}

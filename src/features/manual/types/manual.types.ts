export type ImageInfo = { src: string; alt: string };
export type ManualImages = Record<string, { pc: ImageInfo[]; sp: ImageInfo[] }>;
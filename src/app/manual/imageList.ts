import fs from 'fs';
import path from 'path';

export type ImageInfo = { src: string; alt: string };
export type ManualImages = Record<string, { pc: ImageInfo[]; sp: ImageInfo[] }>;

const SECTIONS = ["login", "connect", "plan", "search", "reply"];
const MODES = ["pc", "sp"] as const;
type Mode = typeof MODES[number];

export async function getManualImages(): Promise<ManualImages> {
  const baseDir = path.join(process.cwd(), 'public', 'manual-images');
  const result: ManualImages = {
    login: { pc: [], sp: [] },
    connect: { pc: [], sp: [] },
    plan: { pc: [], sp: [] },
    search: { pc: [], sp: [] },
    reply: { pc: [], sp: [] },
  };

  for (const section of SECTIONS) {
    for (const mode of MODES) {
      const dir = path.join(baseDir, section, mode);
      let files: string[] = [];
      try {
        files = fs.readdirSync(dir)
          .filter(f => /\.(png|jpg|jpeg|webp|gif)$/i.test(f))
          .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
      } catch (e) {
        continue;
      }
      result[section][mode] = files.map(f => ({
        src: `/manual-images/${section}/${mode}/${f}`,
        alt: `${section} ${mode} ${f}`
      }));
    }
  }
  return result;
} 
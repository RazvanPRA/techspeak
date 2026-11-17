import ffmpegStatic from 'ffmpeg-static';

// ffmpeg-static is CommonJS (`module.exports = path`), but its types declare `export default`,
// so under "nodenext" TypeScript types the default import as the module. At runtime it is the path.
/** Path of the ffmpeg binary bundled by ffmpeg-static, or null on an unsupported platform. */
export const bundledFfmpegPath = ffmpegStatic as unknown as string | null;

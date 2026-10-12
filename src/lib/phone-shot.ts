/**
 * Phone-sized WebP via Next's image optimiser. The originals are up to 2 MB each; at 280px wide a
 * 640w copy is ~40 KB, so app screens are ready before a fast scroll opens them.
 */
export const phoneShot = (src: string, w = 640) => `/_next/image?url=${encodeURIComponent(src)}&w=${w}&q=75`;

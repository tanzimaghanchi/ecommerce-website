import { apiUrl } from "../config/api";

const svgDataUri = (markup) =>
  `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(markup)}`;

export const buildProductFallbackImage = (title, category) =>
  svgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 1100" role="img" aria-label="${String(
      title || "FAISHORA"
    )}">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#f6e7d4"/>
          <stop offset="50%" stop-color="#eab88b"/>
          <stop offset="100%" stop-color="#c76838"/>
        </linearGradient>
      </defs>
      <rect width="900" height="1100" fill="url(#bg)"/>
      <rect x="68" y="72" width="764" height="956" rx="44" fill="rgba(255,248,242,0.18)" stroke="rgba(255,255,255,0.35)"/>
      <text x="110" y="160" fill="#8e3b1b" font-family="Arial, Helvetica, sans-serif" font-size="32" letter-spacing="8">FAISHORA</text>
      <text x="110" y="850" fill="#fffaf5" font-family="Georgia, serif" font-size="92" font-weight="700">${String(
        title || "FAISHORA"
      )}</text>
      <text x="110" y="910" fill="rgba(255,250,245,0.92)" font-family="Arial, Helvetica, sans-serif" font-size="28">${String(
        category || "Premium fashion"
      )}</text>
      <text x="110" y="962" fill="rgba(255,250,245,0.82)" font-family="Arial, Helvetica, sans-serif" font-size="24">Premium fashion selection</text>
      <path d="M205 320c44-56 116-92 182-92 74 0 138 34 176 92 44 68 34 148-8 228-36 70-88 136-128 204-18 30-66 30-84 0-40-68-92-134-128-204-42-80-52-160-10-228z" fill="rgba(255,248,240,0.92)"/>
      <path d="M298 344c26-34 64-54 110-54 50 0 92 20 118 54 34 44 26 98-6 154-28 48-68 96-98 144-8 14-28 14-36 0-30-48-70-96-98-144-32-56-40-110-10-154z" fill="rgba(255,255,255,0.5)"/>
    </svg>
  `);

export const resolveMediaUrl = (value) => {
  if (!value) {
    return "";
  }

  if (/^(https?:|data:)/i.test(value)) {
    return value;
  }

  return apiUrl(value.startsWith("/") ? value : `/${value}`);
};

type PaymentBrandThemeInput = {
  backgroundColor?: string | null;
  seed?: string | null;
};

export type PaymentBrandTheme = {
  base: string;
  baseContrast: string;
  baseDark: string;
  pageBg: string;
  pageBgAlt: string;
  pageTint: string;
  pageMist: string;
  glowA: string;
  glowB: string;
  shellFrom: string;
  shellVia: string;
  shellTo: string;
  shellBorder: string;
  cardBg: string;
  cardMutedBg: string;
  cardBorder: string;
  badgeBg: string;
  badgeText: string;
  accentSoft: string;
  accentText: string;
  buttonShadow: string;
  panelShadow: string;
};

function normalizeHexColor(value?: string | null) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  const withHash = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
  const isShortHex = /^#[0-9a-fA-F]{3}$/.test(withHash);
  const isLongHex = /^#[0-9a-fA-F]{6}$/.test(withHash);

  if (isLongHex) {
    return withHash.toUpperCase();
  }

  if (isShortHex) {
    const [r, g, b] = withHash.slice(1).split("");
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
  }

  return null;
}

function hashString(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function hslToHex(hue: number, saturation: number, lightness: number) {
  const s = saturation / 100;
  const l = lightness / 100;
  const chroma = (1 - Math.abs(2 * l - 1)) * s;
  const segment = hue / 60;
  const x = chroma * (1 - Math.abs((segment % 2) - 1));
  const match = l - chroma / 2;

  let red = 0;
  let green = 0;
  let blue = 0;

  if (segment >= 0 && segment < 1) {
    red = chroma;
    green = x;
  } else if (segment >= 1 && segment < 2) {
    red = x;
    green = chroma;
  } else if (segment >= 2 && segment < 3) {
    green = chroma;
    blue = x;
  } else if (segment >= 3 && segment < 4) {
    green = x;
    blue = chroma;
  } else if (segment >= 4 && segment < 5) {
    red = x;
    blue = chroma;
  } else {
    red = chroma;
    blue = x;
  }

  const toHex = (value: number) =>
    Math.round((value + match) * 255)
      .toString(16)
      .padStart(2, "0");

  return `#${toHex(red)}${toHex(green)}${toHex(blue)}`.toUpperCase();
}

function hexToRgb(value: string) {
  const normalized = normalizeHexColor(value);

  if (!normalized) {
    return null;
  }

  return {
    r: parseInt(normalized.slice(1, 3), 16),
    g: parseInt(normalized.slice(3, 5), 16),
    b: parseInt(normalized.slice(5, 7), 16),
  };
}

function rgbToHex(red: number, green: number, blue: number) {
  const toHex = (value: number) =>
    Math.max(0, Math.min(255, Math.round(value)))
      .toString(16)
      .padStart(2, "0");

  return `#${toHex(red)}${toHex(green)}${toHex(blue)}`.toUpperCase();
}

function mixColors(primary: string, secondary: string, ratio: number) {
  const from = hexToRgb(primary);
  const to = hexToRgb(secondary);

  if (!from || !to) {
    return primary;
  }

  return rgbToHex(
    from.r * (1 - ratio) + to.r * ratio,
    from.g * (1 - ratio) + to.g * ratio,
    from.b * (1 - ratio) + to.b * ratio,
  );
}

function withAlpha(color: string, alpha: number) {
  const rgb = hexToRgb(color);

  if (!rgb) {
    return `rgba(15, 23, 42, ${alpha})`;
  }

  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

function getContrastColor(color: string) {
  const rgb = hexToRgb(color);

  if (!rgb) {
    return "#FFFFFF";
  }

  const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  return brightness > 160 ? "#0F172A" : "#FFFFFF";
}

function getFallbackBase(seed?: string | null) {
  const hash = hashString(seed || "cryptoss-payment");
  const hue = hash % 360;
  const saturation = 60 + (hash % 12);
  const lightness = 42 + (hash % 8);

  return hslToHex(hue, saturation, lightness);
}

export function derivePaymentBrandTheme({
  backgroundColor,
  seed,
}: PaymentBrandThemeInput): PaymentBrandTheme {
  const base = normalizeHexColor(backgroundColor) || getFallbackBase(seed);
  const baseDark = mixColors(base, "#0F172A", 0.38);
  const pageBg = mixColors(base, "#FFF9F2", 0.9);
  const pageBgAlt = mixColors(base, "#E2E8F0", 0.8);
  const pageTint = mixColors(base, "#FFFFFF", 0.78);
  const pageMist = mixColors(base, "#FFFFFF", 0.9);
  const cardBg = mixColors(base, "#FFFFFF", 0.92);
  const cardMutedBg = mixColors(base, "#F8FAFC", 0.84);
  const cardBorder = mixColors(base, "#CBD5E1", 0.62);
  const badgeBg = withAlpha(base, 0.12);
  const badgeText = mixColors(base, "#0F172A", 0.24);
  const accentSoft = mixColors(base, "#FFFFFF", 0.85);
  const accentText = mixColors(base, "#0F172A", 0.16);

  return {
    base,
    baseContrast: getContrastColor(base),
    baseDark,
    pageBg,
    pageBgAlt,
    pageTint,
    pageMist,
    glowA: withAlpha(base, 0.22),
    glowB: withAlpha(mixColors(base, "#F59E0B", 0.48), 0.2),
    shellFrom: mixColors(base, "#FFFFFF", 0.12),
    shellVia: mixColors(base, "#0F172A", 0.18),
    shellTo: mixColors(baseDark, "#020617", 0.3),
    shellBorder: withAlpha(base, 0.2),
    cardBg,
    cardMutedBg,
    cardBorder,
    badgeBg,
    badgeText,
    accentSoft,
    accentText,
    buttonShadow: withAlpha(base, 0.26),
    panelShadow: withAlpha(baseDark, 0.14),
  };
}

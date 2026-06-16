type BrandMarkProps = {
  /** Width/height in pixels (icon is square). */
  size?: number;
  /** Use "onDark" when placing the mark over a navy/dark background (footer, CTA panels, admin login). */
  tone?: "default" | "onDark";
  className?: string;
};

/**
 * Bohac Med adapted mark: the parent firm's column ("justice") motif,
 * topped with a health cross, fused in the Bohac Med palette.
 * Gold (protagonist) forms the columns/base; navy (supporting, inherited
 * from Bohac Advocacia) forms the lintel and cross.
 */
export default function BrandMark({ size = 40, tone = "default", className }: BrandMarkProps) {
  const structureColor = tone === "onDark" ? "var(--gold-light)" : "var(--gold)";
  const accentColor = tone === "onDark" ? "var(--cream)" : "var(--navy)";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Health cross */}
      <rect x="29" y="3" width="6" height="16" fill={accentColor} />
      <rect x="24" y="8" width="16" height="6" fill={accentColor} />
      {/* Lintel / entablature */}
      <rect x="8" y="19" width="48" height="6" fill={accentColor} />
      {/* Capitals */}
      <rect x="12" y="25" width="16" height="4" fill={structureColor} />
      <rect x="36" y="25" width="16" height="4" fill={structureColor} />
      {/* Column shafts */}
      <rect x="16" y="29" width="8" height="26" fill={structureColor} />
      <rect x="40" y="29" width="8" height="26" fill={structureColor} />
      {/* Base plinth */}
      <rect x="8" y="55" width="48" height="5" fill={structureColor} />
    </svg>
  );
}

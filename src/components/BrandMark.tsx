export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`brand ${compact ? "brand--compact" : ""}`} aria-label="Before You Approve">
      <svg className="brand__mark" viewBox="0 0 32 32" aria-hidden="true">
        <rect x="4.5" y="4.5" width="23" height="23" rx="5" />
        <path d="m9.5 16.3 4.2 4.2 8.9-9.2" />
        <path d="M9.5 9.5h7" />
      </svg>
      {!compact && <span className="brand__name">Before You <strong>Approve</strong></span>}
    </div>
  );
}

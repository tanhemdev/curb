// Curb's mark: a red-painted curb with a couch and a box left out on it.
// On hover the box hops up onto the curb ("kick it to the curb").

export default function Logo({ size = 36, className = '' }) {
  return (
    <svg className={`logo-mark ${className}`} width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <g>
        <rect width="64" height="64" fill="#fff4e0" />
        {/* street */}
        <rect y="50" width="64" height="14" fill="#2c2c2e" />
        <rect x="6" y="56" width="10" height="2" rx="1" fill="#f5c400" />
        <rect x="28" y="56" width="10" height="2" rx="1" fill="#f5c400" />
        <rect x="50" y="56" width="10" height="2" rx="1" fill="#f5c400" />
        {/* sidewalk and red curb */}
        <rect y="36" width="64" height="5" fill="#d8d3c8" />
        <rect y="41" width="64" height="9" fill="#e60023" />
        <rect y="41" width="64" height="2" fill="#ff4d63" />
        {/* couch */}
        <g className="logo-couch">
          <rect x="7" y="20" width="24" height="10" rx="3" fill="#f7f3ea" stroke="#1d1d1f" strokeWidth="2" />
          <rect x="5" y="26" width="28" height="9" rx="3" fill="#f7f3ea" stroke="#1d1d1f" strokeWidth="2" />
          <path d="M19 27v7" stroke="#1d1d1f" strokeWidth="1.6" />
          <path d="M8 35v2M30 35v2" stroke="#1d1d1f" strokeWidth="2" strokeLinecap="round" />
        </g>
        {/* box */}
        <g className="logo-box">
          <rect x="38" y="23" width="17" height="13" rx="1.5" fill="#cf9b5c" stroke="#1d1d1f" strokeWidth="2" />
          <path d="M46.5 23v5" stroke="#1d1d1f" strokeWidth="2" />
          <path d="M41 31h6" stroke="#8a5a26" strokeWidth="1.6" strokeLinecap="round" />
        </g>
      </g>
    </svg>
  );
}

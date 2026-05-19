/** Large decorative football watermark + pitch center-circle arc.
 *  Drop this inside any hero div that has position:relative + overflow:hidden. */
export default function HeroBall({ size = 200, opacity = 0.07 }: { size?: number; opacity?: number }) {
  return (
    <>
      {/* Football watermark — classic Telstar pentagon+seam design */}
      <svg
        style={{
          position: 'absolute', right: -size * 0.25, top: '50%',
          transform: 'translateY(-55%)',
          opacity, pointerEvents: 'none',
        }}
        width={size} height={size} viewBox="0 0 200 200" fill="none"
        aria-hidden="true"
      >
        {/* Outer circle */}
        <circle cx="100" cy="100" r="90" stroke="white" strokeWidth="3"/>
        {/* Central pentagon */}
        <polygon
          points="100,58 140,87 125,130 75,130 60,87"
          stroke="white" strokeWidth="2.5"
          fill="rgba(255,255,255,.12)"
        />
        {/* Seam lines from pentagon vertices to circle edge */}
        <line x1="100" y1="10"  x2="100" y2="58"  stroke="white" strokeWidth="2"/>
        <line x1="185" y1="70"  x2="140" y2="87"  stroke="white" strokeWidth="2"/>
        <line x1="168" y1="170" x2="125" y2="130" stroke="white" strokeWidth="2"/>
        <line x1="32"  y1="170" x2="75"  y2="130" stroke="white" strokeWidth="2"/>
        <line x1="15"  y1="70"  x2="60"  y2="87"  stroke="white" strokeWidth="2"/>
        {/* Adjacent partial pentagons */}
        <polygon points="100,10 140,28 152,58 100,58 48,58 60,28"
          stroke="white" strokeWidth="1.2" fill="none" opacity=".6"/>
        <polygon points="185,70 190,110 168,140 140,130 125,130 140,87"
          stroke="white" strokeWidth="1.2" fill="none" opacity=".6"/>
        <polygon points="32,170 15,140 10,110 60,87 75,130 32,170"
          stroke="white" strokeWidth="1.2" fill="none" opacity=".6"/>
      </svg>

      {/* Pitch center-circle arc (only bottom half visible through overflow:hidden) */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', bottom: -72, left: '50%',
          transform: 'translateX(-50%)',
          width: 200, height: 200, borderRadius: '50%',
          border: '1.5px solid rgba(255,255,255,.1)',
          pointerEvents: 'none',
        }}
      />
      {/* Pitch center spot */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', bottom: -3, left: '50%',
          transform: 'translateX(-50%)',
          width: 6, height: 6, borderRadius: '50%',
          background: 'rgba(255,255,255,.2)',
          pointerEvents: 'none',
        }}
      />
    </>
  )
}

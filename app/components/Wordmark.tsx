/** BEAT·A·FRIEND brand wordmark with small football icons.
 *  Use inside dark (navy) hero sections. */

function BallIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="7" stroke="rgba(255,255,255,.65)" strokeWidth="1.2"/>
      <polygon
        points="8,3.5 10.8,5.6 9.8,8.9 6.2,8.9 5.2,5.6"
        fill="rgba(255,255,255,.35)" stroke="rgba(255,255,255,.5)" strokeWidth=".8"
      />
      <line x1="8"    y1="1"    x2="8"    y2="3.5"  stroke="rgba(255,255,255,.4)" strokeWidth=".9"/>
      <line x1="14.4" y1="4.8"  x2="10.8" y2="5.6"  stroke="rgba(255,255,255,.4)" strokeWidth=".9"/>
      <line x1="12.9" y1="13"   x2="9.8"  y2="8.9"  stroke="rgba(255,255,255,.4)" strokeWidth=".9"/>
      <line x1="3.1"  y1="13"   x2="6.2"  y2="8.9"  stroke="rgba(255,255,255,.4)" strokeWidth=".9"/>
      <line x1="1.6"  y1="4.8"  x2="5.2"  y2="5.6"  stroke="rgba(255,255,255,.4)" strokeWidth=".9"/>
    </svg>
  )
}

export default function Wordmark({ center = true }: { center?: boolean }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      justifyContent: center ? 'center' : 'flex-start',
    }}>
      <BallIcon size={14} />
      <p style={{
        fontFamily: 'var(--font-display)', fontWeight: 800,
        fontSize: 12, letterSpacing: '.16em', textTransform: 'uppercase',
        color: 'rgba(255,255,255,.8)',
      }}>
        BEAT<span style={{ color: '#00C46A' }}>·A·</span>FRIEND
      </p>
      <BallIcon size={14} />
    </div>
  )
}

// Apple-Watch-style concentric activity rings.
// rings: [{ value (0-1), color, trackColor }], outermost first.
export default function ActivityRing({ rings, size = 44, strokeWidth = 5, gap = 2 }) {
  const center = size / 2
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="block">
      {rings.map((ring, i) => {
        const radius = center - strokeWidth / 2 - i * (strokeWidth + gap)
        if (radius <= 0) return null
        const circumference = 2 * Math.PI * radius
        const clamped = Math.max(0, Math.min(1, ring.value))
        const offset = circumference * (1 - clamped)
        return (
          <g key={i}>
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={ring.trackColor}
              strokeWidth={strokeWidth}
            />
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={ring.color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              transform={`rotate(-90 ${center} ${center})`}
              style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
            />
          </g>
        )
      })}
    </svg>
  )
}

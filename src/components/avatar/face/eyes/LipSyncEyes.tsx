import { useAppStore } from '../../../../store'
import type { AppState } from '../../../../store'

export default function LipSyncEyes() {
  const frame = useAppStore((state: AppState) => state.lipSyncFrame)
  const eyeColor = useAppStore((state: AppState) => state.options.eyeColor) || '#634e34'
  
  let blink = 0
  let squint = 0
  
  if (frame) {
    blink = frame.expression.blink
    squint = frame.expression.squint
  }

  // Blink: treat as binary snap — closed above 0.5, open below
  const isBlinked = blink > 0.5

  // Squint shrinks the eye aperture
  const openness = 1 - squint * 0.4 // squint up to 40%

  const renderEye = (cx: number) => {
    // If blinked, show a closed-eye line
    if (isBlinked) {
      return (
        <g key={cx}>
          <path
            d={`M${cx - 14},22 Q${cx},29 ${cx + 14},22`}
            stroke="#000000"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        </g>
      )
    }

    const eyeRy = 10 * openness
    const pupilRy = 4.5 * openness
    const irisRy = 7 * openness

    return (
      <g key={cx}>
        {/* Eye white (sclera) */}
        <ellipse
          cx={cx}
          cy={22}
          rx={14}
          ry={eyeRy}
          fill="#FFFFFF"
          stroke="#000000"
          strokeWidth="0.8"
          strokeOpacity="0.15"
        />
        {/* Iris */}
        <ellipse
          cx={cx}
          cy={22}
          rx={7}
          ry={irisRy}
          fill={eyeColor}
        />
        {/* Pupil */}
        <ellipse
          cx={cx}
          cy={22}
          rx={4.5}
          ry={pupilRy}
          fill="#000000"
        />
        {/* Pupil highlight */}
        <circle
          cx={cx + 2.5}
          cy={19.5}
          r={2}
          fill="#FFFFFF"
          opacity={0.7}
        />
        {/* Lower eyelid shadow for depth */}
        <ellipse
          cx={cx}
          cy={22 + eyeRy * 0.7}
          rx={12}
          ry={2}
          fill="#000000"
          opacity={0.04}
        />
      </g>
    )
  }

  return (
    <g id="Eyes/LipSync" transform="translate(0.000000, 8.000000)">
      {renderEye(30)}
      {renderEye(82)}
    </g>
  )
}

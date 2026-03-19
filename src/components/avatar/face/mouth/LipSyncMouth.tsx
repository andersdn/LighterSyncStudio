import { useRef } from 'react'
import { useAppStore } from '../../../../store'
import type { AppState } from '../../../../store'
import type { VisemeCategory } from 'lighter-sync'

const LIP = '#c47060'
const LIP_DK = '#a04838'
const MOUTH_INNER = '#401818'
const TEETH = '#f0ece4'
const TONGUE = '#c06058'

// Scale factor matching the Zdog demo
const S = 0.9

export default function LipSyncMouth() {
  const frame = useAppStore((state: AppState) => state.lipSyncFrame)

  // Track previous viseme + transition for smooth blending
  const stateRef = useRef({
    currentViseme: 'SILENT' as string,
    targetViseme: 'SILENT' as string,
    transitionT: 1,
    lastTime: performance.now(),
    aperture: 0,
    width: 0.5,
  })

  // Default static smile when no frame playing
  if (!frame) {
    return (
      <g id="Mouth/Neutral" transform="translate(2.000000, 52.000000)">
        {/* Neutral resting mouth — simple closed line */}
        <path
          d={`M${54 - 8 * S},24 Q${54},${24 + 3 * S} ${54 + 8 * S},24`}
          stroke={LIP}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      </g>
    )
  }

  const { aperture, width, visemeId } = frame
  const st = stateRef.current
  const now = performance.now()
  const dt = now - st.lastTime
  st.lastTime = now

  // Smooth interpolation of aperture/width
  const lerpF = 0.35
  st.aperture += (aperture - st.aperture) * lerpF
  st.width += (width - st.width) * lerpF

  // Viseme transition tracking
  const TRANSITION_MS = 90
  if (visemeId !== st.targetViseme) {
    st.currentViseme = st.targetViseme
    st.targetViseme = visemeId
    st.transitionT = 0
  }
  if (st.transitionT < 1) {
    st.transitionT = Math.min(1, st.transitionT + dt / TRANSITION_MS)
  }
  // Smoothstep easing
  const t = st.transitionT * st.transitionT * (3 - 2 * st.transitionT)

  // Use target viseme for drawing (with smooth aperture/width)
  const activeViseme = t > 0.5 ? st.targetViseme : st.currentViseme

  const cx = 54
  const cy = 24
  const a = st.aperture
  const w = st.width

  // Scale factors matching the Zdog demo
  const scaleX = 0.5 + w * 0.7
  const scaleY = 0.4 + a * 0.8

  return (
    <g id="Mouth/LipSync" transform="translate(2.000000, 52.000000)">
      {renderViseme(activeViseme as VisemeCategory, cx, cy, scaleX, scaleY, a)}
    </g>
  )
}

function renderViseme(
  viseme: VisemeCategory | string,
  cx: number,
  cy: number,
  sx: number,
  sy: number,
  aperture: number,
) {
  const clipId = 'mouth-clip-active'

  switch (viseme) {
    case 'SILENT':
      return (
        <path
          d={`M${cx - 8 * S * sx},${cy} Q${cx - 4 * S * sx},${cy + 4 * S * sy} ${cx},${cy + 3 * S * sy} Q${cx + 4 * S * sx},${cy + 4 * S * sy} ${cx + 8 * S * sx},${cy}`}
          stroke={LIP}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      )

    case 'CLOSED':
      return (
        <g>
          {/* Upper lip */}
          <path
            d={`M${cx - 9 * S * sx},${cy} Q${cx},${cy - 2 * S * sy} ${cx + 9 * S * sx},${cy}`}
            stroke={LIP}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          {/* Lower lip */}
          <path
            d={`M${cx - 8 * S * sx},${cy + 0.5} Q${cx},${cy + 2 * S * sy} ${cx + 8 * S * sx},${cy + 0.5}`}
            stroke={LIP_DK}
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />
        </g>
      )

    case 'DENTAL': {
      const mw = 16 * S * sx
      const mh = 7 * S * sy
      return (
        <g>
          <defs>
            <clipPath id={clipId}>
              <ellipse cx={cx} cy={cy} rx={mw / 2} ry={mh / 2} />
            </clipPath>
          </defs>
          {/* Mouth cavity */}
          <ellipse cx={cx} cy={cy} rx={mw / 2} ry={mh / 2} fill={MOUTH_INNER} />
          <g clipPath={`url(#${clipId})`}>
            {/* Upper teeth */}
            <rect
              x={cx - 7 * S * sx}
              y={cy - mh / 2}
              width={14 * S * sx}
              height={3 * S * sy}
              fill={TEETH}
            />
          </g>
          {/* Upper lip */}
          <path
            d={`M${cx - 10 * S * sx},${cy - mh / 2} Q${cx},${cy - mh / 2 - 3 * S * sy} ${cx + 10 * S * sx},${cy - mh / 2}`}
            stroke={LIP}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          {/* Lower lip */}
          <path
            d={`M${cx - 9 * S * sx},${cy + mh / 2} Q${cx},${cy + mh / 2 + 2 * S * sy} ${cx + 9 * S * sx},${cy + mh / 2}`}
            stroke={LIP_DK}
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />
        </g>
      )
    }

    case 'OPEN': {
      const mw = 20 * S * sx
      const mh = 16 * S * sy
      return (
        <g>
          <defs>
            <clipPath id={clipId}>
              <ellipse cx={cx} cy={cy} rx={mw / 2} ry={mh / 2} />
            </clipPath>
          </defs>
          {/* Mouth cavity */}
          <ellipse cx={cx} cy={cy} rx={mw / 2} ry={mh / 2} fill={MOUTH_INNER} />
          <g clipPath={`url(#${clipId})`}>
            {/* Tongue */}
            <ellipse
              cx={cx}
              cy={cy + 3 * S * sy}
              rx={6 * S * sx}
              ry={3.5 * S * sy}
              fill={TONGUE}
            />
            {/* Upper teeth */}
            <rect
              x={cx - 8 * S * sx}
              y={cy - mh / 2}
              width={16 * S * sx}
              height={3 * S * sy}
              fill={TEETH}
            />
          </g>
          {/* Upper lip */}
          <path
            d={`M${cx - 11 * S * sx},${cy - mh / 2} Q${cx},${cy - mh / 2 - 4 * S * sy} ${cx + 11 * S * sx},${cy - mh / 2}`}
            stroke={LIP}
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
          {/* Lower lip */}
          <path
            d={`M${cx - 10 * S * sx},${cy + mh / 2} Q${cx},${cy + mh / 2 + 3 * S * sy} ${cx + 10 * S * sx},${cy + mh / 2}`}
            stroke={LIP_DK}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        </g>
      )
    }

    case 'ROUND': {
      const mw = 12 * S * sx
      const mh = 10 * S * sy
      return (
        <g>
          {/* Mouth cavity */}
          <ellipse cx={cx} cy={cy} rx={mw / 2} ry={mh / 2} fill={MOUTH_INNER} />
          {/* Lip ring */}
          <ellipse
            cx={cx}
            cy={cy}
            rx={7.5 * S * sx}
            ry={6.5 * S * sy}
            fill="none"
            stroke={LIP}
            strokeWidth="2.5"
          />
        </g>
      )
    }

    case 'FRICATIVE': {
      const mw = 14 * S * sx
      const mh = 5 * S * sy
      return (
        <g>
          <defs>
            <clipPath id={clipId}>
              <ellipse cx={cx} cy={cy} rx={mw / 2} ry={mh / 2} />
            </clipPath>
          </defs>
          {/* Mouth cavity */}
          <ellipse cx={cx} cy={cy} rx={mw / 2} ry={mh / 2} fill={MOUTH_INNER} />
          <g clipPath={`url(#${clipId})`}>
            {/* Teeth bar */}
            <rect
              x={cx - 6 * S * sx}
              y={cy - 1.5 * S * sy}
              width={12 * S * sx}
              height={2 * S * sy}
              fill={TEETH}
            />
          </g>
          {/* Upper lip */}
          <path
            d={`M${cx - 9 * S * sx},${cy - mh / 2} Q${cx},${cy - mh / 2 - 2.5 * S * sy} ${cx + 9 * S * sx},${cy - mh / 2}`}
            stroke={LIP}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          {/* Lower lip */}
          <path
            d={`M${cx - 8 * S * sx},${cy + mh / 2} Q${cx},${cy + mh / 2 + 1.5 * S * sy} ${cx + 8 * S * sx},${cy + mh / 2}`}
            stroke={LIP_DK}
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />
        </g>
      )
    }

    default:
      return (
        <path
          d={`M${cx - 6},${cy} Q${cx},${cy + 2} ${cx + 6},${cy}`}
          stroke={LIP}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      )
  }
}

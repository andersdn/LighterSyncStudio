import * as React from 'react'
import { useAppStore } from '../../../store'

import Eyebrow from './eyebrow'
import LipSyncEyes from './eyes/LipSyncEyes'
import LipSyncMouth from './mouth/LipSyncMouth'
import Nose from './nose/Default'

import type { AppState } from '../../../store'

export default function Face() {
  const frame = useAppStore((state: AppState) => state.lipSyncFrame)
  const raise = frame?.expression?.eyebrowRaise || 0
  const transform = `translate(0, ${-raise * 4})`

  return (
    <g id='Face' transform='translate(76.000000, 82.000000)' fill='#000000'>
      <LipSyncMouth />
      <Nose />
      <LipSyncEyes />
      <g transform={transform}>
        <Eyebrow />
      </g>
    </g>
  )
}

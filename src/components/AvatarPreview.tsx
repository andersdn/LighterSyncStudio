import React from 'react'
import Avatar from './avatar'
import { useAppStore } from '../store'
import type { AppState } from '../store'
import COLOR_HEXMAP from '../colorMap'

export default function AvatarPreview() {
  const avatarStyle = useAppStore((state: AppState) => state.options.avatarStyle)
  const bgC = useAppStore((state: AppState) => state.options.backgroundColor)
  const bgImg = useAppStore((state: AppState) => state.options.backgroundImageUrl)
  
  const resolvedBgC = bgC ? (bgC.startsWith('#') || bgC === 'transparent' ? bgC : COLOR_HEXMAP[bgC] || bgC) : undefined

  return (
    <div 
      className="flex items-end justify-center w-full h-full bg-cover bg-center rounded-[inherit]"
      style={{ backgroundColor: resolvedBgC, backgroundImage: bgImg ? `url(${bgImg})` : undefined }}
    >
      <Avatar avatarStyle={avatarStyle as any} className="w-full drop-shadow-sm" style={{ marginBottom: '-2px', transform: 'scale(1.15)', transformOrigin: 'bottom center' }} />
    </div>
  )
}

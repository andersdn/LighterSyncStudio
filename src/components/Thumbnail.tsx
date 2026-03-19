import React, { useMemo } from 'react'
import Piece, { AvatarStyle } from './avatar/piece'
import { PreviewContext } from './PreviewContext'
import { useAppStore } from '../store'
import type { AvatarOptions } from '../store'

interface Props {
  sectionKey: keyof AvatarOptions
  optValue: string
}

export default function Thumbnail({ sectionKey, optValue }: Props) {
  const previewData = useMemo(() => {
    // Top renders facial hair and accessories implicitly — suppress for isolation.
    // Force a visible hair color so thumbnails don't appear grey/dark.
    // Force a visible facial hair color too.
    return { 
      facialHairType: sectionKey === 'facialHairType' ? optValue : 'Blank',
      facialHairColor: 'Auburn',
      accessoriesType: 'Blank',
      hairColor: 'Auburn',
      [sectionKey]: optValue 
    } as any
  }, [sectionKey, optValue])

  const avatarStyle = useAppStore(state => state.options.avatarStyle)

  let pieceType = ''
  let viewBox = '0 0 264 280'
  
  if (sectionKey === 'facialHairType') {
    pieceType = 'facialHair'
    viewBox = '60 100 144 100'
  } else if (sectionKey === 'topType') {
    pieceType = 'top'
    viewBox = '30 0 204 120'
  } else if (sectionKey === 'accessoriesType') {
    pieceType = 'accessories'
    viewBox = '60 70 144 60'
  } else if (sectionKey === 'clotheType') {
    pieceType = 'clothe'
    viewBox = '0 150 264 130'
  } else if (sectionKey === 'skinColor') {
    pieceType = 'skin'
    viewBox = '40 60 184 150'
  }

  // Fallback if not supported
  if (!pieceType) return null

  return (
    <div className="w-full h-full absolute inset-0 overflow-hidden rounded-2xl pointer-events-none flex items-center justify-center pt-2">
      <div className="w-full h-full p-2">
        <PreviewContext.Provider value={previewData}>
           <Piece 
             pieceSize="100%" 
             pieceType={pieceType} 
             viewBox={viewBox} 
             avatarStyle={avatarStyle as AvatarStyle} 
           />
        </PreviewContext.Provider>
      </div>
    </div>
  )
}

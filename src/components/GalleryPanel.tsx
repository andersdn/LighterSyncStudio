import React, { useEffect, useState } from 'react'
import { get, set } from 'idb-keyval'
import { Trash2 } from 'lucide-react'
import Avatar from './avatar'
import { PreviewContext } from './PreviewContext'
import { useAppStore } from '../store'
import type { AvatarOptions } from '../store'

interface SavedAvatar {
  id: string
  name: string
  options: AvatarOptions
  date: number
}

function GalleryThumbnail({ opts }: { opts: AvatarOptions }) {
  return (
    <PreviewContext.Provider value={opts}>
      <Avatar avatarStyle={opts.avatarStyle as any} className="w-full h-full" />
    </PreviewContext.Provider>
  )
}

export default function GalleryPanel() {
  const [avatars, setAvatars] = useState<SavedAvatar[]>([])
  const setOption = useAppStore(state => state.setOption)

  useEffect(() => {
    loadAvatars()
  }, [])

  const loadAvatars = async () => {
    const data = await get('saved_avatars') || []
    setAvatars(data)
  }

  const deleteAvatar = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const latest = avatars.filter(a => a.id !== id)
    await set('saved_avatars', latest)
    setAvatars(latest)
  }

  const loadIntoEditor = (opts: AvatarOptions) => {
    Object.entries(opts).forEach(([key, value]) => {
      setOption(key as keyof AvatarOptions, value as any)
    })
  }

  return (
    <div className="flex flex-col h-full bg-app-surface p-6 overflow-y-auto w-full">
      <h2 className="text-xl font-bold mb-4">Your Gallery</h2>
      
      {avatars.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
          <p className="font-bold text-lg mb-2">No avatars saved yet!</p>
          <p className="text-sm">Create one and click Save.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {avatars.map((av) => (
            <div 
              key={av.id}
              onClick={() => loadIntoEditor(av.options)}
              className="bg-app-bg border-2 border-app-border p-3 rounded-2xl cursor-pointer hover:border-app-accent transition-all group relative aspect-square flex flex-col items-center justify-center overflow-hidden"
            >
              <div className="w-full flex-1 flex items-center justify-center p-2">
                <GalleryThumbnail opts={av.options} />
              </div>
              <div className="z-10 text-center font-bold text-gray-600 text-xs mt-1 truncate w-full">
                {av.name}
              </div>
              
              <button 
                onClick={(e) => deleteAvatar(av.id, e)}
                className="absolute top-2 right-2 p-2 bg-red-100 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-200 z-20"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

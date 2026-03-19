import { useState, useRef } from 'react'
import { Save, Image as ImageIcon, Play, X } from 'lucide-react'
import { set, get } from 'idb-keyval'
import AvatarPreview from './components/AvatarPreview'
import LipSyncPanel from './components/LipSyncPanel'
import GalleryPanel from './components/GalleryPanel'
import Thumbnail from './components/Thumbnail'
import StartPage from './components/StartPage'
import { useAppStore } from './store'
import type { AvatarOptions } from './store'
import { cn } from './lib/utils'
import COLOR_HEXMAP from './colorMap'

// Tabs for sections
const SECTIONS = [
  { id: 'skin', icon: '🧑', label: 'Skin', key: 'skinColor', colors: ['skinColor'] },
  { id: 'eyes', icon: '👁️', label: 'Eyes', key: 'eyeColor' },
  { id: 'hair', icon: '💈', label: 'Hair', key: 'topType', colors: ['hairColor', 'hatColor'] },
  { id: 'facialHair', icon: '✂️', label: 'Facial Hair', key: 'facialHairType', colors: ['facialHairColor'] },
  { id: 'clothe', icon: '👔', label: 'Clothes', key: 'clotheType', colors: ['clotheColor'] },
  { id: 'accessories', icon: '👓', label: 'Accessories', key: 'accessoriesType' },
  { id: 'bg', icon: '🖼️', label: 'Background', key: 'backgroundColor', colors: ['backgroundColor'] }
]

const EYE_COLORS = [
  { name: 'Brown', hex: '#634e34' },
  { name: 'Dark Brown', hex: '#3b2314' },
  { name: 'Hazel', hex: '#8a7044' },
  { name: 'Amber', hex: '#b5802a' },
  { name: 'Green', hex: '#3d671d' },
  { name: 'Blue', hex: '#2e6ca4' },
  { name: 'Light Blue', hex: '#77b5e3' },
  { name: 'Grey', hex: '#808fa0' },
  { name: 'Ice', hex: '#a3c5d9' },
  { name: 'Violet', hex: '#6f4685' },
]



export default function App() {
  const [showStudio, setShowStudio] = useState(false)
  const [activeTab, setActiveTab] = useState(SECTIONS[0].id)
  const [showLipSync, setShowLipSync] = useState(false)
  const [showGallery, setShowGallery] = useState(false)
  const availableOptions = useAppStore(state => state.availableOptions)
  const options = useAppStore(state => state.options)
  const setOption = useAppStore(state => state.setOption)
  const avatarContainerRef = useRef<HTMLDivElement>(null)


  const currentSection = SECTIONS.find(s => s.id === activeTab) || SECTIONS[0]
  const currentOptions = availableOptions[currentSection.key] || []

  if (!showStudio) {
    return <StartPage onStart={() => setShowStudio(true)} />
  }

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-app-bg text-app-text overflow-y-auto md:overflow-hidden">

      {/* Left Panel: Avatar Preview & Actions */}
      <div className="w-full md:w-[400px] lg:w-[480px] shrink-0 md:h-full flex flex-col items-center justify-start p-4 md:p-6 bg-app-surface border-b md:border-b-0 md:border-r border-app-border shadow-sm z-10">
        <header className="w-full flex justify-between items-center mb-4 md:mb-6">
          <h1 className="text-xl font-bold tracking-tight">LighterSync Studio</h1>
          <a href="https://andersdn.com" target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-app-accent hover:text-app-accent-hover transition-colors rounded-full px-4 py-2 border-2 border-app-border hover:border-app-accent">
            Made by Anders
          </a>
        </header>

        <div ref={avatarContainerRef} className="w-full max-w-[320px] md:max-w-sm aspect-square flex-none rounded-3xl flex items-center justify-center relative shadow-inner overflow-hidden border-4 border-app-border mb-6">
          <AvatarPreview />
        </div>

        <div className="w-full grid grid-cols-3 gap-3">
          <button
            onClick={async () => {
              const avatars = await get('saved_avatars') || []
              avatars.push({
                id: Date.now().toString(),
                name: `Avataaar ${avatars.length + 1}`,
                options: { ...options },
                date: Date.now()
              })
              await set('saved_avatars', avatars)
              alert("Saved to gallery!")
            }}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-app-bg border-2 border-app-border hover:border-app-accent hover:text-app-accent transition-all font-bold text-sm"
          >
            <Save className="w-6 h-6 mb-1" /> Save
          </button>
          <button
            onClick={() => {
              setShowGallery(!showGallery)
              setShowLipSync(false)
            }}
            className={cn(
              "flex flex-col items-center justify-center p-3 rounded-2xl transition-all font-bold text-sm shadow-sm border-2",
              showGallery ? "bg-blue-50 text-blue-500 border-blue-500 hover:bg-blue-100" : "bg-app-bg border-app-border hover:border-app-accent hover:text-app-accent"
            )}
          >
            {showGallery ? (
              <><X className="w-6 h-6 mb-1" /> Close Gallery</>
            ) : (
              <><ImageIcon className="w-6 h-6 mb-1" /> Gallery</>
            )}
          </button>
          <button
            onClick={() => {
              setShowLipSync(!showLipSync)
              setShowGallery(false)
            }}
            className={cn(
              "flex flex-col items-center justify-center p-3 rounded-2xl transition-all font-bold text-sm shadow-sm border-2",
              showLipSync ? "bg-red-50 text-red-500 border-red-500 hover:bg-red-100" : "bg-app-accent text-white border-transparent hover:bg-app-accent-hover"
            )}
          >
            {showLipSync ? (
              <><X className="w-6 h-6 mb-1" />Close LipSync</>
            ) : (
              <><Play className="w-6 h-6 mb-1" />LipSync</>
            )}
          </button>
        </div>
      </div>

      {/* Right Panel: Editor Controls or LipSync Panel or Gallery */}
      <div className="flex-1 h-[55%] md:h-full flex flex-col bg-app-bg">
        {showLipSync ? (
          <LipSyncPanel svgContainerRef={avatarContainerRef} />
        ) : showGallery ? (
          <GalleryPanel />
        ) : (
          <>
            {/* Category Tabs */}
            <div className="w-full bg-app-surface border-b border-app-border shrink-0">
              <div className="px-3 md:px-4 py-3 flex flex-wrap gap-1.5 md:gap-2">
                {SECTIONS.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveTab(section.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-xs md:text-sm font-bold transition-all border-2",
                      activeTab === section.id
                        ? "border-app-accent text-app-accent bg-app-accent/5"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <span className="text-base md:text-lg">{section.icon}</span>
                    <span className="whitespace-nowrap">{section.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8">
              <h2 className="text-lg font-bold mb-4 ml-1">{currentSection.label}</h2>

              {/* Eye color swatches (special — hex values) */}
              {currentSection.id === 'eyes' && (
                <div className="mb-6">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 ml-1">
                    Iris Color
                  </h3>
                  <div className="flex flex-wrap gap-3 px-1">
                    {EYE_COLORS.map(ec => {
                      const isSelected = options.eyeColor === ec.hex
                      return (
                        <button
                          key={ec.hex}
                          onClick={() => setOption('eyeColor', ec.hex)}
                          className={cn(
                            "w-11 h-11 rounded-full border-2 transition-all p-0.5",
                            isSelected ? "border-app-accent scale-110" : "border-transparent hover:scale-105"
                          )}
                          title={ec.name}
                        >
                          <div 
                            className="w-full h-full rounded-full border border-black/10" 
                            style={{ backgroundColor: ec.hex }} 
                          />
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Swatches (for sections that have them) */}
              {currentSection.colors?.map(colorKey => {
                const colorOptions = colorKey === 'backgroundColor'
                  ? Object.keys(COLOR_HEXMAP).filter(k => !k.includes('Hair')) // Just a nice set of colors
                  : (availableOptions[colorKey] || [])
                if (colorOptions.length === 0) return null

                return (
                  <div key={colorKey} className="mb-6">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 ml-1">
                      {colorKey.replace('Color', ' Color')}
                    </h3>
                    <div className="flex flex-wrap gap-3 px-1">
                      {colorOptions.map(optValue => {
                        const hex = COLOR_HEXMAP[optValue] || "#CCC"
                        const isSelected = options[colorKey as keyof typeof options] === optValue
                        return (
                          <button
                            key={optValue}
                            onClick={() => setOption(colorKey as any, optValue)}
                            className={cn(
                              "w-10 h-10 rounded-full border-2 transition-all p-0.5",
                              isSelected ? "border-app-accent scale-110" : "border-transparent hover:scale-105"
                            )}
                            title={optValue}
                          >
                            <div
                              className="w-full h-full rounded-full border border-black/10"
                              style={{ backgroundColor: hex }}
                            />
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}

              {currentSection.id === 'bg' && (
                <div className="mb-6 p-6 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center max-w-sm mx-auto">
                  <ImageIcon className="w-10 h-10 text-gray-400 mb-3" />
                  <p className="text-sm font-bold text-gray-600 mb-4">Custom background image</p>
                  <label className="cursor-pointer bg-white hover:bg-gray-100 border-2 border-app-border text-gray-700 px-6 py-3 rounded-xl text-sm font-bold shadow-sm transition-all hover:scale-[1.02]">
                    Choose from device...
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = URL.createObjectURL(file);
                          setOption('backgroundImageUrl', url);
                          setOption('backgroundColor', 'transparent'); // Make color transparent when image overrides
                        }
                      }}
                    />
                  </label>
                  {options.backgroundImageUrl && (
                    <button
                      onClick={() => setOption('backgroundImageUrl', '')}
                      className="mt-4 text-xs text-red-500 font-bold hover:underline"
                    >
                      Remove active image
                    </button>
                  )}
                </div>
              )}

              {/* Grid of options */}
              {currentSection.key && currentSection.key !== 'skinColor' && currentSection.key !== 'backgroundColor' && currentSection.key !== 'eyeColor' && (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6 gap-3 mt-4">
                  {currentOptions.map((optValue) => (
                    <button
                      key={optValue}
                      onClick={() => setOption(currentSection.key as any, optValue)}
                      className={cn(
                        "aspect-square rounded-2xl border-2 flex items-center justify-center bg-app-surface p-2 transition-all relative overflow-hidden",
                        options[currentSection.key as keyof typeof options] === optValue
                          ? "border-app-accent bg-blue-50/50"
                          : "border-app-border hover:border-gray-300"
                      )}
                    >
                      {options[currentSection.key as keyof typeof options] === optValue && (
                        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-app-accent z-20" />
                      )}

                      <Thumbnail sectionKey={currentSection.key as keyof AvatarOptions} optValue={optValue} />

                      {/* Name of the option on hover / bottom */}
                      <div className="absolute inset-x-0 bottom-0 py-1 bg-white/80 backdrop-blur-sm shadow-[0_-2px_10px_rgba(0,0,0,0.05)] translate-y-full group-hover:translate-y-0 transition-transform text-[10px] font-bold text-gray-700 text-center truncate px-1 rounded-b-xl opacity-0 group-hover:opacity-100">
                        {optValue}
                      </div>
                    </button>
                  ))}

                  {currentOptions.length === 0 && (
                    <div className="col-span-full py-12 text-center text-gray-400 font-medium tracking-wide">
                      Loading {currentSection.label}...
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>

    </div>
  )
}

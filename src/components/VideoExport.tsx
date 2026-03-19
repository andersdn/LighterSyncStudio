import React, { useState, useRef, useCallback, useEffect } from 'react'
import { Download, Loader, Film, X, AlertTriangle, CheckCircle } from 'lucide-react'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { toBlobURL, fetchFile } from '@ffmpeg/util'
import { LighterSync } from 'lighter-sync'
import { useAppStore } from '../store'
import { cn } from '../lib/utils'
import COLOR_HEXMAP from '../colorMap'

interface Props {
  audioFile: File | null
  script: string
  sync: LighterSync | null
  isReady: boolean
  svgContainerRef: React.RefObject<HTMLDivElement | null>
  audioRef?: React.RefObject<HTMLAudioElement | null>
  onStopPlayback?: () => void
}

// Module-level ffmpeg instance — survives component remounts
let _ffmpeg: FFmpeg | null = null
let _ffmpegLoaded = false

/**
 * Check if SharedArrayBuffer is available (needed for some ffmpeg.wasm features)
 * and if the browser can run WASM at all.
 */
function checkBrowserSupport(): { supported: boolean; reason?: string } {
  if (typeof WebAssembly === 'undefined') {
    return { supported: false, reason: 'WebAssembly is not supported in this browser.' }
  }
  // ffmpeg.wasm single-thread works in most modern browsers
  // Multi-thread requires SharedArrayBuffer + COOP/COEP headers
  return { supported: true }
}

export default function VideoExport({ audioFile, sync, isReady, svgContainerRef, audioRef, onStopPlayback }: Props) {
  const [ffmpegLoaded, setFfmpegLoaded] = useState(_ffmpegLoaded)
  const [isLoading, setIsLoading] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [statusMsg, setStatusMsg] = useState('')
  const [resolution, setResolution] = useState(1080)
  const cancelledRef = useRef(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  const browserSupport = checkBrowserSupport()
  
  // Sync module-level state on mount
  useEffect(() => {
    if (_ffmpegLoaded) setFfmpegLoaded(true)
  }, [])

  const loadFFmpeg = useCallback(async () => {
    if (_ffmpegLoaded && _ffmpeg) {
      setFfmpegLoaded(true)
      return
    }
    
    setIsLoading(true)
    setStatusMsg('Downloading ffmpeg.wasm (~31MB, cached after first load)...')
    
    try {
      const ffmpeg = new FFmpeg()
      
      ffmpeg.on('log', ({ message }) => {
        console.log('[ffmpeg]', message)
      })
      
      // Use single-thread core (works everywhere, no COOP/COEP needed)
      const baseURL = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm'
      
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      })
      
      _ffmpeg = ffmpeg
      _ffmpegLoaded = true
      setFfmpegLoaded(true)
      setStatusMsg('')
    } catch (err) {
      console.error('[FFmpeg] Load failed:', err)
      setStatusMsg(`Failed to load ffmpeg: ${(err as Error).message}`)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleCancel = useCallback(() => {
    cancelledRef.current = true
  }, [])

  const handleExport = useCallback(async () => {
    if (!sync || !isReady || !audioFile || !svgContainerRef.current || !_ffmpeg) return
    
    cancelledRef.current = false
    setIsExporting(true)
    setProgress(0)
    setStatusMsg('Rendering frames...')

    // Stop any existing audio/animation playback
    if (onStopPlayback) onStopPlayback()
    if (audioRef?.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }

    try {
      const fps = 24
      const duration = sync.duration
      const totalFrames = Math.ceil(duration * fps)
      
      // Get the container (includes background)
      const container = svgContainerRef.current
      const svgEl = container.querySelector('svg')
      if (!svgEl) throw new Error('No SVG element found in preview')
      
      const width = resolution
      const height = resolution
      
      const canvas = canvasRef.current!
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')!
      
      // Get background info from store
      const bgColor = useAppStore.getState().options.backgroundColor
      const bgImageUrl = useAppStore.getState().options.backgroundImageUrl
      
      // Pre-load background image if set
      let bgImage: HTMLImageElement | null = null
      if (bgImageUrl) {
        bgImage = await new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image()
          img.crossOrigin = 'anonymous'
          img.onload = () => resolve(img)
          img.onerror = reject
          img.src = bgImageUrl
        })
      }
      
      // Resolve background color
      const resolvedBg = bgColor 
        ? (bgColor.startsWith('#') || bgColor === 'transparent' ? bgColor : COLOR_HEXMAP[bgColor] || '#F7F7F7')
        : '#F7F7F7'

      const ffmpeg = _ffmpeg

      // Render each frame
      for (let i = 0; i < totalFrames; i++) {
        if (cancelledRef.current) break
        
        const time = i / fps
        const frame = sync.getFrame(time)
        
        useAppStore.getState().setLipSyncFrame(frame)
        
        // Wait for React to paint
        await new Promise<void>(r => requestAnimationFrame(() => r()))
        
        const updatedSvg = svgContainerRef.current?.querySelector('svg')
        if (!updatedSvg) continue
        
        // Draw background
        ctx.clearRect(0, 0, width, height)
        
        if (bgImage) {
          // Draw background image covering the frame
          const imgRatio = bgImage.naturalWidth / bgImage.naturalHeight
          const frameRatio = width / height
          let sx = 0, sy = 0, sw = bgImage.naturalWidth, sh = bgImage.naturalHeight
          if (imgRatio > frameRatio) {
            sw = bgImage.naturalHeight * frameRatio
            sx = (bgImage.naturalWidth - sw) / 2
          } else {
            sh = bgImage.naturalWidth / frameRatio
            sy = (bgImage.naturalHeight - sh) / 2
          }
          ctx.drawImage(bgImage, sx, sy, sw, sh, 0, 0, width, height)
        } else if (resolvedBg !== 'transparent') {
          ctx.fillStyle = resolvedBg
          ctx.fillRect(0, 0, width, height)
        } else {
          ctx.fillStyle = '#F7F7F7'
          ctx.fillRect(0, 0, width, height)
        }
        
        // Serialize SVG → Image → Canvas
        // Clone the SVG to ensure proper attributes for standalone rendering
        const svgClone = updatedSvg.cloneNode(true) as SVGSVGElement
        svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
        svgClone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink')
        // Ensure explicit dimensions  
        if (!svgClone.getAttribute('width')) svgClone.setAttribute('width', '264')
        if (!svgClone.getAttribute('height')) svgClone.setAttribute('height', '280')
        
        const svgData = new XMLSerializer().serializeToString(svgClone)
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
        const url = URL.createObjectURL(svgBlob)
        
        await new Promise<void>((resolve, reject) => {
          const img = new Image()
          img.onload = () => {
            // Draw avatar aligned to bottom center, 15% larger (matches preview)
            const baseScale = Math.min(width / img.naturalWidth, height / img.naturalHeight)
            const scale = baseScale * 1.15
            const dw = img.naturalWidth * scale
            const dh = img.naturalHeight * scale
            const dx = (width - dw) / 2
            const dy = height - dh // align to bottom
            ctx.drawImage(img, dx, dy, dw, dh)
            
            URL.revokeObjectURL(url)
            resolve()
          }
          img.onerror = () => {
            URL.revokeObjectURL(url)
            reject(new Error('Failed to render SVG frame'))
          }
          img.src = url
        })
        
        // Write frame as JPEG (faster to encode, smaller, no alpha artifacts)
        const frameBlob = await new Promise<Blob>((resolve) => {
          canvas.toBlob(blob => resolve(blob!), 'image/jpeg', 0.92)
        })
        const frameData = new Uint8Array(await frameBlob.arrayBuffer())
        const frameName = `frame${String(i).padStart(6, '0')}.jpg`
        await ffmpeg.writeFile(frameName, frameData)
        
        const pct = Math.round(((i + 1) / totalFrames) * 100)
        setProgress(pct)
        setStatusMsg(`Rendering frame ${i + 1} / ${totalFrames}`)
      }

      // Clean up lip sync state
      useAppStore.getState().setLipSyncFrame(null)

      if (cancelledRef.current) {
        // Clean up frames
        for (let i = 0; i < totalFrames; i++) {
          try { await ffmpeg.deleteFile(`frame${String(i).padStart(6, '0')}.jpg`) } catch {}
        }
        setIsExporting(false)
        setProgress(0)
        setStatusMsg('')
        return
      }
      
      // Write audio file
      setStatusMsg('Encoding video with audio...')
      setProgress(0)
      const audioData = await fetchFile(audioFile)
      await ffmpeg.writeFile('audio.wav', audioData)
      
      // Listen for encoding progress
      const progressHandler = ({ progress: p }: { progress: number }) => {
        const pct = Math.round(p * 100)
        setProgress(pct)
        setStatusMsg(`Encoding... ${pct}%`)
      }
      ffmpeg.on('progress', progressHandler)
      
      // Encode MP4 with ffmpeg
      // -preset ultrafast: fastest encoding (larger file, but much faster)
      // -crf 23: reasonable quality
      await ffmpeg.exec([
        '-framerate', String(fps),
        '-i', 'frame%06d.jpg',
        '-i', 'audio.wav',
        '-c:v', 'libx264',
        '-preset', 'ultrafast',
        '-crf', '23',
        '-pix_fmt', 'yuv420p',
        '-c:a', 'aac',
        '-b:a', '128k',
        '-shortest',
        '-y',
        'output.mp4'
      ])
      
      ffmpeg.off('progress', progressHandler)
      
      // Read output
      const outputData = await ffmpeg.readFile('output.mp4')
      const outputBytes = outputData as Uint8Array
      const mp4Blob = new Blob([new Uint8Array(outputBytes)], { type: 'video/mp4' })
      
      // Clean up temp files
      setStatusMsg('Cleaning up...')
      for (let i = 0; i < totalFrames; i++) {
        try { await ffmpeg.deleteFile(`frame${String(i).padStart(6, '0')}.jpg`) } catch {}
      }
      try { await ffmpeg.deleteFile('audio.wav') } catch {}
      try { await ffmpeg.deleteFile('output.mp4') } catch {}

      // Download
      const downloadUrl = URL.createObjectURL(mp4Blob)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = `avatar-lipsync-${Date.now()}.mp4`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(downloadUrl)
      
      setProgress(100)
      setStatusMsg('Export complete!')
    } catch (err) {
      console.error('[VideoExport] Export failed:', err)
      setStatusMsg(`Export failed: ${(err as Error).message}`)
    } finally {
      setIsExporting(false)
    }
  }, [sync, isReady, audioFile, svgContainerRef])

  if (!isReady || !audioFile) return null

  return (
    <>
      {/* Overlay blocking playback controls during export */}
      {isExporting && (
        <div className="mt-4 p-3 rounded-xl bg-amber-50 border-2 border-amber-300 flex items-center gap-2">
          <Loader className="w-4 h-4 animate-spin text-amber-600 shrink-0" />
          <div className="text-xs">
            <p className="font-bold text-amber-800">Exporting video — playback is paused</p>
            <p className="text-amber-600">Controls will be re-enabled when the export finishes or is cancelled.</p>
          </div>
        </div>
      )}
      <div className="mt-4 p-4 rounded-xl border-2 border-app-border bg-app-bg">
      <div className="flex items-center gap-2 mb-3">
        <Film className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-bold text-gray-700">Video Export</span>
        <span className="text-xs text-gray-400">(MP4 with audio)</span>
      </div>
      
      {!browserSupport.supported && (
        <div className="flex items-start gap-2 p-3 mb-3 rounded-lg bg-red-50 border border-red-200 text-red-800">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <div className="text-xs">
            <p className="font-bold">Browser not supported</p>
            <p>{browserSupport.reason}</p>
          </div>
        </div>
      )}

      {/* Step 1: Load ffmpeg */}
      {!ffmpegLoaded && browserSupport.supported && (
        <div className="mb-3">
          <p className="text-xs text-gray-500 mb-2">
            Video export requires ffmpeg.wasm (~31MB). It's downloaded once and 
            cached by your browser for future use.
          </p>
          <button
            onClick={loadFFmpeg}
            disabled={isLoading}
            className={cn(
              "w-full py-3 font-bold rounded-xl transition-all flex justify-center items-center text-sm",
              isLoading
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600 text-white shadow-sm"
            )}
          >
            {isLoading ? (
              <><Loader className="w-4 h-4 mr-2 animate-spin" /> Loading ffmpeg...</>
            ) : (
              <><Download className="w-4 h-4 mr-2" /> Load ffmpeg.wasm</>
            )}
          </button>
        </div>
      )}

      {/* Step 2: Export */}
      {ffmpegLoaded && (
        <>
          <div className="flex items-center gap-1.5 text-xs text-green-600 mb-3">
            <CheckCircle className="w-3.5 h-3.5" />
            <span className="font-bold">ffmpeg ready</span>
          </div>
          
          <div className="flex items-center gap-3 mb-3">
            <label className="text-xs font-bold text-gray-600 whitespace-nowrap">Resolution</label>
            <select
              value={resolution}
              onChange={e => setResolution(Number(e.target.value))}
              disabled={isExporting}
              className="flex-1 text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 font-medium"
            >
              <option value={640}>640 × 640</option>
              <option value={800}>800 × 800</option>
              <option value={1080}>1080 × 1080</option>
              <option value={1440}>1440 × 1440</option>
            </select>
          </div>
          
          <button
            onClick={handleExport}
            disabled={isExporting}
            className={cn(
              "w-full py-3 font-bold rounded-xl transition-all flex justify-center items-center text-sm",
              isExporting
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600 text-white shadow-sm"
            )}
          >
            {isExporting ? (
              <><Loader className="w-4 h-4 mr-2 animate-spin" /> {statusMsg}</>
            ) : (
              <><Download className="w-4 h-4 mr-2" /> Export MP4 Video</>
            )}
          </button>
        </>
      )}

      {/* Progress bar */}
      {isExporting && (
        <>
          <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
          <button
            onClick={handleCancel}
            className="mt-2 w-full py-2 text-xs font-bold text-red-500 hover:text-red-600 flex items-center justify-center gap-1 transition-colors"
          >
            <X className="w-3.5 h-3.5" /> Cancel Export
          </button>
        </>
      )}

      {/* Status message when not exporting */}
      {statusMsg && !isExporting && !isLoading && (
        <p className="mt-2 text-xs text-gray-500">{statusMsg}</p>
      )}
      
      <canvas ref={canvasRef} className="hidden" />
    </div>
    </>
  )
}

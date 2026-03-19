import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { LighterSync } from 'lighter-sync'
import { Play, Square, Loader, Trash2 } from 'lucide-react'
import { useAppStore } from '../store'
import { cn } from '../lib/utils'
import VideoExport from './VideoExport'

// Lift lip sync form state outside the component so it persists across show/hide
let _savedAudioFile: File | null = null
let _savedScript: string = ''
let _savedSync: LighterSync | null = null
let _savedIsReady: boolean = false

interface LipSyncPanelProps {
  svgContainerRef: React.RefObject<HTMLDivElement | null>
}

export default function LipSyncPanel({ svgContainerRef }: LipSyncPanelProps) {
  const [sync, setSync] = useState<LighterSync | null>(_savedSync)
  const [isInitializing, setIsInitializing] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isReady, setIsReady] = useState(_savedIsReady)

  const [audioFile, setAudioFile] = useState<File | null>(_savedAudioFile)
  const [script, setScript] = useState(_savedScript)

  const setLipSyncFrame = useAppStore(state => state.setLipSyncFrame)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const stopPlaybackRef = useRef<(() => void) | null>(null)

  // Persist state externally for survival across mount/unmount
  useEffect(() => { _savedAudioFile = audioFile }, [audioFile])
  useEffect(() => { _savedScript = script }, [script])
  useEffect(() => { _savedSync = sync }, [sync])
  useEffect(() => { _savedIsReady = isReady }, [isReady])

  // Stable blob URL so the <audio> element doesn't re-mount
  const audioSrc = useMemo(() => {
    if (!audioFile) return ''
    return URL.createObjectURL(audioFile)
  }, [audioFile])

  useEffect(() => {
    return () => {
      if (audioSrc) URL.revokeObjectURL(audioSrc)
    }
  }, [audioSrc])

  useEffect(() => {
    if (_savedSync) return // Reuse already loaded instance
    fetch(`${import.meta.env.BASE_URL}dict-medium.json`)
      .then(r => r.json())
      .then(dict => {
        const s = new LighterSync({ dictionary: dict })
        setSync(s)
        _savedSync = s
      })
      .catch(e => console.error("Failed to load dict", e))
  }, [])

  const handlePrepare = async () => {
    if (!sync || !audioFile || !script) return
    setIsInitializing(true)
    setIsReady(false)

    try {
      const buffer = await audioFile.arrayBuffer()
      const ctx = new window.AudioContext()
      const audioBuffer = await ctx.decodeAudioData(buffer)

      const keyframes = await sync.prepare(audioBuffer, script)
      console.log(`[LighterSync] Prepared ${keyframes.length} keyframes, duration: ${sync.duration}s`)
      setIsReady(true)
    } catch (e) {
      console.error(e)
      alert("Failed to prepare LipSync. Check console.")
    } finally {
      setIsInitializing(false)
    }
  }

  // Start sync-driven playback from the audio element
  const startSyncPlayback = useCallback(() => {
    if (!sync || !isReady) return
    const audio = audioRef.current
    if (!audio) return

    // If already tracking, don't double-start
    if (stopPlaybackRef.current) return

    setIsPlaying(true)
    const stop = sync.play(audio, (frame) => {
      setLipSyncFrame(frame)
    })
    stopPlaybackRef.current = stop
  }, [sync, isReady, setLipSyncFrame])

  // Stop sync-driven playback
  const stopSyncPlayback = useCallback(() => {
    if (stopPlaybackRef.current) {
      stopPlaybackRef.current()
      stopPlaybackRef.current = null
    }
    setIsPlaying(false)
    setLipSyncFrame(null)
  }, [setLipSyncFrame])

  // Hook into native audio element events so pressing play on <audio> also triggers sync
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !sync || !isReady) return

    const onPlay = () => startSyncPlayback()
    const onPause = () => stopSyncPlayback()
    const onEnded = () => stopSyncPlayback()
    const onSeeked = () => {
      // If playing, restart sync from new position
      if (!audio.paused && stopPlaybackRef.current) {
        stopPlaybackRef.current()
        stopPlaybackRef.current = null
        const stop = sync.play(audio, (frame) => {
          setLipSyncFrame(frame)
        })
        stopPlaybackRef.current = stop
      }
    }

    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('seeked', onSeeked)

    return () => {
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('seeked', onSeeked)
    }
  }, [sync, isReady, startSyncPlayback, stopSyncPlayback, setLipSyncFrame])

  const togglePlayback = () => {
    const audio = audioRef.current
    if (!audio || !sync || !isReady) return

    if (isPlaying) {
      audio.pause()
      audio.currentTime = 0
    } else {
      audio.currentTime = 0
      audio.play().catch(err => {
        console.error('[LighterSync] Playback failed:', err)
      })
    }
  }

  const handleClear = () => {
    stopSyncPlayback()
    setAudioFile(null)
    setScript('')
    setIsReady(false)
    setIsPlaying(false)
    _savedAudioFile = null
    _savedScript = ''
    _savedIsReady = false
  }

  return (
    <div className="flex flex-col h-full bg-app-surface p-6 overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">LipSync Playback</h2>
        {(audioFile || script) && (
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-600 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear
          </button>
        )}
      </div>
      <p className="text-sm text-gray-500 mb-6">
        Upload an audio file and full transcription to animate the avatar. This tool doesn't provide the audio or the transcription - you need to provide those yourself, some free tools to generate TTS are <a href="https://voicebox.sh/" target="_blank" rel="noopener noreferrer" className='underline'>Voicebox</a> and the <a href="https://github.com/PowerBeef/QwenVoice" target="_blank" rel="noopener noreferrer" className='underline'>QwenVoice</a> toolkit
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Upload Audio</label>
          {audioFile ? (
            <div className="flex items-center gap-2 text-sm">
              <span className="bg-green-50 text-green-700 px-3 py-1.5 rounded-lg font-medium truncate max-w-[200px]">
                {audioFile.name}
              </span>
              <label className="cursor-pointer text-app-accent hover:underline text-xs font-bold">
                Change
                <input
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={e => {
                    setAudioFile(e.target.files?.[0] || null)
                    setIsReady(false)
                    setIsPlaying(false)
                  }}
                />
              </label>
            </div>
          ) : (
            <input
              type="file"
              accept="audio/*"
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-app-accent/10 file:text-app-accent hover:file:bg-app-accent/20"
              onChange={e => {
                setAudioFile(e.target.files?.[0] || null)
                setIsReady(false)
                setIsPlaying(false)
              }}
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Transcript</label>
          <textarea
            value={script}
            onChange={e => setScript(e.target.value)}
            className="w-full h-32 p-3 border-2 border-app-border rounded-xl focus:border-app-accent outline-none transition-colors text-sm"
            placeholder="Type exactly what is spoken in the audio..."
          />
        </div>

        <button
          onClick={handlePrepare}
          disabled={!audioFile || !script || isInitializing}
          className="w-full py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
        >
          {isInitializing ? (
            <><Loader className="w-5 h-5 mr-2 animate-spin" /> Analyzing...</>
          ) : (
            isReady ? "✓ Ready — Re-prepare" : "Prepare Animation"
          )}
        </button>

        {isReady && (
          <button
            onClick={togglePlayback}
            className={cn(
              "w-full py-4 text-white font-bold rounded-xl transition-all flex justify-center items-center shadow-sm",
              isPlaying ? "bg-red-500 hover:bg-red-600 outline outline-4 outline-red-500/30" : "bg-app-accent hover:bg-app-accent-hover"
            )}
          >
            {isPlaying ? (
              <><Square className="w-5 h-5 mr-2 fill-current" /> Stop</>
            ) : (
              <><Play className="w-5 h-5 mr-2 fill-current" /> Play Animation</>
            )}
          </button>
        )}

        {/* Audio Element with native controls for seeking */}
        {audioSrc && (
          <div className="mt-4">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Audio Preview</label>
            <audio
              ref={audioRef}
              src={audioSrc}
              controls
              className="w-full rounded-xl"
            />
            <p className="text-xs text-gray-400 mt-1">
              Use the play button above or the native controls here — both trigger lip sync.
            </p>
          </div>
        )}

        {/* Video Export */}
        <VideoExport
          audioFile={audioFile}
          script={script}
          sync={sync}
          isReady={isReady}
          svgContainerRef={svgContainerRef}
          audioRef={audioRef}
          onStopPlayback={stopSyncPlayback}
        />
      </div>
    </div>
  )
}

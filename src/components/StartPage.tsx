import React from 'react'
import { Play, Palette, Film, ExternalLink, Github, Globe } from 'lucide-react'

interface Props {
  onStart: () => void
}

export default function StartPage({ onStart }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50 flex flex-col">
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
        <div className="mb-6 text-6xl">🎙️</div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-3">
          LighterSync Studio
        </h1>
        <p className="text-sm font-medium text-gray-400 mb-6">
          by{' '}
          <a
            href="https://andersdn.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-600 underline underline-offset-2"
          >
            Anders
          </a>
        </p>
        <p className="text-lg md:text-xl text-gray-500 max-w-xl mb-10 leading-relaxed">
          Create a custom avatar, drop in your audio &amp; script, and export a
          lip-synced video, all in the browser, no server needed.
        </p>

        <button
          onClick={onStart}
          className="group relative inline-flex items-center gap-3 bg-blue-500 hover:bg-blue-600 text-white font-bold text-lg px-10 py-4 rounded-2xl shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.03] hover:shadow-xl"
        >
          <Palette className="w-5 h-5" />
          Create Your Avatar
          <span className="absolute -top-2 -right-2 bg-green-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            Free
          </span>
        </button>
      </div>

      {/* How it works */}
      <div className="bg-white/60 backdrop-blur-sm border-t border-gray-200/50 px-6 py-12">
        <h2 className="text-center text-sm font-bold uppercase tracking-widest text-gray-400 mb-8">
          How it works
        </h2>
        <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: <Palette className="w-6 h-6" />,
              title: '1. Design',
              desc: 'Customise your avatar, hair, clothes, skin, accessories, eye colour, and more.',
            },
            {
              icon: <Play className="w-6 h-6" />,
              title: '2. Animate',
              desc: 'Upload audio and a transcript. LighterSync maps the speech to animated mouth movement.',
            },
            {
              icon: <Film className="w-6 h-6" />,
              title: '3. Export',
              desc: 'Export an MP4 video with audio, encoded in-browser via ffmpeg.wasm. No uploads, no servers.',
            },
          ].map((step) => (
            <div
              key={step.title}
              className="bg-white rounded-2xl border border-gray-200 p-6 text-center shadow-sm"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 text-blue-500 mb-4">
                {step.icon}
              </div>
              <h3 className="font-bold text-gray-800 mb-2">{step.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* LighterSync callout */}
      <div className="px-6 py-10 bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-gray-200/50">
        <div className="max-w-2xl mx-auto flex flex-col md:flex-row items-center gap-6 md:gap-8">
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-lg font-extrabold text-gray-800 mb-2">
              Powered by LighterSync
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              This app is a real-world demo of{' '}
              <a
                href="https://github.com/andersdn/LighterSync"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-600 font-semibold underline underline-offset-2"
              >
                LighterSync
              </a>
              , a lightweight JavaScript library for syncing mouth animation to speech audio.
              Drop it into any project, SVG, Canvas, WebGL, or 3D.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <a
              href="https://github.com/andersdn/LighterSync"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors"
            >
              <Github className="w-4 h-4" /> View on GitHub
            </a>
            <a
              href="https://andersdn.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 text-sm font-bold px-5 py-2.5 rounded-xl border border-gray-200 transition-colors"
            >
              <Globe className="w-4 h-4" /> andersdn.com
            </a>
          </div>
        </div>
      </div>

      {/* Credits */}
      <footer className="bg-gray-50 border-t border-gray-200/50 px-6 py-8">
        <div className="max-w-2xl mx-auto text-center text-sm text-gray-400 leading-relaxed space-y-3">
          <p>
            Avatar system built on React port foundations laid by{' '}
            <a
              href="https://github.com/fangpenlin/avataaars"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-blue-500 font-medium underline underline-offset-2 inline-flex items-center gap-0.5"
            >
              Fang-Pen Lin <ExternalLink className="w-3 h-3" />
            </a>{' '}
            of{' '}
            <a
              href="https://x.com/pablostanley"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-blue-500 font-medium underline underline-offset-2 inline-flex items-center gap-0.5"
            >
              Pablo Stanley's <ExternalLink className="w-3 h-3" />
            </a>{' '}
            <strong>Avataaars</strong> project.
          </p>
          <p className="text-gray-300 text-xs pt-2">
            Everything runs locally in your browser. No data leaves your device.
          </p>
        </div>
      </footer>
    </div>
  )
}


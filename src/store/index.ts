import { create } from 'zustand'
import type { VisemeFrame } from 'lighter-sync'

export type AvailableOptions = Record<string, string[]>

export interface AvatarOptions {
  avatarStyle: string
  topType: string
  accessoriesType: string
  hairColor: string
  hatColor: string
  facialHairType: string
  facialHairColor: string
  clotheType: string
  clotheColor: string
  graphicType: string
  eyeType: string
  eyeColor?: string
  eyebrowType: string
  mouthType: string
  skinColor: string
  backgroundColor?: string
  backgroundImageUrl?: string
}

export const defaultOptions: AvatarOptions = {
  avatarStyle: 'Transparent',
  skinColor: 'Light',
  topType: 'ShortHairShortFlat',
  hairColor: 'BrownDark',
  accessoriesType: 'Blank',
  hatColor: 'Blank',
  facialHairType: 'Blank',
  facialHairColor: 'BrownDark',
  clotheType: 'Hoodie',
  clotheColor: 'Blue03',
  graphicType: 'Bat',
  eyeType: 'Default',
  eyeColor: '#634e34',
  eyebrowType: 'Default',
  mouthType: 'Smile',
}

export interface AppState {
  options: AvatarOptions
  setOption: <K extends keyof AvatarOptions>(key: K, value: AvatarOptions[K]) => void
  randomize: () => void

  lipSyncFrame: VisemeFrame | null
  setLipSyncFrame: (frame: VisemeFrame | null) => void

  availableOptions: AvailableOptions
  registerOptions: (key: string, options: string[]) => void
}

export const useAppStore = create<AppState>((set) => ({
  options: { ...defaultOptions },
  availableOptions: {},
  registerOptions: (key, options) => set((state: AppState) => ({ 
      availableOptions: { ...state.availableOptions, [key]: options } 
  })),
  setOption: (key, value) =>
    set((state: AppState) => ({ options: { ...state.options, [key]: value } })),
  randomize: () => {
    // TODO: implement actual randomize via avataaars options
    set({ options: { ...defaultOptions } })
  },
  lipSyncFrame: null,
  setLipSyncFrame: (frame) => set({ lipSyncFrame: frame }),
}))

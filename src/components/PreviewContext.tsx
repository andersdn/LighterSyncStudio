import { createContext } from 'react'
import type { AvatarOptions } from '../store'

export const PreviewContext = createContext<Partial<AvatarOptions> | null>(null)

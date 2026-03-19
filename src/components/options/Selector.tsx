import * as React from 'react'
import Option from './Option'
import { useAppStore } from '../../store'
import type { AppState, AvatarOptions } from '../../store'
import { PreviewContext } from '../PreviewContext'

export function getComponentOptionValue(component: any) {
  const optionValue = component.optionValue
  if (!optionValue) {
    // some fallback
    return component.displayName || component.name
  }
  return optionValue
}

export interface Props {
  option: Option
  defaultOption: React.ComponentClass | string
  children?: React.ReactNode
}

export default function Selector({ option, defaultOption, children }: Props) {
  const options = useAppStore((state: AppState) => state.options)
  const registerOptions = useAppStore((state: AppState) => state.registerOptions)
  
  const preview = React.useContext(PreviewContext)

  const key = option.key as keyof AvatarOptions
  const storeValue = options[key]
  
  const defaultValue = typeof defaultOption === 'string' 
    ? defaultOption 
    : getComponentOptionValue(defaultOption)

  // If a value is provided by PreviewContext, use it, otherwise fall back to storeValue or defaultValue
  const value = preview?.[key] || storeValue || defaultValue
  
  let result: React.ReactNode | null = null
  const availableValues: string[] = []
  
  React.Children.forEach(children, child => {
    if (React.isValidElement(child)) {
        const optVal = getComponentOptionValue(child.type)
        availableValues.push(optVal)
        if (optVal === value) {
            result = child
        }
    }
  })
  
  React.useEffect(() => {
    registerOptions(option.key, availableValues)
  }, [option.key, availableValues.join(',')])
  
  return <>{result}</>
}

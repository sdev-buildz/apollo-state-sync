import { createContext } from 'react'

/**
 * Type for the {@link AppContext}
 */
export interface AppContextType {
  isLoggedIn?: boolean
}

/**
 * To initiate the AppContext with dummy values.
 * These values are only to initialize and not meant to be used by the consuming components.
 */
const defaultAppContext: AppContextType = {}

/**
 * The AppContext is used to provide global context variables.
 */
export const AppContext = createContext<AppContextType>(defaultAppContext)

'use client'

import {
  ConsentBanner,
  ConsentDialog,
  ConsentManagerProvider,
} from '@c15t/react'
import { useColorScheme, useTheme } from '@mui/material/styles'
import { type ReactNode } from 'react'

/**
 * Consent management context provider.
 */
export default function ConsentManagerClient({
  children,
}: {
  children: ReactNode
}) {
  const muiTheme = useTheme()
  const { mode, systemMode } = useColorScheme()
  const colorScheme = mode === 'system' ? systemMode : mode

  return (
    <ConsentManagerProvider
      options={{
        mode: 'offline',
        consentCategories: ['necessary', 'measurement'],
        colorScheme: colorScheme ?? 'dark',
        theme: {
          colors: {
            primary: muiTheme.vars!.palette.primary.main,
            primaryHover: muiTheme.vars!.palette.primary.dark,
            surface: muiTheme.vars!.palette.background.paper,
            surfaceHover: muiTheme.vars!.palette.action.hover,
            border: muiTheme.vars!.palette.divider,
            text: muiTheme.vars!.palette.text.primary,
            textMuted: muiTheme.vars!.palette.text.secondary,
            textOnPrimary: muiTheme.vars!.palette.primary.contrastText,
          },
        },
      }}
    >
      <ConsentBanner />
      <ConsentDialog
        showTrigger={{
          icon: 'fingerprint',
        }}
      />
      {children}
    </ConsentManagerProvider>
  )
}

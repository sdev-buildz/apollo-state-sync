'use client'

import {
  ConsentBanner,
  ConsentDialog,
  ConsentManagerProvider,
  policyPackPresets,
  useConsentManager,
} from '@c15t/react'
import { useColorScheme, useTheme } from '@mui/material/styles'
import { useEffect, type ReactNode } from 'react'

/**
 * Fetches the location of the user.
 * Doesn't display any html elements, like a custom hook.
 * @remarks
 * The reason for not creating a custom hook instead is that
 * {@link useConsentManager} is available only in children of {@link ConsentManagerProvider}.
 * Custom hooks cannot be used as children of JSX elements.
 * @returns null
 */
const LocationFetcher = () => {
  const { setOverrides } = useConsentManager()

  useEffect(() => {
    //  Fetching the location of the user.
    fetch('https://ipapi.co/json')
      .then((res) => {
        if (!res.ok) throw new Error('Network error')
        return res.json()
      })
      .then((data) => {
        if (!data) throw new Error('Network error')
        setOverrides({
          country: data.country_code,
          region: data.region_code,
        })
      })
      .catch((err) => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}

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
        offlinePolicy: {
          policyPacks: [
            policyPackPresets.europeOptIn(),
            policyPackPresets.californiaOptOut(),
            policyPackPresets.worldNoBanner(),
          ],
        },
      }}
    >
      <ConsentBanner />
      <LocationFetcher />
      <ConsentDialog
        showTrigger={{
          icon: 'fingerprint',
        }}
      />
      {children}
    </ConsentManagerProvider>
  )
}

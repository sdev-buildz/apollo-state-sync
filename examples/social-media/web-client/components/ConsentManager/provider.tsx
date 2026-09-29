'use client'

import {
  ConsentBanner,
  ConsentDialog,
  ConsentManagerProvider,
  policyPackPresets,
  useConsentManager,
} from '@c15t/react'
import { baseTranslations } from '@c15t/translations/all'
import { useColorScheme, useTheme } from '@mui/material/styles'
import { useEffect, useState, type ReactNode } from 'react'

type ConsentModelType = ReturnType<typeof useConsentManager>['model']

/**
 * Fetches the location of the user.
 * Doesn't display any html elements, like a custom hook.
 * @remarks
 * The reason for not creating a custom hook instead is that
 * {@link useConsentManager} is available only in children of {@link ConsentManagerProvider}.
 * Custom hooks cannot be used as children of JSX elements.
 * @returns null
 */
const LocationFetcher = ({
  setLocFetched,
  setModel,
}: {
  setLocFetched: React.Dispatch<React.SetStateAction<boolean>>
  setModel: React.Dispatch<React.SetStateAction<ConsentModelType>>
}) => {
  const { setOverrides, model } = useConsentManager()

  useEffect(() => {
    setModel(model)
  }, [model, setModel])

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
      .catch(() => {
        // Use an unmatched country so the default policy pack applies.
        setOverrides({ country: 'ZZ' })
      })
      .finally(() => {
        setLocFetched(true)
      })
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

  /** The consent model choosen based on jurisdiction */
  const [model, setModel] = useState<ConsentModelType>(null)

  /**
   * It is false until location fetch request is completed (either successfully or with an error).
   * It is true otherwise.
   */
  const [locFetched, setLocFetched] = useState<boolean>(false)

  /**
   * The user's most preferred language that is supported by the application.
   * @remarks
   * Because `c15t` only detects the single topmost user preference, this property
   * iterates through the user's complete list of preferred languages until a
   * supported match is found.
   */
  const browserLocale =
    typeof navigator === 'undefined'
      ? 'en'
      : ((navigator.languages.length > 0
          ? navigator.languages
          : [navigator.language]
        )
          .map((language) => language.split('-')[0]?.toLowerCase())
          .find((language) => language && language in baseTranslations) ?? 'en')

  return (
    <ConsentManagerProvider
      options={{
        i18n: {
          messages: baseTranslations,
          detectBrowserLanguage: false,
          locale: browserLocale,
        },
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
      {locFetched && model ? <ConsentBanner disableAnimation={false} /> : null}
      <LocationFetcher setLocFetched={setLocFetched} setModel={setModel} />
      <ConsentDialog
        showTrigger={{
          icon: 'fingerprint',
        }}
      />
      {children}
    </ConsentManagerProvider>
  )
}

'use client'

import {
  ConsentBanner,
  ConsentDialog,
  ConsentManagerProvider,
} from '@c15t/react'
import { type ReactNode } from 'react'

/**
 * Consent management context provider.
 */
export default function ConsentManagerClient({
  children,
}: {
  children: ReactNode
}) {
  return (
    <ConsentManagerProvider
      options={{
        mode: 'offline',
        consentCategories: ['necessary', 'measurement'],
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

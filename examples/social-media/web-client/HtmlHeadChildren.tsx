import { sharedConfig } from '@packages/web-app-utils/shared'
import type { SoftwareSourceCode, WithContext } from 'schema-dts'
/**
 * The children of the head tag such as Script tags, Link tags, etc...
 */
export const HtmlHeadChildren = () => {
  return (
    <>
      <meta charSet='utf-8' />
      <link rel='icon' href={`${sharedConfig.origin}/static/favicon.ico`} />
      <meta name='viewport' content='width=device-width, initial-scale=1' />
      <meta
        name='description'
        content='Demo website showcasing the apollo client state synchronization. Used in e2e tests.'
      />
      <title>Demo of Apollo Client State Sync and graphql-shared-ws</title>
      <link
        href='https://fonts.googleapis.com/css?family=Roboto'
        rel='stylesheet'
        type='text/css'
      />
      <script src='https://apis.google.com/js/api:client.js'></script>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareSourceCode',
            name: 'Apollo State Sync',
            description:
              'A TypeScript npm library that synchronizes and persists Apollo Client state, including the InMemoryCache and reactive variables, seamlessly across different browsing contexts (browser tabs, windows, iframes).',
            codeRepository:
              'https://github.com/sdev-buildz/apollo-state-sync.git',
            runtimePlatform: 'Web Browsers, Node.js',
            programmingLanguage: {
              '@type': 'ComputerLanguage',
              name: 'TypeScript',
              alternateName: 'TS',
              url: 'https://www.typescriptlang.org/',
            },
            keywords:
              'apollo-client, state-management, sync, cross-tab, reactive-variables, cache, persist, npm, typescript',
            license:
              'https://github.com/sdev-buildz/apollo-state-sync/blob/main/LICENSE',
            maintainer: {
              '@type': 'Person',
              '@id': 'https://github.com/sdev-buildz',
              name: 'sdev-buildz',
              url: 'https://github.com/sdev-buildz',
              email: 'stevexdev@zohomail.in',
            },
            targetProduct: {
              '@type': 'SoftwareApplication',
              applicationCategory: 'DeveloperApplication',
              name: 'apollo-state-sync',
              softwareHelp: {
                '@id':
                  'https://github.com/sdev-buildz/apollo-state-sync.git#readme',
              },
              installUrl: 'https://www.npmjs.com/package/apollo-state-sync',
              downloadUrl: 'https://registry.npmjs.org/apollo-state-sync',
              supportingData: [
                {
                  '@type': 'DataFeed',
                  name: 'Apollo Client Cache',
                  url: 'https://www.apollographql.com/docs/react/caching/overview',
                },
                {
                  '@type': 'DataFeed',
                  name: 'Reactive Variables',
                  url: 'https://www.apollographql.com/docs/react/v3/local-state/reactive-variables',
                },
              ],
            },
          } satisfies WithContext<SoftwareSourceCode>),
        }}
      />
    </>
  )
}

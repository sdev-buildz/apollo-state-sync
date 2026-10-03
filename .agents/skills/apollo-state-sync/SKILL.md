---
name: apollo-state-sync
description: >
  Use the apollo-state-sync package to synchronize Apollo Client state (cache and reactive variables) across browsing contexts such as tabs, windows, and iframes.
  Use it to persist Apollo Client state in local storage so long-lived user workflows continue seamlessly after the browser is closed and reopened.
  Use the apollo-shared-ws package to share GraphQL subscription channels across browsing contexts by creating a shared WebSocket inside a SharedWorker.
---

## apollo-state-sync

This package synchronizes Apollo cache operations and reactive variable updates across all other browsing contexts by broadcasting each change.

### Installation

```sh
npm i apollo-state-sync
```

### Automatic migration for existing TypeScript ApolloClient projects

After installation, this migration utility can apply the APIs described in this document, except for the apollo-shared-ws APIs.
It does not apply the APIs in the ./references folder.

```sh
npm i --save-dev ts-morph
npx apollo-state-sync --help
npx apollo-state-sync
```

### InMemoryCacheSynced

Apollo in-memory cache synchronized across browsing contexts.
This is a drop-in replacement for ApolloClient's `InMemoryCache`.

#### Usage

```ts
import { InMemoryCacheSynced, stateSyncLink } from 'apollo-state-sync'
import { terminatingLink } from './util/terminatingLink'

const apolloClient = new ApolloClient({
  // stateSyncLink must be used as a non-terminating link.
  link: ApolloLink.from([stateSyncLink, terminatingLink]),

  // Use InMemoryCacheSynced as the Apollo cache.
  cache: new InMemoryCacheSynced(),
})
```

Refer to the [InMemoryCacheSynced reference](./references/IN_MEMORY_CACHE_SYNCED.md) if you need to:

1. skip broadcasting or persisting specific cache operations
2. customize how operations broadcast from other browsing contexts are processed
3. broadcast writes caused by subscriptions
   (these are not broadcast by default to avoid infinite broadcast loops)

### makeVarSynced

Creates a reactive variable that stays synchronized across browsing contexts.
This is a drop-in replacement for Apollo's `makeVar`.

@param value - The initial value of the variable.
@param uniqueName - A unique name for the variable.

@returns A synced reactive variable.

#### Usage

```ts
import { useReactiveVar } from '@apollo/client/react'
import { makeVarSynced } from 'apollo-state-sync'

const rVarSynced = makeVarSynced('random-value', 'a-unique-name')
```

Refer to the [makeVarSynced reference](./references/MAKE_VAR_SYNCED.md) if you need to:

1. skip broadcasting or persisting specific reactive variable changes
2. skip the default comparison between the previous and new reactive variable values
   (broadcasting does not occur when the new and old values are identical)

### apollo-shared-ws

#### Installation

```sh
npm i apollo-shared-ws graphql-shared-ws
```

#### Usage

```ts
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { ApolloClient, ApolloLink, InMemoryCache } from '@apollo/client'
import { setupRestartSubscription } from 'apollo-shared-ws'
import { createSharedClient } from 'graphql-shared-ws'
import { authLink } from './util/authLink'

const wsLink = new GraphQLWsLink(
  // use 'createSharedClient'.
  createSharedClient({
    // Don't set the `webSocketImpl` field without referring to the Custom WebSocket guide.
    url: 'wss://localhost:443/api/graphql',
    connectionParams: {
      headers: {
        authorization: 'auth-token-1234',
      },
    },
  })
)

const apolloClient =
  //  use setupRestartSubscription to enable subscription restarts.
  setupRestartSubscription(
    new ApolloClient({
      link: ApolloLink.from([authLink, wsLink]),
      cache: new InMemoryCache(),
    })
  )
```

For `ApolloLink.split`, refer to [this guide](./references/APOLLO_LINK_SPLIT.md).
For custom WebSocket implementations, refer to the [Custom WebSocket guide](./references/CUSTOM_WEB_SOCKET.md).

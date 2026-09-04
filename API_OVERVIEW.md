<header align="center">
    <h1 align="center">Quick Start - API Overview</h1>
</header>

This document provides zero-config and swap-in API sufficient for most use-cases.

For automated migration, refer to thie [documentation](./README.md#-migration-automation).\
The migration utility applies all the API mentioned in this documentation (except [shared GraphQL subscription channels](#apollo-shared-ws)).

For advanced configurations (such as selective syncing based on dynamic conditions), refer to this [API reference](https://sdev-buildz.github.io/apollo-state-sync).

### InMemoryCacheSynced

Apollo in-memory cache synchronized across browsing contexts.\
A drop-in ApolloClient [InMemoryCache](https://github.com/apollographql/apollo-client/blob/70e3a11d93c8ef8d64aa2a7d12b02b773a57c7ca/src/cache/inmemory/inMemoryCache.ts#L45) wrapper.

```ts
import { InMemoryCacheSynced, stateSyncLink } from 'apollo-state-sync'
import { terminatingLink } from './util/terminatingLink'

const apolloClient = new ApolloClient({

    // stateSyncLink must be used, as a non-terminating link.
    ApolloLink.from([stateSyncLink, terminatingLink]),

    // use InMemoryCacheSynced as Apollo Cache.
    cache: new InMemoryCacheSynced(),

})
```

### makeVarSynced

Creates a reactive variable synchronized across browsing contexts.\
A swap-in [makeVar](https://www.apollographql.com/docs/react/v3/local-state/reactive-variabless) wrapper.

@param value - The initial value of the reactive variable.
@param uniqueName - A unique name for the reactive variable.

@returns synchronized reactive variable

```ts
import { useReactiveVar } from '@apollo/client/react'
import { makeVarStateSynced } from 'apollo-state-sync'

const rVarSynced = makeVarStateSynced('random-value', 'a-unique-name')
```

### [apollo-shared-ws](https://www.npmjs.com/package/apollo-shared-ws)

To share WebSocket connections and to avoid duplicate subscription channels across browsing contexts refer to [apollo-shared-ws package](https://www.npmjs.com/package/apollo-shared-ws).

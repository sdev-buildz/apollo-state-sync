<header align="center">
    <h1 align="center">GraphQL Over Shared WebSocket for Apollo Client</h1>
    <p align="center">
      Share one GraphQL WebSocket connection across all browsing contexts, such as browser tabs, windows, and iframes.  
    </p>
</header>

It indexes GraphQL subscriptions by their payloads avoiding duplicate subscription channels across browsing contexts.

It is built on top of [graphql-shared-ws](https://www.npmjs.com/package/graphql-shared-ws), a drop-in wrapper around [graphql-ws](https://www.npmjs.com/package/graphql-ws).

## 💡 Why use it?

- Reuse a single WebSocket connection across tabs, windows, and iframes
- Reduce duplicate subscription traffic and unnecessary connection overhead
- Keep shared GraphQL subscriptions consistent across browsing contexts
- Works as a direct replacement for standard graphql-ws usage in Apollo

💡 If you are using [TanStack Query (React Query)](!https://tanstack.com/query/latest) or [graphql-ws](https://the-guild.dev/graphql/ws/get-started), refer the [official graphql-shared-ws documentation](https://www.npmjs.com/package/graphql-shared-ws).

## 📦 Installation

```sh
npm install apollo-shared-ws
```

<details>
<summary><strong>Using pnpm</strong></summary>

#### 1) For non-monorepos.

```sh
pnpm add apollo-shared-ws
```

#### 2) Adds to specific workspace.

```sh
pnpm add apollo-shared-ws --filter="./packages/my-workspace"
```

#### 3) Adds to project's root workspace.

```sh
pnpm add apollo-shared-ws -w
```

</details>

<details>
<summary><strong>Using yarn</strong></summary>

#### 1) For non-monorepos

```sh
yarn add apollo-shared-ws
```

#### 2) To a specifig workspace

```sh
yarn workspace <workspace-name> add apollo-shared-ws
```

### 3) Adds to root workspace

```sh
yarn add -W apollo-shared-ws
```

</details>

## 💻 Quick start

```ts
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { setupRestartSubscription } from 'apollo-state-sync'
import { createSharedClient } from 'graphql-shared-ws'
import { authLink } from './util/authLink'

const wsLink = new GraphQLWsLink(
  // use 'createSharedClient'.
  createSharedClient({
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
  //    wrap ApolloClient with setupRestartSubscription(...)
  setupRestartSubscription(
    new ApolloClient({
      link: ApolloLink.from([authLink, wsLink]),
      cache: new InMemoryCache(),
    })
  )
```

## 🔌 API documentations

1. [graphql-shared-ws API Reference](https://www.npmjs.com/package/graphql-shared-ws#:~:text=%F0%9F%94%8C-,API%20Reference,-This%20library%20implements)
2. [graphql-ws documentation](https://the-guild.dev/graphql/ws/get-started)
3. [Apollo GraphQLWsLink documentation](https://www.apollographql.com/docs/react/v3/api/link/apollo-link-subscriptions)

## 🤖 Migration automation

This package includes a lightweight migration helper for Apollo Client projects.

Run the following commands sequentially:

```sh
npm i -g ts-morph
npx gql-shr-ws-link-migrate --help
npx gql-shr-ws-link-migrate
```

This automation:

- adds `webSocketImpl: SharedWebSocket` to `createClient(...)` calls
- wraps ApolloClient instantiations with `setupRestartSubscription(...)`

This is helpful for simple migration cases, but it has limitations. For example, `Subscription.restart` is not automatically migrated when `ApolloLink.split` is used.  
If in case you are using `ApolloLink.split`, refer this [documentation](https://sdev-buildz.github.io/apollo-state-sync/functions/packages_apollo-shared-ws_src.setupRestartSubscription.html)).

## 👥 Community & Support

- 💬 _**Have an idea?**_ Suggest new features in [GitHub Discussions](../..//discussions).

- 🚀 _**Want to support the project?**_ Visit [this link](https://buymeacoffee.com/stevenx.dev).

- 💼 _**Need custom work or consultation?**_ I am available for hire! Reach out via [email](mailto:stevexdev@zohomail.in).

## 📦 Related packages

- [graphql-shared-ws](https://www.npmjs.com/package/graphql-shared-ws)
- [apollo-state-sync](https://www.npmjs.com/package/apollo-state-sync)
- [graphql-ws](https://www.npmjs.com/package/graphql-ws)

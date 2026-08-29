<header align="center">
    <h1 align="center">GraphQL Over Shared WebSocket - Apollo Link</h1>
    <p align="center">Shares WebSocket connection across browsing contexts</p>
</header>

A swap-in graphql-ws wrapper for the GraphQLWsLink that sends GraphQL operations over a shared WebSocket which is shared across browsing contexts (such as multiple tabs, windows, or iframes). It creates the WebSocket inside shared worker using the graphql-ws library. It's used most commonly with GraphQL subscriptions.

## 📦 Installation

```sh
npm install apollo-shared-ws
```

## 💻 Usage

### Use in terminating link.

```ts
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { setupRestartSubscription } from "apollo-state-sync"
import { createSharedClient } from "graphql-shared-ws"
import { authLink } from "./util/authLink"

// use 'createSharedClient'.
const wsLink = new GraphQLWsLink(createSharedClient({
    url: "wss://localhost:443/api/graphql",
    connectionParams: {
      headers: {
        authorization: 'auth-code-1234',
      },
    },
}));

const apolloClient =
  //  use setupRestartSubscription to enable subscription restarts.
  setupRestartSubscription(
  new ApolloClient({
    ApolloLink.from([authLink, wsLink]),
    cache: new InMemoryCache(),
  })
)
```

### ⚙️ Constructor signature

```ts
constructor(
  public clientOptions: Parameters<typeof createSharedClient>[0],
  private workerOptions?: Parameters<typeof createSharedClient>[1]
): GraphQLSharedWsLink
```

## 🔌 API Reference

`createSharedClient` has the exact same API as graphql-ws, except for the `webSocketImpl` field. For complete usage guides, configuration options, and type definitions, please refer to the [official graphql-ws documentation](https://the-guild.dev/graphql/ws). If you are using a custom WebSocket implementation, see the [graphql-shared-ws custom WebSocket guide](CUSTOM_WEB_SOCKET.md).

## 🤖 Migration Automation (Limited)

Run the following terminal commands sequentially to automatically migrate Apollo Client projects to apollo-shared-ws. This adds `webSocketImpl: SharedWebSocket` property to the parameters of every createClient call. This also wraps ApolloClient instantiations with setupRestartSubscription.

```sh
npm i -g ts-morph
npx gql-shr-ws-link-migrate --help
npx gql-shr-ws-link-migrate
```

**The migration automation is limited** and works only in simple circumstances. For instance, `Subscription.restart` is not automatically migrated when ApolloLink.split is used.

## 👥 Community & Support

- 💬 _**Have an idea?**_ Suggest new features in GitHub Discussions.

- ✨ _**Support me or my projects**_ through donations via GitHub Sponsors.

- 💼 _**Need custom work or consultation?**_ I am available for hire! Reach out via email.

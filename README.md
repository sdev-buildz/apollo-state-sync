<header align="center">
    <h1 align="center">Apollo Client State Sync</h1>
    <p align="center">Synchronizes Apollo Client's state across all browsing contexts (across browser tabs, windows, iframes, etc...).</p>
</header>

## ✨ Features

- Synchronizes Apollo Client's state (in-memory cache and reactive variables) across all browsing contexts (across browser tabs, windows, iframes, etc...).
- The state gets persisted across user sessions even after the browser gets closed. So the users can continue their works when they reopen the app.
- A single Web Socket connection gets shared across browsing contexts. GraphQL subscription channels are indexed by their payloads.

## 💻 Example end-user use-cases

- If a visitor logs-in in one browser tab, the visitor will be simultaneously logged-in in other tabs also.
- If a customer adds a product to cart in one browser tab, and adds a different product in a different tab, both the tabs will have both the products in their carts.
- Streaming apps (such as chat apps, live locations, performance metrics dashboards, score boards, etc...) can be opened in multiple windows side-by-side without any increase in network load.

## 📦 Installation

```sh
npm install apollo-state-sync
```

## 🤖 Migration Automation

Run the following terminal commands sequentially to automatically migrate Apollo Client projects to apollo-state-sync.  
By default, web sockets are not migrated. Refer this [document](./packages/apollo-shared-ws/README.md) for more details.

```sh
npm i -g ts-morph
npx apollo-state-sync --help
npx apollo-state-sync
```

## 👥 Community & Support

- 💬 _**Have an idea?**_ Suggest new features in [GitHub Discussions](../..//discussions).

- 🚀 _**Support me or my projects**_ through [donations](https://buymeacoffee.com/stevenx.dev).

- 💼 _**Need custom work or consultation?**_ I am available for hire! Reach out via [email](mailto:stevexdev@zohomail.in).

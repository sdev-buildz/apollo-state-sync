<header align="center">
    <h1 align="center">Apollo State Sync</h1>
    <p align="center">
        Synchronize Apollo Client state effortlessly across all browsing contexts, such as browser tabs, windows, and iframes.  
    </p>
    <p align="center">
        Apollo State Sync keeps Apollo Client state consistent across browsing contexts without redundant network requests.
    </p>
    <p align="center">
        It syncs Apollo's in-memory cache and reactive variables across contexts, and can persist state between sessions so users can resume where they left off. It also avoids duplicate GraphQL subscription channels across contexts.
    </p>

</header>

## 💡 Why use it?

Modern web apps often run across multiple browser tabs or windows within the same workflow. Without shared state synchronization, users can end up with inconsistent data:

- logged in status differs across tabs
- Data edited in one tab stays outdated in another until a manual refresh.
- in-memory caches are inconsistent across tabs
- GraphQL subscriptions are duplicated across tabs
- app state resets unexpectedly when a tab is reopened

Apollo State Sync solves this by keeping state in sync across browsing contexts and user sessions while reusing a shared WebSocket connection and sharing active subscription channels.

## ✨ Features

- Syncs Apollo Client's state across all browsing contexts.
  - browser tabs
  - windows
  - iframes
  - other active app instances
- Keeps Apollo cache and reactive variables synchronized in real time
- Persists state across browser restarts and user sessions
- Reuses a single shared WebSocket connection for GraphQL subscriptions
- Minimizes duplicate network traffic by indexing GraphQL subscription channels by payload
- Helps build multi-window and multi-tab apps without custom state plumbing

❗ Apollo State Sync keeps Apollo state synchronized across tabs and windows. For shared GraphQL subscription channels and a single reused WebSocket connection across browsing contexts, install and configure [apollo-shared-ws npm package](https://www.npmjs.com/package/apollo-shared-ws).

## 💻 Example use-cases

- User logs in from one tab and is automatically logged in on all other tabs
- Shopping cart updates are shared instantly across every open tab
- Chat applications, dashboards, live-location apps, or scoreboards can be opened in multiple windows without extra network load
- Long-lived user workflows continue seamlessly after closing and reopening the browser

## 📦 Installation

```sh
npm install apollo-state-sync
```

<details>
<summary><strong>Using pnpm</strong></summary>

#### 1) For non-monorepos.

```sh
pnpm add apollo-state-sync
```

#### 2) Adds to specific workspace.

```sh
pnpm add apollo-state-sync --filter="./packages/my-workspace"
```

#### 3) Adds to root workspace.

```sh
pnpm add apollo-state-sync -w
```

</details>

<details>
<summary><strong>Using yarn</strong></summary>

#### 1) For non-monorepos

```sh
yarn add apollo-state-sync
```

#### 2) Adds to specific workspace.

```sh
yarn workspace <workspace-name> add apollo-state-sync
```

#### 3) Adds to root workspace.

```sh
yarn add -W apollo-state-sync
```

</details>

## ⚙️ How it works ( Internal Achitecture )

Apollo State Sync listens for state changes in Apollo Client and broadcasts them across browsing contexts using Broadcast Channels. It can also persist state in Local Storage so it remains available when the user reopens the app. It uses SharedWorkers to avoid duplicate GraphQL subscription channels.

## 🤖 Migration Automation

If you want to migrate an existing Apollo Client TypeScript project to Apollo State Sync, you can run the following commands:

```sh
npm i -g ts-morph
npx apollo-state-sync --help
npx apollo-state-sync
```

By default, WebSocket migration is not enabled. For details on WebSocket configuration and migration, see the [Apollo Shared WebSocket documentation](./packages/apollo-shared-ws/README.md).

## 👥 Community & Support

- 💬 _**Have an idea?**_ Suggest new features in [GitHub Discussions](../..//discussions).

- 🚀 _**Support me or my projects**_ through [donations](https://buymeacoffee.com/stevenx.dev).

- 💼 _**Need custom work or consultation?**_ I am available for hire! Reach out via [email](mailto:stevexdev@zohomail.in).

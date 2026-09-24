<div align="center">
  <h1>Social Media Example</h1>
  <p><strong>Full-stack demonstration of seamless multi-tab state synchronization</strong></p>
</div>

This example showcases [Apollo State Sync](../../README.md) integrated into a social media site using [GraphQLZero](https://graphqlzero.almansi.me/). It demonstrates a unified user experience where state and data remain consistent across all open browser tabs and windows.

### 🔑 Key Synchronized Features:

- **Authentication:** Login status stays in sync instantly.
- **UI Preferences:** Dark/light mode settings are applied globally across the session.
- **Shared Resources:** A unified in-memory cache for real-time updates on posts and comments.

### 🌐 Live Demo

You can access the live application here: https://sdev-buildz.github.io/apollo-state-sync/examples/posts

## 💻 Local Development

Follow these steps to set up and run the project on your local machine.

### 🛠️ Prerequisites

- Node.js 22 or newer
- pnpm

Install dependencies:

```sh
pnpm ci
```

### 🚀 Run the example

Start the React development server:

```sh
pnpm run --filter=@examples/shopping-site start-react-watch
```

Open [https://localhost:3000](https://localhost:3000). It uses the free public [GraphQLZero](https://graphqlzero.almansi.me/) API server.

To use different port, set `WEB_CLIENT_PORT` in the `.env` file.

### 🧪 Try the Demo

1. **Open Multiple Tabs:** Launch the application in two or more side-by-side browser windows.
2. **Cross-Tab Synchronization:** Sign in or fetch comments in one tab. Observe how the other tabs update instantly without a page refresh.
3. **State Persistence:** Close and reopen your browser to verify that your login session and cached data are automatically restored.

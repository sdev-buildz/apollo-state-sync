import { TestingPanel } from './components/TestingPanel/TestingPanel'
import { AppContext } from './contexts/AppContext'

/**
 * The React App with the navbar, pages, routing, etc...
 * It includes the whole App Layout.
 */
export function App() {
  return (
    <div className='app'>
      <AppContext.Provider value={{}}>
        <div>
          <header>
            <h1>Demo of the Apollo Client State Synchronization</h1>
          </header>
          <p>
            <button type='button'>
              Click here to open multiple browser windows side by side
            </button>
            Or else open this page in multiple tabs, or windows. And see how the
            Apollo Client state is synchronized.
          </p>
        </div>
        <TestingPanel />
      </AppContext.Provider>
    </div>
  )
}

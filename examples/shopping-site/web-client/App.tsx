import { HomePage } from './components/HomePage/HomePage'
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
            <h1>Shopping Site</h1>
          </header>
        </div>
        <HomePage />
      </AppContext.Provider>
    </div>
  )
}

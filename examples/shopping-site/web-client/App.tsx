import { NavBar } from './components/NavBar/NavBar'
import { ProductsPage } from './components/ProductsPage/ProductsPage'
import { AppContext, defaultAppContext } from './contexts/AppContext'

/**
 * The React App with the navbar, pages, routing, etc...
 * It includes the whole App Layout.
 */
export function App() {
  return (
    <div className='app'>
      <AppContext.Provider value={defaultAppContext}>
        <NavBar />
        <div>
          <header>
            <h1>Shopping Site</h1>
          </header>
        </div>
        <ProductsPage />
      </AppContext.Provider>
    </div>
  )
}

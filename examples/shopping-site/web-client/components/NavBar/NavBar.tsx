import { useReactiveVar } from '@apollo/client/react'
import { useContext } from 'react'
import { AppContext } from '../../contexts/AppContext'

/**
 * The top NavBar component.
 */
export const NavBar = () => {
  const { isLoggedIn } = useContext(AppContext)
  const isLoggedInState = useReactiveVar(isLoggedIn)

  return (
    <nav id='nav-bar'>
      <div className='login-box'>
        {isLoggedInState ? 'Logged In' : 'Logged Out'}
        <button type='button' onClick={() => isLoggedIn(!isLoggedIn())}>
          {isLoggedInState ? 'Log out' : 'Log In'}
        </button>
      </div>
    </nav>
  )
}

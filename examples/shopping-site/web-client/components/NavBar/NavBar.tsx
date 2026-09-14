import { useState } from 'react'

/**
 * The top NavBar component.
 */
export const NavBar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  return (
    <nav id='nav-bar'>
      <div className='login-box'>
        {isLoggedIn ? 'Logged In' : 'Logged Out'}
        <button type='button' onClick={(prev) => setIsLoggedIn(!prev)}>
          {isLoggedIn ? 'Log out' : 'Log In'}
        </button>
      </div>
    </nav>
  )
}

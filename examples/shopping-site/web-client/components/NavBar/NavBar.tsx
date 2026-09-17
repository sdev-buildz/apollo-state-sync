import { useReactiveVar } from '@apollo/client/react'
import LoginIcon from '@mui/icons-material/Login'
import LogoutIcon from '@mui/icons-material/Logout'
import AppBar from '@mui/material/AppBar'
import Button from '@mui/material/Button'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { useContext } from 'react'
import { AppContext } from '../../contexts/AppContext'
/**
 * The top NavBar component.
 */
export const NavBar = () => {
  const { isLoggedIn } = useContext(AppContext)
  const isLoggedInState = useReactiveVar(isLoggedIn)

  return (
    <AppBar position='static'>
      <Toolbar>
        <Typography variant='h6' component='div' sx={{ flexGrow: 1 }}>
          Shopping Site
        </Typography>
        <Button
          color='inherit'
          onClick={() => isLoggedIn(!isLoggedIn())}
          startIcon={isLoggedInState ? <LoginIcon /> : <LogoutIcon />}
        >
          {isLoggedInState ? 'Log out' : 'Log In'}
        </Button>
      </Toolbar>
    </AppBar>
    // <nav id='nav-bar'>
    //   <div className='login-box'>
    //     {isLoggedInState ? 'Logged In' : 'Logged Out'}
    //     <button type='button' onClick={() => isLoggedIn(!isLoggedIn())}>
    //       {isLoggedInState ? 'Log out' : 'Log In'}
    //     </button>
    //   </div>
    // </nav>
  )
}

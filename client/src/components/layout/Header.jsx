import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const Header = () => {
  const headerStyle = {
    backgroundColor: '#333',
    color: 'white',
    padding: '1rem 0',
  }

  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  }

  const logoStyle = { margin: 0, fontSize: '1.25rem' }
  const linkStyle = { color: 'white', textDecoration: 'none' }
  const navLinkStyle = { color: 'white', textDecoration: 'none', marginLeft: '1rem' }

  const { user, logout, isAuthenticated } = useAuth()

  return (
    <header style={headerStyle}>
      <div style={containerStyle}>
        <h1 style={logoStyle}>
          <Link to="/" style={linkStyle}>
            Creator Platform
          </Link>
        </h1>

        <nav style={navStyle}>
          <Link to="/" style={navLinkStyle}>Home</Link>

          {isAuthenticated() ? (
            <>
              <Link to="/dashboard" style={navLinkStyle}>Dashboard</Link>
              <span style={userNameStyle}>Hi, {user?.name}</span>
              <button onClick={logout} style={logoutBtnStyle}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" style={navLinkStyle}>Login</Link>
              <Link to="/register" style={navLinkStyle}>Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Header

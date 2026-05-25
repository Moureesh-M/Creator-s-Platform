const Footer = () => {
  const footerStyle = {
    backgroundColor: '#333',
    color: 'white',
    padding: '2rem 0',
    marginTop: 'auto',
    textAlign: 'center',
  }

  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 2rem',
  }

  return (
    <footer style={footerStyle}>
      <div style={containerStyle}>
        <p>© 2026 Creator Platform. All rights reserved.</p>
        <p>Built by You</p>
      </div>
    </footer>
  )
}

export default Footer

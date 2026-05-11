import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'

function App() {
  return (
    <BrowserRouter>
      <div style={appStyle}>
        <Header />

        <main style={mainStyle}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  )
}

const NotFound = () => (
  <div style={{ textAlign: 'center', padding: '4rem' }}>
    <h1>404 - Page Not Found</h1>
    <p>The page you're looking for doesn't exist.</p>
  </div>
)

const appStyle = { display: 'flex', flexDirection: 'column', minHeight: '100vh' }
const mainStyle = { flex: 1 }

export default App

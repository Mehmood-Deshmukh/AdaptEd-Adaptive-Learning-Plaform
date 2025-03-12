import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Register from './pages/Register'
import Login from './pages/Login'
import useAuthContext from './hooks/useAuthContext'
import Roadmap from './pages/RoadmapGenerator'

function App() {
  const { state } = useAuthContext()
  const { isAuthenticated, Loading } = state;

  if (Loading) {
    console.log('loading');
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={isAuthenticated ? <Home /> : <Navigate to="/login" />} />
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />
        <Route path="/roadmap-generator" element={isAuthenticated ? <Roadmap /> : <Navigate to="/login" />} />
        <Route path="*" element={<h1>Not Found</h1>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
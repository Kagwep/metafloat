import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import MetaSenseHomepage from './pages/HomePage'
import ReputationPage from './pages/Reputation'


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MetaSenseHomepage />} />
        <Route path="/reputation" element={<ReputationPage />} />
      </Routes>
    </Router>
  )
}

export default App

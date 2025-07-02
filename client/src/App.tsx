import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import MetaSenseHomepage from './pages/HomePage'

import MetaFloatAdvancePage from './pages/Advance'
import MetaFloatReputationPage from './pages/Reputation'


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MetaSenseHomepage />} />
        <Route path="/reputation" element={<MetaFloatReputationPage />} />
        <Route path="/advance" element={<MetaFloatAdvancePage />} />
      </Routes>
    </Router>
  )
}

export default App

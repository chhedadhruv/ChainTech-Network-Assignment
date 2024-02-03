import React, { useState, useEffect } from 'react'
import { HashRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import { auth } from './firebase'
import LoginScreen from './screens/LoginScreen'
import SignupScreen from './screens/SignupScreen'
import ProfileScreen from './screens/ProfileScreen'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ProfileScreen />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/signup" element={<SignupScreen />} />
      </Routes>
    </Router>
  )
}

export default App
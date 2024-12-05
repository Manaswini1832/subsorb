import './index.css'
// import { useState, useEffect } from 'react'
// import { Auth } from '@supabase/auth-ui-react'
// import { ThemeSupa } from '@supabase/auth-ui-shared'
// import { supabase } from './lib/helper/supabase'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Collection from './pages/Collection';
import Error404 from './pages/404'
import PrivateRoute from './PrivateRoute'

const App = () => {
  return(
      <Router>
          <Routes>
            <Route exact path="/" element={<Home />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard/collection/:collectionName"
              element={
                <PrivateRoute>
                  <Collection />
                </PrivateRoute>
              }
            />
            <Route path='*' element={<Error404/>} />
          </Routes>
      </Router>
  )
}

export default App
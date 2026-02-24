import '../index.scss'
import './Home.scss'
import { useNavigate } from 'react-router-dom';
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '../lib/helper/supabase'

import { useSession } from '../contexts/userContext'
import { useEffect } from 'react';

const Home = () => {
  const { session, loading } = useSession()
  const navigate = useNavigate();

  const goToDashboard = () => {
    navigate('/dashboard');
  };

  useEffect(() => {
    if(session) goToDashboard()
  }, [session])

  if (loading) return <p>Loading...</p>

  return(
    <div className='dark-container dark-home-container'>
      {session ? 
      (<div>
        You've already logged in
        <button className='pink-go-to-dashboard-btn' onClick={goToDashboard}>Go to dashboard</button>
      </div>) : 
      (
        <div>
          <Auth
            supabaseClient={supabase}
            appearance={{
            theme: ThemeSupa,
            style: {
                button: {
                borderColor: 'rgba(0,0,0,0)',
                fontFamily: 'Montserrat',
                position: 'fixed',
                top :'0',
                padding: '20px',
              },
            }
            }}
            providers={['google']}
            theme='dark'
            onlyThirdPartyProviders
        />
        </div>
      )}

      
    </div>
  )
}

export default Home
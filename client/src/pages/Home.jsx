import '../index.css'
import { useNavigate } from 'react-router-dom';
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '../lib/helper/supabase'

import { useSession } from '../contexts/userContext'

const Home = () => {
  const { session, loading } = useSession()
  const navigate = useNavigate();

  const goToDashboard = () => {
    navigate('/dashboard');
  };

  if (loading) return <p>Loading...</p>

  return(
    <div>
      {session ? 
      (<div>
        You've already logged in
        <button onClick={goToDashboard}>Go to dashboard</button>
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
                fontFamily: 'monospace'
                },
            },
            variables: {
                default: {
                colors: {
                    brand: "orange",
                    brandAccent: `gray`,
                },
                },
            },
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
import './index.css'
import { useState, useEffect } from 'react'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from './lib/helper/supabase'

import { useSession } from '././contexts/userContext';

export default function App() {
  const { session, loading } = useSession();

  if (loading) return <p>Loading...</p>;

  return(
    <div>
      {session ? 
      (<div>
        <img src={session?.user?.user_metadata?.picture} alt="profile of the user"/>
        {session?.user?.user_metadata?.name}'s Collections
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
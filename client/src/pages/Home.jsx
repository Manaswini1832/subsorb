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
    <div className='homePage dark-container dark-home-container'>
      {session ? 
      (<div>
        You've already logged in
        <button className='pink-go-to-dashboard-btn' onClick={goToDashboard}>Go to dashboard</button>
      </div>) : 
      (
        <div className='homePageContainer'>
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
                left : '0',
                padding: '20px',
              },
            }
            }}
            providers={['google']}
            theme='dark'
            onlyThirdPartyProviders
        />
          <h1 className = "homePageMainTitle">Subsorb helps you organize your youtube subscriptions</h1>
          {/* <p className = "homePageRequest">Note : Please use a VPN since some ISPs have supabase blocked</p> */}
          {/* <video src='/subsorb_screen_record.mp4' width="100%" height="400" controls="controls"  autoPlay muted loop/> */}
          
          <div className="pink-line-break"></div>

          <section>
            <h2 className="homePageFeature">Add youtube channels to a collection for later reference </h2>
            <img className = "homePageImg" src="/app_screenshots/subsorb_collection.png" alt="" />
          </section>

          <div className="pink-line-break"></div>

          <section>
            <img className = "homePageImg" src="/app_screenshots/subsorb_dashboard.png" alt="" />
            <h2 className="homePageFeature">Organize your channels into multiple collections </h2>
          </section>

          <div className="pink-line-break"></div>

          <section>
            <h2 className="homePageFeature">AI generated summaries + searchable tags </h2>
            <img className = "homePageImg" src="/app_screenshots/subsorb_collection_tag_search.png" alt="" />
          </section>

          <div className="pink-line-break"></div>

          <section>
            <img className = "homePageImg" src="/app_screenshots/subsorb_mood_recs.png" alt="" />
            <h2 className="homePageFeature">AI powered mood based channel recommendations with match score </h2>
          </section>
        </div>
        
      )}

      
    </div>
  )
}

export default Home
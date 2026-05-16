import { useEffect, useState } from 'react';
import { useSession } from '../contexts/userContext';
import CollectionCard from '../components/CollectionCard';
import ChannelCard from '../components/ChannelCard'
import './Dashboard.scss';
import isAlphaNumeric from '../lib/helper/utils';

const Dashboard = () => {
  const { session, loading } = useSession();
  const [collecs, setCollecs] = useState([]);
  const [error, setError] = useState(null);
  const [formInput, setFormInput] = useState('');
  const [moodInput, setMoodInput] = useState('');
  const [moodResponse, setMoodResponse] = useState([]);

  const getCollections = async () => {
    const backendUrl = `${process.env.REACT_APP_BACKEND_API_URL_PROD}/api/v1/collections`
    
    try {
        const response = await fetch(backendUrl, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json', 
              'Authorization': `Bearer ${session.access_token}`
            }
          })

      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`)
      }

      const jsonData = await response.json()
      setCollecs(jsonData)
    } catch (error) {
      setError(error.message)
    }
  }

  const makeCollection = async(collecName) => {
    if(!isAlphaNumeric(collecName)){
      alert('Invalid collection name. Please use only letters and numbers');
      return;
    }
    const backendUrl = `${process.env.REACT_APP_BACKEND_API_URL_PROD}/api/v1/collections`
    try {

        const response = await fetch(backendUrl, {
            method: 'POST',
            body: JSON.stringify({ collectionName: collecName }),
            headers: {
              'Content-Type': 'application/json', 
              'Authorization': `Bearer ${session.access_token}`
            }
          })

        if (!response.ok) {
            const errorData = await response.json()
            const errorMessage = errorData.errorMessage || errorData.message || 'Unknown error'

            if (errorMessage.message.toLowerCase().startsWith('duplicate')) {
                alert('Duplicate collections not allowed')
            } else {
                console.log(errorMessage)
                alert(errorMessage)
            }
            return
        }

        const responseJson = await response.json()
        if(responseJson[0]?.name){
        setCollecs((prev) => {
            return [responseJson[0], ...prev]
        })
        }
    } catch (error) {
      alert(error)
    }
  }

  const searchMood = async(mood) => {
    const backendUrl = `${process.env.REACT_APP_BACKEND_API_URL_PROD}/api/v1/mood`
    try {
      const response = await fetch(backendUrl, {
        method : 'POST', 
        body: JSON.stringify({ moodInput : mood }),
        headers: {
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (!response.ok) {
          const errorData = await response.json()
          const errorMessage = errorData.errorMessage || errorData.message || 'Unknown error'
          console.log(errorMessage)
          alert(errorMessage)
          return
      }

      const responseJson = await response.json()
      if(responseJson?.data?.length !== 0){
        setMoodResponse(responseJson.data)
      }

    } catch (error) {
      alert(error)
    }
  }

  const handleFormChange = (e) => {
    setFormInput(e.target.value)
  }

  const handleMoodFormChange = (e) => {
    setMoodInput(e.target.value)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if(formInput === '') return
    makeCollection(formInput)
    setFormInput('')
  }

  const handleMoodSubmit = (e) => {
    e.preventDefault();
    if(moodInput === '') return
    searchMood(moodInput);
    setMoodInput('')
  }

  useEffect(() => {
    if (session) {
      getCollections()
    } else {
      setCollecs([]);
    }
  }, []);

  if (!session) {
    return (
        <div className='dark-container'>
          <div className='dark-dashboard-collections-container'>
              <p>Unauthorized to access this page</p>
          </div>
        </div>
      );
  }

  if (error) {
    return (
        <div className='dark-container'>
          <div className='user-container'>
            <img src={session?.user?.user_metadata?.picture} alt="profile of the user" />
            <h2>{session?.user?.user_metadata?.name}'s Dashboard</h2>
          </div>

          <form className="dashboard-form collection-form" onSubmit={handleSubmit}>
            <div><label htmlFor='collectionNameInput'>Collection Name :</label></div>
            <div>
              <input id='collectionNameInput' type='text' onChange={handleFormChange} value={formInput}/>
              <button  className='dark-create-btn' type="submit">Create</button>
            </div>
          </form>

          <div className='dark-dashboard-collections-container'>
            <p>ERROR : {error}</p>
          </div>
          
        </div>
      );
  }

  if (loading){
    <div className='dark-container'>
      <div className='dark-dashboard-collections-container'>
          <p>Loading</p>
      </div>
    </div>
  }

  return (
    <div className='dark-container'>
      <div className='user-container'>
        <img src={session?.user?.user_metadata?.picture} alt="profile of the user" />
        <h2>{session?.user?.user_metadata?.name}'s Dashboard</h2>
      </div>

        <form className="dashboard-form collection-form" onSubmit={handleSubmit}>
          <div><label htmlFor='collectionNameInput'>Collection Name :</label></div>
          <div>
            <input id='collectionNameInput' type='text' onChange={handleFormChange} value={formInput}/>
            <button  className='dark-create-btn' type="submit">Create</button>
          </div>
        </form>

        <form className="dashboard-form mood-form">
            <div><label htmlFor='moodInput'>Enter your mood. Eg: I want to watch book videos</label></div>
            <div>
              <input id='moodInput' type='text' onChange={handleMoodFormChange} value={moodInput}/>
              <button className='dark-create-btn' type="submit" onClick={handleMoodSubmit}>Search</button>
              <button className='dark-create-btn' type="submit" onClick={(e) => {
                e.preventDefault();
                setMoodResponse([])
              }}>Clear mood</button>
            </div>
          </form>

      {
        moodResponse.length !== 0 && (
          <div>
            {moodResponse.map((match, index) => {
              const parsedDetails = JSON.parse(match.details);

              return (
                <div key={index}>
                  <ChannelCard
                    name={parsedDetails.items[0].snippet.title}
                    url={`https://www.youtube.com/channel/${parsedDetails.items[0].id}`}
                    thumbnail={
                      parsedDetails.items[0].snippet.thumbnails.default.url
                    }
                    description={
                      match.ai_summary ??
                      parsedDetails.items[0].snippet.description
                    }
                    tags={match.ai_tags ?? []}
                  />
                </div>
              );
            })}
          </div>
        )
      }

      <div className='dark-dashboard-collections-container'>
      {collecs.length === 0 ? (
        <p>No collections available.</p>
      ) : (
          <div className='dark-dashboard-collections-container'>
            {collecs.map((collection, index) => (
              <div key={index}>
                <CollectionCard name={collection.name}/>
              </div>
            ))}
          </div>
      )}
      </div>
    </div>
  );
};

export default Dashboard;

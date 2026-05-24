import { useEffect, useState } from 'react';
import { useSession } from '../contexts/userContext';
import CollectionCard from '../components/CollectionCard';
import ChannelCard from '../components/ChannelCard'
import './Dashboard.scss';
import isAlphaNumeric from '../lib/helper/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSearch, faXmark } from '@fortawesome/free-solid-svg-icons'

const Dashboard = () => {
  const { session, loading } = useSession();
  const [collecs, setCollecs] = useState([]); // array of objects : id, created_at, name, user_id
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
          if(response.statusText === "Too Many Requests"){
            //rate limiter error
            alert("You've exhausted getting recommendations for a while. Please try again after a break!")
            setMoodResponse([])
            setMoodInput("")
            return
          }
          const errorData = await response.json()
          const errorMessage = errorData.errorMessage || errorData.message || 'Unknown error'
          console.log(errorMessage)
          alert(errorMessage)
          return
      }

      const responseJson = await response.json()
      if(responseJson?.data?.length !== 0){
        setMoodResponse(responseJson.data.sort((a, b) => b?.similarity - a?.similarity))
      }else{
        alert("No custom recommendations for now! Any channel from the ones you archived would be good enough for the moment:) For better recommendation results in the future, please add more channels to your subsorb")
        setMoodResponse([])
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

  //create collection submit
  const handleSubmit = (e) => {
    e.preventDefault()
    if(formInput === '') return
    makeCollection(formInput)
    setFormInput('')
  }

  //mood based input submit
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
              <button  className='dark-create-btn' type="submit">
                 <FontAwesomeIcon icon={faPlus} />
              </button>
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
            <button  className='dark-create-btn' type="submit">
                 <FontAwesomeIcon icon={faPlus} />
            </button>
          </div>
        </form>

        <form className="dashboard-form mood-form">
            <div>
              <label htmlFor='moodInput'>
                Enter your mood : I want to watch book videos
              </label>
            </div>
            <div>
              <input id='moodInput' type='text' onChange={handleMoodFormChange} value={moodInput}/>
              <button className='dark-create-btn' type="submit" onClick={handleMoodSubmit}>
                <FontAwesomeIcon icon={faSearch}/>
              </button>
              <button className='dark-create-btn' type="submit" onClick={(e) => {
                e.preventDefault();
                setMoodResponse([])
              }}>
                <FontAwesomeIcon icon={faXmark}/>
              </button>
            </div>
          </form>

      {
        moodResponse.length !== 0 && (
          <div className='moods-container'>
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
                    relevance={match.similarity? Math.trunc((match.similarity)*100) : 0}
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
                <CollectionCard name={collection.name} id={collection.id}/>
              </div>
            ))}
          </div>
      )}
      </div>
    </div>
  );
};

export default Dashboard;

import { useEffect, useState } from 'react'
import { useSession } from '../contexts/userContext'
import CollectionCard from '../components/CollectionCard';
import './Dashboard.scss';
import isAlphaNumeric from '../lib/helper/utils'

const Dashboard = () => {
  const { session, loading } = useSession()
  const [collecs, setCollecs] = useState([])
  const [error, setError] = useState(null)
  const [formInput, setFormInput] = useState('')

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

  const handleFormChange = (e) => {
    setFormInput(e.target.value)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if(formInput === '') return
    makeCollection(formInput)
  }

  useEffect(() => {
    if (session) {
      getCollections()
    } else {
      setCollecs([]);
    }
    //console.log("successfully authed to access dashboard");
  }, [])

  if (!session) {
    return <p>Unauthorized</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  if (loading) return <p>Loading...</p>;

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
  );
};

export default Dashboard;

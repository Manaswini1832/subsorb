import { useEffect, useState } from 'react'
import { useSession } from '../contexts/userContext'
import CollectionCard from '../components/CollectionCard';

const Dashboard = () => {
  const { session, loading } = useSession()
  const [collecs, setCollecs] = useState([])
  const [error, setError] = useState(null)
  const [formInput, setFormInput] = useState('')

  //TODO : uncomment in production
  // const getCollections = async () => {
  //   const backendUrl = 'http://localhost:5000/api/v1/collections'
  //   try {
  //       const response = await fetch(backendUrl, {
  //           method: 'GET',
  //           headers: {
  //             'Content-Type': 'application/json', 
  //             'Authorization': `Bearer ${session.access_token}`
  //           }
  //         })
  //     if (!response.ok) {
  //       throw new Error(`Response status: ${response.status}`)
  //     }

  //     const json = await response.json()
  //     console.log(json)
  //     setCollecs(json)
  //   } catch (error) {
  //     setError(error.message)
  //   }
  // }

  //TODO: comment this. it's only for ease of development
  const getCollections = async() => {
    const jsonData = [
                        {
                            "name": "collec1"
                        },
                        {
                            "name": "collec2"
                        },
                        {
                            "name": "collec3"
                        },
                        {
                            "name": "collecadjafb"
                        },
                        {
                            "name": "collecblahblah"
                        },
                        {
                            "name": "new collec"
                        }
                    ]
    setCollecs(jsonData)
  }

  const makeCollection = async(collecName) => {
    const backendUrl = 'http://localhost:5000/api/v1/collections'
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
                console.log('Error:', errorMessage)
                alert(errorMessage)//TODO : handle these gracefully
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
  }, [])

  if (!session) {
    return <p>Unauthorized</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <img src={session?.user?.user_metadata?.picture} alt="profile of the user" />
      <h2>{session?.user?.user_metadata?.name}'s Dashboard</h2>
      <form onSubmit={handleSubmit}>
        <div>
            <label htmlFor='collectionNameInput'>Collection Name :</label>
            <input id='collectionNameInput' type='text' onChange={handleFormChange} value={formInput}/>
        </div>
        <button type="submit">Create</button>
      </form>

      {collecs.length === 0 ? (
        <p>No collections available.</p>
      ) : (
        <div>
          {collecs.map((collection, index) => (
            <div key={index}>
              <CollectionCard name={collection.name} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;

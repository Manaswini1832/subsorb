import { useEffect, useState } from 'react'
import { useSession } from '../contexts/userContext'
import { useParams } from 'react-router-dom'
import ChannelCard from '../components/ChannelCard'

const Collection = () => {
  const { session, loading } = useSession()
  const [channels, setChannels] = useState([])
  const [error, setError] = useState(null)
  const [formInput, setFormInput] = useState('')
  const {collectionName} = useParams()

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
  const getChannels = async() => {
    const jsonData = [
                        {
                            "name": "chan1",
                            "url" : "https://www.youtube.com/@Shanspeare"
                        },
                        {
                            "name": "chan2",
                            "url" : "https://www.youtube.com/@Shanspeare"
                        },
                        {
                            "name": "chan3",
                            "url" : "https://www.youtube.com/@Shanspeare"
                        },
                        {
                            "name": "chan4",
                            "url" : "https://www.youtube.com/@Shanspeare"
                        },
                        {
                            "name": "chan5",
                            "url" : "https://www.youtube.com/@Shanspeare"
                        },
                        {
                            "name": "chan6",
                            "url" : "https://www.youtube.com/@Shanspeare"
                        }
                    ]
    setChannels(jsonData)
  }

  useEffect(() => {
    if (session) {
      getChannels()
    } else {
      setChannels([]);
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
            {/* <img src={session?.user?.user_metadata?.picture} alt="profile of the user" />
            <h2>{session?.user?.user_metadata?.name}'s Dashboard</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor='collectionNameInput'>Collection Name :</label>
                    <input id='collectionNameInput' type='text' onChange={handleFormChange} value={formInput}/>
                </div>
                <button type="submit">Create</button>
            </form> */}

            {/* <h1>{location.state.collectionName}</h1> */}
            <h1>{collectionName}</h1>


            {channels.length === 0 ? (
                <p>Collection Empty</p>
            ) : (
                <div>
                {channels.map((channel, index) => (
                    <div key={index}>
                    <ChannelCard name={channel.name} url={channel.url} />
                    </div>
                ))}
                </div>
            )}
        </div>
    )
}

export default Collection
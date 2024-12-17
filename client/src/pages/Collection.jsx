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

  const getChannels = async () => {
    const backendUrl = `http://localhost:5000/api/v1/collection-channels/${collectionName}`
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

      for (let index = 0; index < jsonData.length; index++) {
        if(!jsonData[index].Collections || !jsonData[index].Collections?.name){
          continue
        }
        if(jsonData[index].Collections.name && jsonData[index].Collections.name === collectionName){
          const sanitizedString = jsonData[index].Channels.details.replace(/\n/g, '\\n')
          const parsedData = JSON.parse(sanitizedString)
          setChannels((prev) => [...prev, parsedData])
        }
      }
    } catch (error) {
      setError(error.message)
    }
  }

  const makeChannel = async(handle) => {
    const backendUrl = 'http://localhost:5000/api/v1/channels'
    try {
        const response = await fetch(backendUrl, {
            method: 'POST',
            body: JSON.stringify({ channelHandle: handle }),
            headers: {
              'Content-Type': 'application/json', 
              'Authorization': `Bearer ${session.access_token}`
            }
          })

        if (!response.ok) {
            const errorData = await response.json()
            const errorMessage = errorData.errorMessage || errorData.message || 'Unknown error'
            (errorMessage)
            return
        }
        else addChannel(collectionName, handle)
    } catch (error) {
      alert(error)
    }
  }

  const addChannel = async(collectName, handle) => {
    ("add channel to collection")
    const backendUrl = 'http://localhost:5000/api/v1/collection-channels'
    try {
        const response = await fetch(backendUrl, {
            method: 'POST',
            body: JSON.stringify({ collecName: collectName, channelHandle: handle }),
            headers: {
              'Content-Type': 'application/json', 
              'Authorization': `Bearer ${session.access_token}`
            }
          })
        
        if(!response.ok){
          makeChannel(handle)
        }

        const jsonData = await response.json()
        for (let index = 0; index < jsonData.length; index++) {
          if(!jsonData[index].Collections || !jsonData[index].Collections.name){
            setChannels([])
            return
          }
          if(jsonData[index].Collections.name && jsonData[index].Collections.name === collectionName){
            const sanitizedString = jsonData[index].Channels.details.replace(/\n/g, '\\n')
            const parsedData = JSON.parse(sanitizedString)
            setChannels((prev) => [...prev, parsedData])
          }
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

    const regex = /@([^/?]+)/
    const match = formInput.match(regex)

    if (match) {
        const handle = match[1]
        addChannel(collectionName, handle)
    } else {
        alert("Invalid URL")
    }
  }

  useEffect(() => {
    if (session) {
      getChannels()
    } else {
      setChannels([])
    }
  }, [session])
  

  if (!session) {
    return <p>Unauthorized</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  if (loading) return <p>Loading...</p>;
    return (
        <div>
            {/* <h1>{location.state.collectionName}</h1> */}
            <h1>{collectionName}</h1>

            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor='channelUrlInput'>Channel URL :</label>
                    <input id='channelUrlInput' type='text' onChange={handleFormChange} value={formInput}/>
                </div>
                <button type="submit">Create</button>
            </form>

            {channels.length === 0 ? (
                <p>Collection Empty</p>
            ) : (
                <div>
                {channels.map((channel, index) => (
                    <div key={index}>
                    <ChannelCard name={channel.items[0].snippet.title} 
                                 url={`https://www.youtube.com/channel/${channel.items[0].id}`} 
                                 thumbnail={channel.items[0].snippet.thumbnails.default.url}
                                description={channel.items[0].snippet.description}
                    />
                    </div>
                ))}
                </div>
            )}
        </div>
    )
}

export default Collection
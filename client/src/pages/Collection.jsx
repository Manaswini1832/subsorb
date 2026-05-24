import { useEffect, useState } from 'react';
import { useSession } from '../contexts/userContext';
import { useParams, useNavigate } from 'react-router-dom';
import ChannelCard from '../components/ChannelCard';
import './Collection.scss';

const Collection = () => {
  const { session, loading } = useSession();
  const [channels, setChannels] = useState([]);
  const [filteredChannels, setFilteredChannels] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [error, setError] = useState(null);
  const [formInput, setFormInput] = useState('');

  const {collectionInfo} = useParams();
  const parts = collectionInfo.split('-');
  const collectionID = parts.pop();
  const collectionName = parts.join('-');

  const navigate = useNavigate();

  const getChannels = async (collecID) => {
    if (!session) {
      setChannels([])
      setFilteredChannels([])
      return
    }

    const backendUrl = `${process.env.REACT_APP_BACKEND_API_URL_PROD}/api/v1/collection-channels/${collecID}`
    try {
      const response = await fetch(backendUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }

      const jsonData = await response.json();

      for (let index = 0; index < jsonData.length; index++) {
        let item = jsonData[index];
        if(!item?.Collections?.name || !item?.Channels?.details) continue;

        const sanitizedString = item.Channels.details.replace(/\n/g, '\\n')
        let parsedData = JSON.parse(sanitizedString)

        parsedData.aiSummary = item.Channels.ai_summary;
        parsedData.aiTags = item.Channels.ai_tags;

        setChannels((prev) => [...prev, parsedData])
        setFilteredChannels((prev) => [...prev, parsedData])

        if(item?.Channels?.ai_tags !== null){
            setTags((prev) =>
                  [...new Set([...prev,...jsonData[index].Channels.ai_tags
                  ])].sort((a, b) => a.localeCompare(b)) //sort for alphab order
          );
        }
      }
    } catch (error) {
      setError(error.message)
    }
  }

  const makeChannel = async(handle) => {
    const backendUrl = `${process.env.REACT_APP_BACKEND_API_URL_PROD}/api/v1/channels`
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
          if(response.statusText === "Too Many Requests"){
            //rate limiter error
            alert("You've exhausted adding channels for a while. Please try again after a break:)")
            return
          }
          const errorData = await response.json()
          const errorMessage = errorData.errorMessage || errorData.message || 'Unknown error'
          console.log(errorMessage)
          return
        }
        else addChannel(collectionName, handle, collectionID)
    } catch (error) {
      alert(error)
    }
  }

  const addChannel = async(collectName, handle, collectID) => {
    
    const backendUrl = `${process.env.REACT_APP_BACKEND_API_URL_PROD}/api/v1/collection-channels`
    try {
        const response = await fetch(backendUrl, {
            method: 'POST',
            body: JSON.stringify({ collecName: collectName, channelHandle: handle, collecID: collectID }),
            headers: {
              'Content-Type': 'application/json', 
              'Authorization': `Bearer ${session.access_token}`
            }
          });

        if (response.status === 409) {
          const result = await response.json();
          alert(result.message);
          return;
        }

        const jsonData = await response.json();
        
        if(jsonData.needsRetry){
          makeChannel(handle)
        }
        
        for (let index = 0; index < jsonData.length; index++) {
          let item = jsonData[index];

          if(!item?.Collections?.name || !item?.Channels?.details){
            setChannels([])
            setFilteredChannels([])
            return;
          }
          
          const sanitizedString = item.Channels.details.replace(/\n/g, '\\n')
          let parsedData = JSON.parse(sanitizedString)

          parsedData.aiSummary = item.Channels.ai_summary;
          parsedData.aiTags = item.Channels.ai_tags;

          setChannels((prev) => [...prev, parsedData])
          setFilteredChannels((prev) => [...prev, parsedData])

          if(item.Channels.ai_tags !== null){
              setTags((prev) =>
                [...new Set([...prev,...item.Channels.ai_tags
                ])].sort((a, b) => a.localeCompare(b)) //sort for alphab order
            );
          }
        }

    } catch (error) {
      alert(error)
    }
  }

  const goToDashboard = () => {
    navigate('/dashboard');
  };

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
        addChannel(collectionName, handle, collectionID)
    } else {
        alert("Invalid URL")
    }
  }

  const handleTagSubmit = (e) => {
    e.preventDefault();

    const value = e.target.value;

    setSelectedTags((prev) =>
      prev.includes(value) ? 
      selectedTags.filter((tag) => tag !== value) : 
      [...prev, value]
    );
  };

  const downloadPdf = async () => {
    const backendUrl = `${process.env.REACT_APP_BACKEND_API_URL_PROD}/api/v1/collection-channels/export-pdf`
      try {
        const response = await fetch(backendUrl, {
            method: 'POST',
            body: JSON.stringify({ collectionName: collectionName, collectionID: collectionID }),
            headers: {
              'Content-Type': 'application/json', 
              'Authorization': `Bearer ${session.access_token}`
            }
          })

      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`)
      }

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");

      a.href = url;
      a.download = "collection.pdf";

      a.click();

    } catch (error) {
      setError(error.message)
    }
  };

  useEffect(() => {
    if (selectedTags.length === 0) {
      setFilteredChannels(channels);
      return;
    }

    const filtered = channels.filter((channel) =>
      selectedTags.some((tag) =>
        channel.aiTags?.includes(tag)
      )
    );

    setFilteredChannels(filtered);
  }, [selectedTags, channels]);

  useEffect(() => {
    getChannels(collectionID)
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
          <div className='collection-top'>
            <h1>{collectionName}</h1>
            <button className='pink-go-to-dashboard-btn' onClick={goToDashboard}>Go to dashboard</button>
          </div>

          <form onSubmit={handleSubmit} className='collection-form'>
              <div><label htmlFor='channelUrlInput'>Channel URL :</label></div>
              <div>
                <input id='channelUrlInput' type='text' onChange={handleFormChange} value={formInput}/>
                <button className='dark-create-btn' type="submit">Add</button>
              </div>
          </form>

          <p>Error : {error}</p>
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
        <div className='collection-top'>
          <h1>{collectionName}</h1>
          <button onClick={downloadPdf}>Download as PDF</button>
          <button className='pink-go-to-dashboard-btn' onClick={goToDashboard}>Go to dashboard</button>
        </div>

        <form onSubmit={handleSubmit} className='collection-form'>
            <div><label htmlFor='channelUrlInput'>Channel URL :</label></div>
            <div>
              <input id='channelUrlInput' type='text' onChange={handleFormChange} value={formInput}/>
              <button className='dark-create-btn' type="submit">Add</button>
            </div>
        </form>

        <div className="collection-tags-container">
          {tags.map((tag, index) => (
            <button className={`collection-tags-tag ${
                selectedTags.includes(tag)
                  ? "collection-tags-tag-selected"
                  : "collection-tags-tag-unselected"
              }`} 
              onClick={handleTagSubmit} key={index} value={tag}>
              {tag}
            </button>
          ))}
        </div>

        {channels.length === 0 ? (
          <div className='dark-dashboard-channels-container'>
            <p>Collection Empty</p>
          </div>
        ) : (
            <div className='dark-dashboard-channels-container'>
            {filteredChannels.map((channel, index) => (
                <div key={index}>
                <ChannelCard
                  name={channel.items[0].snippet.title}
                  url={`https://www.youtube.com/channel/${channel.items[0].id}`}
                  thumbnail={channel.items[0].snippet.thumbnails.default.url}
                  description={
                    channel.aiSummary ?? channel.items[0].snippet.description
                  }
                  tags={channel.aiTags ?? []}
                />
                </div>
            ))}
            </div>
        )}
    </div>
  );
}

export default Collection;
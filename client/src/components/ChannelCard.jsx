import { useEffect, useState } from 'react';
import './ChannelCard.scss';
import Overlay from './Overlay'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons'
import Tag from "./Tag"

const ChannelCard = (props) => {
    const [isOpen, setIsOpen] = useState(false)

    const toggleOverlay = () => {
        setIsOpen(!isOpen)
    }

    const goToChannel = () => {
        window.location.href = props.url;
    }

    return(
        <div className="dark-channelCard" >
            <img src={props.thumbnail} alt="thumbnail" />
            <div className='dark-channelCard-content'>
                <p>{props.name}</p>
                <div className='dark-channel-tag-container'>
                    {props.tags.map((tag, tagId) => (
                        <Tag key={tagId} content={tag}/>
                    ))}
                </div>
                <div className='dark-channelCard-button-container'>
                    <button className='dark-channel-card-btn' onClick={() => toggleOverlay()}>
                        <FontAwesomeIcon icon={faPlus} />
                    </button>
                    <button className='dark-channel-card-btn-invert' onClick={goToChannel}>
                        <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
                    </button>
                </div>
                <Overlay 
                    isOpen={isOpen} 
                    onClose={toggleOverlay} 
                >
                    <div>
                        <img src={props.thumbnail} alt="thumbnail" />
                        <h2>{props.name}</h2>
                        <p>{props.description}</p>
                        <div className='dark-channel-tag-container'>
                            {props.tags?.map((tag, tagId) => (
                                <Tag key={tagId} content={tag}/>
                            ))}
                        </div>
                        <button className='dark-create-btn' onClick={goToChannel}>Go to channel</button>
                    </div>
                </Overlay>
            </div>
        </div>
    )
}

export default ChannelCard
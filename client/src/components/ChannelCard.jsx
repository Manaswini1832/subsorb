import { useEffect, useState } from 'react';
import './ChannelCard.scss';
import Overlay from './Overlay'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons'
import Tag from "./Tag"

const ChannelCard = (props) => {
    const [isOpen, setIsOpen] = useState(false);
    const [cleanedDescription, setCleanedDescription] = useState("");

    const toggleOverlay = () => {
        setIsOpen(!isOpen)
    }

    const goToChannel = () => {
        window.location.href = props.url;
    }

    useEffect(() => {
        if (props?.description) {
            const cleaned = props.description
                .replace(/\n/g, " ")
                .replace(/"/g, "")
                .replace(/\s+/g, " ")
                .trim();

            setCleanedDescription(cleaned);
        }
    }, [props.description]);

    return(
        <div className="dark-channelCard" >
            <img src={props.thumbnail} alt="thumbnail" />
            <div className='dark-channelCard-content'>
                <h2>{props.name}</h2>
                <div className='dark-channel-tag-container'>
                    {props.tags.map((tag, tagId) => (
                        <Tag key={tagId} content={tag}/>
                    ))}
                </div>
                {typeof props.relevance === "number" && (
                    <h4 className="dark-channelCard-mood-percentage">{props.relevance}% match</h4>
                )}
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
                        <p>{cleanedDescription}</p>
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
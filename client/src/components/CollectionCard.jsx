import { useNavigate } from 'react-router-dom';

import './CollectionCard.scss'

const CollectionCard = (props) => {
    const navigate = useNavigate();

    const goToDashboard = (name) => {
        navigate(`/dashboard/collection/${props.name}`);
    };

    return (
        <div className='dark-collectionCard' onClick={() => goToDashboard(props.name)}>
            <p>{props.name}</p>
        </div>
    )
}

export default CollectionCard
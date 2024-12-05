import { useNavigate } from 'react-router-dom';

import './CollectionCard.css'

const CollectionCard = (props) => {
    const navigate = useNavigate();

    const goToDashboard = (name) => {
        navigate(`/dashboard/collection/${props.name}`);
    };

    return (
        <div className='collectionCard' onClick={() => goToDashboard(props.name)}>
            <h1>{props.name}</h1>
        </div>
    )
}

export default CollectionCard
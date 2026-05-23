import { useNavigate } from 'react-router-dom';

import './CollectionCard.scss'

const CollectionCard = (props) => {
    const navigate = useNavigate();

    const goToDashboard = (name, id) => {
        navigate(`/dashboard/collection/${name}-${id}`);
    };

    return (
        <div className='dark-collectionCard' onClick={() => goToDashboard(props.name, props.id)}>
            <p>{props.name}</p>
        </div>
    )
}

export default CollectionCard
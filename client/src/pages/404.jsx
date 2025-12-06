import { useNavigate } from 'react-router-dom';

const Error404 = () => {

    const navigate = useNavigate();

    const goToDashboard = () => {
        navigate('/dashboard');
    };

    return (
        <div className='dark-container'>

            <div className='collection-top'>
                <button className='pink-go-to-dashboard-btn' onClick={goToDashboard}>Go to dashboard</button>
            </div>

            <div className='dark-dashboard-collections-container'>
                <p>404. Page Not Found</p>
            </div>
          
        </div>
    );
}

export default Error404
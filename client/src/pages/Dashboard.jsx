import { useSession } from '../contexts/userContext'

const Dashboard = () => {
    const { session, loading } = useSession();

  if (loading) return <p>Loading...</p>;

    return(
        <div>
            <img src={session?.user?.user_metadata?.picture} alt="profile of the user"/>
            {session?.user?.user_metadata?.name}'s Dashboard
      </div>
    )
}

export default Dashboard
import { useParams } from 'react-router-dom';

const Profile = () => {
  const { id } = useParams();
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Profile Page</h1>
      <p>Profile ID: {id}</p>
    </div>
  );
};

export default Profile; 
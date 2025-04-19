import { useParams } from 'react-router-dom';

const Club = () => {
  const { id } = useParams();
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Club Page</h1>
      <p>Club ID: {id}</p>
    </div>
  );
};

export default Club; 
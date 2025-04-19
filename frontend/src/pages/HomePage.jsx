import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { gamesAPI } from '../services/api';

const HomePage = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await gamesAPI.getAllGames(1, 6); // Get first 6 games
        setGames(response.data.games || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching games:', err);
        setError('Failed to load games. Please try again later.');
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <section className="mb-12">
        <h1 className="text-4xl font-bold mb-6">Welcome to GameStore</h1>
        <p className="text-xl text-gray-600 mb-8">
          Discover the latest and greatest games for all platforms.
        </p>
        <Link 
          to="/games" 
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Browse All Games
        </Link>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6">Featured Games</h2>
        {games.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game) => (
              <div 
                key={game.id} 
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
              >
                <img 
                  src={game.image_url || 'https://via.placeholder.com/300x200?text=Game+Image'} 
                  alt={game.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-xl font-semibold mb-2">{game.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{game.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">${game.price.toFixed(2)}</span>
                    <Link 
                      to={`/games/${game.id}`}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">No games available at the moment.</p>
        )}
      </section>
    </div>
  );
};

export default HomePage; 
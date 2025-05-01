import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import AuthNavbar from '../components/AuthNavbar';
import Post from '../components/Post';
import { useState, useEffect } from 'react';
import { userAPI } from '../api/api';

interface ProfileTitle {
  text: string;
  className: string;
}

interface ProfileData {
  email?: string;
  titles: ProfileTitle[];
  socialStats: {
    followers: number;
    following: number;
  };
  additionalInfo: {
    college?: string;
    location?: string;
  };
  stats: {
    xp: number;
    clubsJoined: number;
    eventsAttended: number;
  };
}

// Import profile images
import profile1 from '../assets/profile_fake/image.png';
import profile2 from '../assets/profile_fake/image copy.png';
import profile3 from '../assets/profile_fake/image copy 2.png';
import profile4 from '../assets/profile_fake/image copy 3.png';
import profile5 from '../assets/profile_fake/image copy 4.png';

// Sample comments data
const sampleComments = [
  {
    id: '1',
    user: {
      name: 'Sarah Chen',
      photoURL: profile1
    },
    text: 'This app is amazing! It has completely transformed how I manage my academic life. The integration between social and academic features is genius! 🌟',
    timestamp: new Date('2024-02-20T10:00:00')
  },
  {
    id: '2',
    user: {
      name: 'Mohammed Ali',
      photoURL: profile2
    },
    text: 'The UI is so clean and intuitive. Love how everything is organized! 🎨',
    timestamp: new Date('2024-02-20T10:30:00')
  },
  {
    id: '3',
    user: {
      name: 'Emma Wilson',
      photoURL: profile3
    },
    text: 'Finally, a platform that understands student needs! The clubs feature is particularly useful.',
    timestamp: new Date('2024-02-20T11:00:00')
  },
  {
    id: '4',
    user: {
      name: 'Carlos Rodriguez',
      photoURL: profile4
    },
    text: 'The XP system makes learning more engaging. Great job! 🎮',
    timestamp: new Date('2024-02-20T11:30:00')
  },
  {
    id: '5',
    user: {
      name: 'Aisha Rahman',
      photoURL: profile5
    },
    text: 'Love the multilingual support! Makes it so accessible. 🌍',
    timestamp: new Date('2024-02-20T12:00:00')
  }
];

const Profile = () => {
  const { user } = useAuth();
  const [showNewPost, setShowNewPost] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        console.log("PROFILE DATA", data);

        setLoading(true);
        const response = await userAPI.getProfile();
        const data = response.data;

        setProfileData({
          email: data.user.email,
          titles: data.is_admin
            ? [
                { text: 'Admin', className: 'bg-red-500/10 text-red-600 font-bold' },
                { text: 'Venti Developer', className: 'bg-green-500/10 text-green-600' }
              ]
            : [],
          socialStats: {
            followers: data.followers_count || 0,
            following: data.following_count || 0
          },
          additionalInfo: {
            college: data.university?.name,
            location: data.location
          },
          stats: {
            xp: data.xp || 0,
            clubsJoined: data.clubs_count || 0,
            eventsAttended: data.events_attended || 0
          }
        });
      } catch (err) {
        setError('Failed to load profile data');
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfileData();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-blue-100">
        <AuthNavbar />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-48 bg-white/20 rounded-2xl mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-32 bg-white/20 rounded-xl"></div>
              <div className="h-32 bg-white/20 rounded-xl"></div>
              <div className="h-32 bg-white/20 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-blue-100">
        <AuthNavbar />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-100">
      <AuthNavbar />

      {/* Quick email debug line */}
      <p className="text-center text-sm text-gray-400">Email: {profileData.email ?? 'No email found'}</p>

      {/* Everything else */}
      {/* ... rest of your UI unchanged ... */}
    </div>
  );
};

export default Profile;

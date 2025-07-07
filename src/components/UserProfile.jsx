'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';

const UserProfile = () => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include', // Important: ensures cookies are sent
        });

        if (!res.ok) {
          throw new Error('Not authenticated');
        }

        const data = await res.json();
        setUsername(data.username);
      } catch (err) {
        console.error('❌ Failed to fetch user:', err);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  if (loading) {
    return null; // Or show a loading spinner
  }

  return (
    <div className="w-full flex items-center justify-between px-6 py-3 bg-gradient-to-br from-gray-900 via-gray-850 to-blue-950 border-b border-gray-800 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
      <h1 className="text-2xl font-bold text-white flex items-center gap-2">
        CVision
      </h1>
      <div className="flex items-center space-x-2 bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-1.5 rounded-lg shadow hover:shadow-lg transition duration-200">
        <FontAwesomeIcon icon={faUser} className="text-white text-sm" />
        <span className="text-white font-semibold text-sm sm:text-base">
          {username}
        </span>
      </div>
    </div>
  );
};

export default UserProfile;

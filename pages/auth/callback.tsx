import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/authService';
import { Layout } from '@/components/Layout';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function AuthCallback() {
  const router = useRouter();
  const { setUser } = useAuth();

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    const fetchUser = async () => {
      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
        if (userData.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        router.push('/login?error=auth_failed');
      }
    };

    void fetchUser();
  }, [router, setUser]);

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-400">Completing sign in...</p>
        </div>
      </div>
    </Layout>
  );
}


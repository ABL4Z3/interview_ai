import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Button } from './Button';

export function Navbar() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div
            onClick={() => navigate('/dashboard')}
            className="flex items-center cursor-pointer"
          >
            <h1 className="text-2xl font-bold text-blue-600">IntervuAI</h1>
          </div>

          {/* Menu */}
          <div className="flex items-center gap-4">
            {currentUser && (
              <>
                <button
                  onClick={() => navigate('/')}
                  className="text-gray-600 hover:text-gray-900 font-medium text-sm"
                >
                  Home
                </button>
                <button
                  onClick={() => navigate('/pricing')}
                  className="text-gray-600 hover:text-gray-900 font-medium text-sm"
                >
                  Pricing
                </button>
                <div className="hidden sm:flex items-center gap-3">
                  <span className="text-sm text-gray-700">
                    {currentUser.name}
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                    {currentUser.interviewsRemaining} interviews left
                  </span>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

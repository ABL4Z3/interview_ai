import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/Button';

export function TermsAcceptancePage() {
  const navigate = useNavigate();
  const { currentUser, acceptTerms, loading, error } = useAuthStore();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    // Redirect if user already accepted terms or if not logged in
    if (!currentUser) {
      navigate('/login');
    } else if (currentUser.termsAccepted) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  const handleAcceptTerms = async () => {
    if (!termsAccepted) {
      setLocalError('You must accept the Terms of Service to continue');
      return;
    }

    setLocalError('');
    try {
      await acceptTerms(true, '1.0');
      navigate('/dashboard');
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Failed to accept terms');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to IntervuAI!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Before you can start using IntervuAI, we need you to review and accept our Terms of Service and Privacy Policy.
          </p>

          {(localError || error) && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-700 dark:text-red-200 text-sm">{localError || error}</p>
            </div>
          )}

          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 mb-6 rounded">
            <p className="text-blue-900 dark:text-blue-200 text-sm">
              Please take a moment to read our Terms of Service and Privacy Policy. These documents outline your rights and responsibilities as an IntervuAI user, including important information about our non-refund policy for credits and subscriptions.
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-3">
              <a
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 font-semibold underline"
              >
                Read Terms of Service →
              </a>
              <span className="text-gray-500 text-sm">(Opens in a new tab)</span>
            </div>
            <div className="flex items-start gap-3">
              <a
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 font-semibold underline"
              >
                Read Privacy Policy →
              </a>
              <span className="text-gray-500 text-sm">(Opens in a new tab)</span>
            </div>
          </div>

          <div className="flex items-start gap-3 mb-8 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <input
              type="checkbox"
              id="acceptTerms"
              checked={termsAccepted}
              onChange={(e) => {
                setTermsAccepted(e.target.checked);
                setLocalError('');
              }}
              className="mt-1 h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="acceptTerms" className="text-gray-700 dark:text-gray-300">
              <span className="font-semibold">I accept the Terms of Service and Privacy Policy</span>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                By checking this box, I acknowledge that I have read and agree to be bound by the Terms of Service and Privacy Policy, including the non-refund policy for all purchases.
              </p>
            </label>
          </div>

          <Button
            onClick={handleAcceptTerms}
            disabled={loading || !termsAccepted}
            className="w-full"
          >
            {loading ? 'Accepting Terms...' : 'Accept and Continue'}
          </Button>

          <p className="text-center text-gray-600 dark:text-gray-400 text-sm mt-4">
            You must accept these terms to use IntervuAI
          </p>
        </div>
      </div>
    </div>
  );
}

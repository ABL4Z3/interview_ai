import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { CheckCircle, X } from 'lucide-react';
import apiClient from '../services/apiClient';

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    period: '',
    description: 'Try IntervuAI with a free interview',
    features: [
      { text: '3 AI interviews', included: true },
      { text: 'Basic feedback', included: true },
      { text: 'Score tracking', included: true },
      { text: 'Detailed analysis', included: false },
      { text: 'Priority support', included: false },
    ],
    cta: 'Get Started Free',
    popular: false,
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 499,
    period: '/month',
    description: 'For serious interview preparation',
    features: [
      { text: '5 AI interviews/month', included: true },
      { text: 'Detailed feedback', included: true },
      { text: 'Score tracking', included: true },
      { text: 'Detailed analysis', included: true },
      { text: 'Priority support', included: false },
    ],
    cta: 'Start Preparing',
    popular: false,
  },
  {
    id: 'growth',
    name: 'Growth',
    price: 999,
    period: '/month',
    description: 'Unlimited practice for job seekers',
    features: [
      { text: 'Unlimited AI interviews', included: true },
      { text: 'Detailed feedback', included: true },
      { text: 'Score tracking', included: true },
      { text: 'Detailed analysis', included: true },
      { text: 'Priority support', included: true },
    ],
    cta: 'Go Unlimited',
    popular: true,
  },
];

export function PricingPage() {
  const navigate = useNavigate();
  const { token, currentUser } = useAuthStore();
  const [processing, setProcessing] = useState(null);

  const handleSelectPlan = async (planId) => {
    if (planId === 'free') {
      navigate(token ? '/dashboard' : '/register');
      return;
    }

    if (!token) {
      navigate('/register');
      return;
    }

    setProcessing(planId);
    try {
      const response = await apiClient.post('/payment/create-order', { plan: planId });
      const { orderId, amount, currency, keyId } = response.data.data;

      // Load Razorpay checkout
      const options = {
        key: keyId,
        amount,
        currency,
        name: 'IntervuAI',
        description: `${plans.find(p => p.id === planId).name} Plan`,
        order_id: orderId,
        handler: async function (razorpayResponse) {
          try {
            await apiClient.post('/payment/verify', {
              razorpayOrderId: razorpayResponse.razorpay_order_id,
              razorpayPaymentId: razorpayResponse.razorpay_payment_id,
              razorpaySignature: razorpayResponse.razorpay_signature,
            });
            alert('Payment successful! Your plan has been upgraded.');
            navigate('/dashboard');
          } catch (err) {
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: currentUser?.name || '',
          email: currentUser?.email || '',
        },
        theme: {
          color: '#2563eb',
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create order');
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1
              onClick={() => navigate('/')}
              className="text-2xl font-bold text-blue-600 cursor-pointer"
            >
              IntervuAI
            </h1>
            <div className="flex items-center gap-4">
              {token ? (
                <Button onClick={() => navigate('/dashboard')} variant="secondary">
                  Dashboard
                </Button>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/login')}
                    className="text-gray-600 hover:text-gray-900 font-medium"
                  >
                    Sign In
                  </button>
                  <Button onClick={() => navigate('/register')}>Get Started</Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Pricing Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose the plan that fits your interview preparation needs. Start free and upgrade anytime.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`relative p-8 flex flex-col ${
                  plan.popular ? 'border-2 border-blue-600 shadow-xl scale-105' : 'border border-gray-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-600 text-white text-sm font-bold px-4 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center">
                    <span className="text-5xl font-extrabold text-gray-900">
                      {plan.price === 0 ? 'Free' : `₹${plan.price}`}
                    </span>
                    {plan.period && (
                      <span className="text-gray-500 ml-1">{plan.period}</span>
                    )}
                  </div>
                </div>
                <ul className="space-y-4 mb-8 flex-grow">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      {feature.included ? (
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      ) : (
                        <X className="w-5 h-5 text-gray-300 flex-shrink-0" />
                      )}
                      <span className={feature.included ? 'text-gray-700' : 'text-gray-400'}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => handleSelectPlan(plan.id)}
                  variant={plan.popular ? 'primary' : 'secondary'}
                  size="lg"
                  className="w-full"
                  disabled={processing === plan.id || (currentUser?.subscriptionPlan === plan.id)}
                >
                  {processing === plan.id
                    ? 'Processing...'
                    : currentUser?.subscriptionPlan === plan.id
                    ? 'Current Plan'
                    : plan.cta}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {[
              {
                q: 'Can I try IntervuAI for free?',
                a: 'Yes! Every new account gets 3 free AI interviews with full feedback and scoring.',
              },
              {
                q: 'What types of interviews are available?',
                a: 'We cover Frontend, Backend, Full Stack, DevOps, and Data Science interviews at beginner, intermediate, and advanced levels.',
              },
              {
                q: 'How does the voice-based interview work?',
                a: 'Our AI asks you a question, you record your spoken answer using your microphone, and the AI transcribes, evaluates, and scores your response in real-time.',
              },
              {
                q: 'Can I cancel my subscription?',
                a: 'Yes, you can cancel anytime. Your access continues until the end of your billing period.',
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept all major credit/debit cards, UPI, and Net Banking through Razorpay.',
              },
            ].map((faq, idx) => (
              <div key={idx} className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm">
          <p>© {new Date().getFullYear()} IntervuAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

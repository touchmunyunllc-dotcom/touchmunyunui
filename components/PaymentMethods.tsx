import React from 'react';

export const PaymentMethods: React.FC = () => {
  const paymentMethods = [
    {
      name: 'American Express',
      logo: (
        <div className="flex flex-col items-center justify-center w-14 h-9 bg-blue-600 rounded px-2 py-1">
          <span className="text-white text-[10px] font-bold leading-tight">AMEX</span>
          <span className="text-white text-[7px] leading-tight">AMERICAN EXPRESS</span>
        </div>
      ),
    },
    {
      name: 'Apple Pay',
      logo: (
        <div className="flex items-center justify-center w-14 h-9 bg-black rounded px-2">
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-white mr-1">
            <path
              fill="currentColor"
              d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"
            />
          </svg>
          <span className="text-white text-xs font-semibold">Pay</span>
        </div>
      ),
    },
    {
      name: 'Diners Club',
      logo: (
        <div className="flex items-center justify-center w-14 h-9 bg-white rounded border border-gray-300 px-2">
          <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">D</span>
          </div>
        </div>
      ),
    },
    {
      name: 'Discover',
      logo: (
        <div className="flex items-center justify-center w-14 h-9 bg-white rounded border border-gray-300 px-2">
          <span className="text-gray-900 text-xs font-bold">DISCOVER</span>
        </div>
      ),
    },
    {
      name: 'Google Pay',
      logo: (
        <div className="flex items-center justify-center w-14 h-9 bg-white rounded border border-gray-300 px-1">
          <svg viewBox="0 0 24 24" className="w-5 h-5 mr-1">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span className="text-gray-700 text-xs font-semibold">Pay</span>
        </div>
      ),
    },
    {
      name: 'Mastercard',
      logo: (
        <div className="flex items-center justify-center w-14 h-9 bg-white rounded border border-gray-300 px-2">
          <div className="relative w-10 h-6">
            <div className="absolute left-0 top-0 w-5 h-6 bg-red-600 rounded-l-full" />
            <div className="absolute right-0 top-0 w-5 h-6 bg-orange-500 rounded-r-full" />
          </div>
        </div>
      ),
    },
    {
      name: 'Visa',
      logo: (
        <div className="flex items-center justify-center w-14 h-9 bg-blue-600 rounded px-2">
          <span className="text-white text-sm font-bold">VISA</span>
        </div>
      ),
    },
  ];

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-4">
          <p className="text-sm text-gray-400 mb-2 font-medium">We accept all major payment methods</p>
          <p className="text-xs text-gray-500">Secured by Stripe</p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {paymentMethods.map((method, index) => (
            <div
              key={index}
              className="flex items-center justify-center transition-transform hover:scale-105 duration-200 cursor-pointer"
              title={method.name}
            >
              {method.logo}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

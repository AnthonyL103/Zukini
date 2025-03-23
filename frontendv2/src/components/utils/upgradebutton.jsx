import React, { useState } from 'react';
import { useUser } from '../authentication/UserContext';

const UpgradeButton = () => {
  const { userId } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Handle upgrade button click
  const handleUpgradeClick = async () => {
    if (!userId) {
      setError('User ID is required');
      return;
    }
    
    if (userId.toString().startsWith('guest')) {
      // For guest users, redirect to signup page directly
      window.location.href = '/signup?source=premium_upgrade';
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('https://api.zukini.com/account/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId })
      });
      
      const data = await response.json();
      
      // Check for special 469 status code (guest user)
      if (response.status === 469) {
        // Redirect to signup page
        window.location.href = '/signup?source=premium_upgrade';
        return;
      }
      
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to create checkout session');
      }
      
      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div>
      <button 
        className={`group w-fit h-fit border-none bg-gray-200 p-2.5 rounded-lg shadow-md transition-all duration-200 active:scale-100 hover:shadow-lg ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
        onClick={handleUpgradeClick}
        disabled={isLoading}
      >
        <span className="w-fit h-full flex items-center justify-center bg-gray-100 rounded px-4 py-2 shadow-md gap-4 transition-all duration-200 active:scale-97">
          <span className="flex items-center justify-center gap-1.5">
            <p className="text-lg font-semibold text-gray-500">Upgrade to</p>
            <p className="bg-[#0f0647] text-white px-2 py-1 rounded">PRO</p>
          </span>
          <svg 
            className="w-7 transition-all duration-300 group-hover:w-8 group-hover:filter group-hover:drop-shadow-[0_0_8px_rgba(255,192,0,0.7)]" 
            viewBox="0 0 576 512" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="#FFC000"
          >
            <path
              d="M309 106c11.4-7 19-19.7 19-34c0-22.1-17.9-40-40-40s-40 17.9-40 40c0 14.4 7.6 27 19 34L209.7 220.6c-9.1 18.2-32.7 23.4-48.6 10.7L72 160c5-6.7 8-15 8-24c0-22.1-17.9-40-40-40S0 113.9 0 136s17.9 40 40 40c.2 0 .5 0 .7 0L86.4 427.4c5.5 30.4 32 52.6 63 52.6H426.6c30.9 0 57.4-22.1 63-52.6L535.3 176c.2 0 .5 0 .7 0c22.1 0 40-17.9 40-40s-17.9-40-40-40s-40 17.9-40 40c0 9 3 17.3 8 24l-89.1 71.3c-15.9 12.7-39.5 7.5-48.6-10.7L309 106z"
            ></path>
          </svg>
        </span>
      </button>
      
      {isLoading && (
        <p className="text-sm text-gray-500 mt-2">Processing...</p>
      )}
      
      {error && (
        <p className="text-sm text-red-500 mt-2">{error}</p>
      )}
    </div>
  );
};

export default UpgradeButton;
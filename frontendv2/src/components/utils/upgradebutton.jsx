import React from 'react';

const UpgradeButton = ({ onClick }) => {
  return (
    <button 
      className="group w-fit h-fit border-none bg-gray-200 p-2.5 rounded-lg shadow-md transition-all duration-200 active:scale-100 hover:shadow-lg"
      onClick={onClick}
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
  );
};

export default UpgradeButton;
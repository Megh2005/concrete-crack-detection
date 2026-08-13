import React from 'react';

export default function BackgroundPattern() {
  return (
    <div className="fixed inset-0 -z-10 bg-white overflow-hidden pointer-events-none select-none">
      <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] rounded-full bg-blue-400/10 blur-[130px]" />
      <div className="absolute bottom-[10%] right-[15%] w-[600px] h-[600px] rounded-full bg-sky-300/15 blur-[150px]" />
      <div className="absolute top-[40%] left-[-10%] w-[450px] h-[450px] rounded-full bg-indigo-300/10 blur-[140px]" />

      <svg
        className="absolute inset-0 w-full h-full stroke-black/5"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="cad-grid-small"
            width="24"
            height="24"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 24 0 L 0 0 0 24"
              fill="none"
              stroke="#000000"
              strokeWidth="0.5"
              strokeOpacity="0.04"
            />
          </pattern>

          <pattern
            id="cad-grid-large"
            width="120"
            height="120"
            patternUnits="userSpaceOnUse"
          >
            <rect width="120" height="120" fill="url(#cad-grid-small)" />
            <path
              d="M 120 0 L 0 0 0 120"
              fill="none"
              stroke="#1d4ed8"
              strokeWidth="1"
              strokeOpacity="0.08"
            />
            <circle cx="0" cy="0" r="1.5" fill="#1d4ed8" fillOpacity="0.3" />
            <circle cx="120" cy="0" r="1.5" fill="#1d4ed8" fillOpacity="0.3" />
            <circle cx="0" cy="120" r="1.5" fill="#1d4ed8" fillOpacity="0.3" />
            <circle cx="120" cy="120" r="1.5" fill="#1d4ed8" fillOpacity="0.3" />
          </pattern>
        </defs>

        <rect width="100%" height="100%" fill="url(#cad-grid-large)" />
      </svg>
    </div>
  );
}

const TrendBlob = () => (
  <svg
    viewBox="0 0 140 140"
    role="presentation"
    aria-hidden="true"
    className="brand-banner__icon"
  >
    <defs>
      <linearGradient id="blob-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00f5d4" />
        <stop offset="50%" stopColor="#7b2cbf" />
        <stop offset="100%" stopColor="#f72585" />
      </linearGradient>
      <linearGradient id="inner-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="rgba(0, 245, 212, 0.3)" />
        <stop offset="100%" stopColor="rgba(247, 37, 133, 0.3)" />
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    
    {/* Outer glow ring */}
    <circle 
      cx="70" cy="70" r="60" 
      fill="none" 
      stroke="url(#blob-gradient)" 
      strokeWidth="1"
      opacity="0.3"
    >
      <animate 
        attributeName="r" 
        values="58;62;58" 
        dur="3s" 
        repeatCount="indefinite"
      />
    </circle>
    
    {/* Main blob */}
    <circle 
      cx="70" cy="70" r="50" 
      fill="url(#inner-gradient)"
    >
      <animate 
        attributeName="r" 
        values="48;52;48" 
        dur="4s" 
        repeatCount="indefinite"
      />
    </circle>
    
    {/* Inner ring */}
    <circle 
      cx="70" cy="70" r="35" 
      fill="none" 
      stroke="url(#blob-gradient)" 
      strokeWidth="2"
      filter="url(#glow)"
    >
      <animate 
        attributeName="r" 
        values="33;37;33" 
        dur="2.5s" 
        repeatCount="indefinite"
      />
    </circle>
    
    {/* Trend line */}
    <path
      d="M25 75 Q45 55, 70 65 T115 55"
      fill="none"
      stroke="url(#blob-gradient)"
      strokeWidth="3"
      strokeLinecap="round"
      filter="url(#glow)"
    >
      <animate 
        attributeName="d" 
        values="M25 75 Q45 55, 70 65 T115 55;M25 70 Q45 50, 70 60 T115 50;M25 75 Q45 55, 70 65 T115 55" 
        dur="3s" 
        repeatCount="indefinite"
      />
    </path>
    
    {/* Center dot */}
    <circle 
      cx="70" cy="70" r="8" 
      fill="#030308" 
      stroke="url(#blob-gradient)" 
      strokeWidth="2"
    />
    
    {/* Pulse dot */}
    <circle cx="70" cy="70" r="4" fill="#00f5d4">
      <animate 
        attributeName="opacity" 
        values="1;0.3;1" 
        dur="1.5s" 
        repeatCount="indefinite"
      />
    </circle>
  </svg>
);

export default TrendBlob;

import React from 'react';

const Loader: React.FC = () => (
  <div className="flex items-center justify-center space-x-2 h-6 animate-fade-in">
    <div className="w-3 h-3 bg-green-400 rounded-full animate-bounce [animation-delay:0ms]" />
    <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce [animation-delay:100ms]" />
    <div className="w-3 h-3 bg-red-400 rounded-full animate-bounce [animation-delay:200ms]" />
  </div>
);

export default Loader;

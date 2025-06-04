import React, { useState, useEffect } from 'react';
import { Info } from 'lucide-react';

interface TipBoxProps {
  tip: string;
  duration?: number;
}

const TipBox: React.FC<TipBoxProps> = ({ tip, duration = 10000 }) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (open) {
      timer = setTimeout(() => {
        setOpen(false);
      }, duration);
    }
    return () => clearTimeout(timer);
  }, [open, duration]);

  return (
    <div className="relative w-full mb-4">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 text-blue-800 text-sm bg-blue-100 border border-blue-400 p-2 rounded-lg hover:bg-blue-200 transition"
      >
        <Info className="w-4 h-4" />
        Show Tips
      </button>

      {open && (
        <div className="mt-2 bg-white shadow-lg border border-blue-300 rounded-lg p-4 text-sm text-blue-800">
          {tip}
        </div>
      )}
    </div>
  );
};

export default TipBox;

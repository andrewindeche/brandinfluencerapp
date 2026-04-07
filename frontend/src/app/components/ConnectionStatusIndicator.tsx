import React from 'react';
import { connectionStore } from '@/rxjs/connectionStore';
import Loader from './Loader';

const ConnectionStatusIndicator: React.FC = () => {
  const [state, setState] = React.useState(connectionStore.getValue());

  React.useEffect(() => {
    const sub = connectionStore.subscribe(setState);
    return () => sub.unsubscribe();
  }, []);

  if (state.status === 'connected') {
    return null;
  }

  const showToast = state.status === 'disconnected' && state.wasLoggedIn;

  return (
    <>
      {showToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-500 text-white px-4 py-2 rounded shadow-lg flex items-center gap-2">
          <span>Connection lost. Reconnecting...</span>
          <Loader />
        </div>
      )}
      {state.status === 'reconnecting' && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-orange-400 text-white px-4 py-2 rounded shadow-lg flex items-center gap-2">
          <span>Reconnecting...</span>
          <Loader />
        </div>
      )}
    </>
  );
};

export default ConnectionStatusIndicator;
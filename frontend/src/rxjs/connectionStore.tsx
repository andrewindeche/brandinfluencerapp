import { BehaviorSubject } from 'rxjs';

export type ConnectionStatus = 'connected' | 'disconnected' | 'reconnecting';

interface ConnectionState {
  status: ConnectionStatus;
  wasLoggedIn: boolean;
}

const initialState: ConnectionState = {
  status: 'disconnected',
  wasLoggedIn: false,
};

const connectionStore$ = new BehaviorSubject<ConnectionState>(initialState);

export const connectionStore = {
  setConnected: () => {
    const current = connectionStore$.getValue();
    connectionStore$.next({ ...current, status: 'connected' });
  },

  setDisconnected: (wasLoggedIn: boolean) => {
    connectionStore$.next({ status: 'disconnected', wasLoggedIn });
  },

  setReconnecting: () => {
    const current = connectionStore$.getValue();
    connectionStore$.next({ ...current, status: 'reconnecting' });
  },

  setWasLoggedIn: (value: boolean) => {
    const current = connectionStore$.getValue();
    connectionStore$.next({ ...current, wasLoggedIn: value });
  },

  getValue: () => connectionStore$.getValue(),
  subscribe: (callback: (state: ConnectionState) => void) => {
    return connectionStore$.subscribe(callback);
  },
};
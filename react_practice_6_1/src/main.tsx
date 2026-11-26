import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Provider } from 'react-redux';
import { store } from './store';
import { AuthProvider } from './context/AuthContext';
import './styles/main.css';
import './styles/auth.css';
import './styles/pwa.css';
import { registerPwa } from './pwa/register';
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </Provider>
  </React.StrictMode>,
);
void registerPwa();

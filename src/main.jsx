import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AppProvider } from './context/AppContext.jsx';
import { FocusProvider } from './context/FocusContext.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppProvider>
        <FocusProvider>
          <App />
        </FocusProvider>
      </AppProvider>
    </BrowserRouter>
  </React.StrictMode>
);

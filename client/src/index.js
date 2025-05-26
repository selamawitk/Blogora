import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Import Bootstrap CSS and your custom styles
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Import your AuthProvider context wrapper
import { AuthProvider } from './context/AuthContext'; // Adjust path if necessary

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);

import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <Router>
      {/* Coloque o Toaster aqui, fora das rotas */}
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <AppRoutes />
    </Router>
  );
}

export default App;

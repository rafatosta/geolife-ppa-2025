import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { AuthProvider } from './app/providers/AuthProvider';
import { ProfileProvider } from './app/providers/ProfileProvider';
import './styles/index.css';

createRoot(document.getElementById('root')!).render(<StrictMode><AuthProvider><ProfileProvider><App /></ProfileProvider></AuthProvider></StrictMode>);

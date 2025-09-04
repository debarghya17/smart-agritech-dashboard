import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Ensure page starts at top on load
window.scrollTo(0, 0);

createRoot(document.getElementById("root")!).render(<App />);

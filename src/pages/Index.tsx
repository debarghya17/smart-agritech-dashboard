import { useEffect } from 'react';
import AgriTechDashboard from '../components/AgriTechDashboard';

const Index = () => {
  useEffect(() => {
    // Ensure page starts at top
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return <AgriTechDashboard />;
};

export default Index;

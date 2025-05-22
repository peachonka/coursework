import { useEffect, useState } from 'react';

export function useViewport() {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      document.documentElement.style.setProperty(
        '--viewport-width', 
        `${window.innerWidth}px`
      );
      setWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Инициализация

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return { width };
}
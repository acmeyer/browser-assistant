import { useEffect, useState } from 'react';

export function useAtBottom(bodyRef: React.RefObject<HTMLDivElement>, offset = 0) {
  const [isAtBottom, setIsAtBottom] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsAtBottom(
        window.innerHeight + window.scrollY >= (bodyRef.current?.scrollHeight || 0) - offset
      );
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [offset]);

  return isAtBottom;
}

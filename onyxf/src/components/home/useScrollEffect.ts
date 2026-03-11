// src/components/home/useScrollEffect.ts
import { useEffect, useRef, useCallback } from 'react';

export const useScrollEffect = () => {
  const postRefsMap = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    const handleScroll = () => {
      const viewportHeight = window.innerHeight;
      const halfwayPoint = viewportHeight / 2;

      postRefsMap.current.forEach((element) => {
        if (element) {
          const rect = element.getBoundingClientRect();
          const postCenter = rect.top + rect.height / 2;
          
          if (postCenter < halfwayPoint) {
            const distancePastHalfway = halfwayPoint - postCenter;
            const ratio = Math.min(distancePastHalfway / halfwayPoint, 1);
            
            element.style.opacity = (1 - ratio * 0.5).toString();
            element.style.transform = `scale(${1 - ratio * 0.1})`;
          } else {
            element.style.opacity = '1';
            element.style.transform = 'scale(1)';
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const setPostRef = useCallback((postId: string, element: HTMLDivElement | null) => {
    if (element) {
      postRefsMap.current.set(postId, element);
    } else {
      postRefsMap.current.delete(postId);
    }
  }, []);

  return { setPostRef };
};
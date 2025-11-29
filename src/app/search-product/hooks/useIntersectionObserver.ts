import { useEffect, useRef, useState } from "react";

interface UseIntersectionObserverOptions {
  threshold?: number | number[];
  rootMargin?: string;
  root?: Element | null;
  triggerOnce?: boolean;
}

export const useIntersectionObserver = (
  options: UseIntersectionObserverOptions = {}
) => {
  const {
    threshold = 0.1,
    rootMargin = "0px",
    root = null,
    triggerOnce = true,
  } = options;

  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const targetRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isIntersectingNow = entry.isIntersecting;

        if (isIntersectingNow) {
          setIsIntersecting(true);

          if (triggerOnce) {
            setHasIntersected(true);
            observer.disconnect();
          }
        } else if (!triggerOnce) {
          setIsIntersecting(false);
        }
      },
      {
        threshold,
        rootMargin,
        root,
      }
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, root, triggerOnce]);

  return {
    targetRef,
    isIntersecting: triggerOnce ? hasIntersected : isIntersecting,
    hasIntersected,
  };
};

export default useIntersectionObserver;

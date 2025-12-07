'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

type VisibilityMountProps = {
  children: ReactNode;
  className?: string;
  rootMargin?: string;
  threshold?: number;
};

const clampThreshold = (value: number) => Math.min(1, Math.max(0, value));

const VisibilityMount = ({
  children,
  className,
  rootMargin = '0px',
  threshold = 0.1,
}: VisibilityMountProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const clampedThreshold = clampThreshold(threshold);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting && entry.intersectionRatio >= clampedThreshold);
      },
      { rootMargin, threshold: clampedThreshold }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [clampedThreshold, rootMargin]);

  return (
    <div ref={containerRef} className={className}>
      {isVisible ? children : null}
    </div>
  );
};

export default VisibilityMount;

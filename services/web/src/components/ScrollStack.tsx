'use client';

import React, { useLayoutEffect, useRef, useCallback } from 'react';
import type { ReactNode } from 'react';
import './ScrollStack.css';

export interface ScrollStackItemProps {
  itemClassName?: string;
  children: ReactNode;
}

export const ScrollStackItem: React.FC<ScrollStackItemProps> = ({ children, itemClassName = '' }) => (
  <div className={`scroll-stack-card ${itemClassName}`.trim()}>{children}</div>
);

interface ScrollStackProps {
  className?: string;
  children: ReactNode;
  itemDistance?: number;
  itemScale?: number;
  itemStackDistance?: number;
  stackPosition?: string;
  scaleEndPosition?: string;
  baseScale?: number;
  scaleDuration?: number;
  rotationAmount?: number;
  blurAmount?: number;
  useWindowScroll?: boolean;
  onStackComplete?: () => void;
}

const ScrollStack: React.FC<ScrollStackProps> = ({
  children,
  className = '',
  itemDistance = 100,
  itemScale = 0.03,
  itemStackDistance = 30,
  stackPosition = '20%',
  scaleEndPosition = '10%',
  baseScale = 0.85,
  scaleDuration: _scaleDuration = 0.5,
  rotationAmount = 0,
  blurAmount = 0,
  useWindowScroll = false,
  onStackComplete
}) => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const stackCompletedRef = useRef(false);
  const pendingUpdateRef = useRef<number | null>(null);
  const cardsRef = useRef<HTMLElement[]>([]);
  const lastTransformsRef = useRef(new Map<number, any>());
  const isUpdatingRef = useRef(false);
  const isActiveRef = useRef(true);
  const layoutRef = useRef<{ cardOffsets: number[]; endOffset: number }>({ cardOffsets: [], endOffset: 0 });
  const scrollStateRef = useRef<{ scrollTop: number; containerHeight: number }>({ scrollTop: 0, containerHeight: 0 });

  const calculateProgress = useCallback((scrollTop: number, start: number, end: number) => {
    if (scrollTop < start) return 0;
    if (scrollTop > end) return 1;
    return (scrollTop - start) / (end - start);
  }, []);

  const parsePercentage = useCallback((value: string | number, containerHeight: number) => {
    if (typeof value === 'string' && value.includes('%')) {
      return (parseFloat(value) / 100) * containerHeight;
    }
    return parseFloat(value as string);
  }, []);

  const getScrollData = useCallback(() => {
    if (useWindowScroll) {
      return {
        scrollTop: window.scrollY,
        containerHeight: window.innerHeight,
        scrollContainer: document.documentElement
      };
    } else {
      const scroller = scrollerRef.current;
      return {
        scrollTop: scroller!.scrollTop,
        containerHeight: scroller!.clientHeight,
        scrollContainer: scroller!
      };
    }
  }, [useWindowScroll]);

  const getElementOffset = useCallback(
    (element: HTMLElement) => {
      if (useWindowScroll) {
        const rect = element.getBoundingClientRect();
        return rect.top + window.scrollY;
      } else {
        return element.offsetTop;
      }
    },
    [useWindowScroll]
  );

  const measureLayout = useCallback(() => {
    const cards = cardsRef.current;
    if (!cards.length) return;

    const endElement = useWindowScroll
      ? (document.querySelector('.scroll-stack-end') as HTMLElement)
      : (scrollerRef.current?.querySelector('.scroll-stack-end') as HTMLElement);

    layoutRef.current = {
      cardOffsets: cards.map((card) => getElementOffset(card)),
      endOffset: endElement ? getElementOffset(endElement) : 0
    };

    const { scrollTop, containerHeight } = getScrollData();
    scrollStateRef.current = { scrollTop, containerHeight };
  }, [getElementOffset, getScrollData, useWindowScroll]);

  const updateCardTransforms = useCallback(() => {
    if (!cardsRef.current.length || isUpdatingRef.current || !isActiveRef.current) return;

    isUpdatingRef.current = true;

    const { cardOffsets, endOffset } = layoutRef.current;
    const { scrollTop, containerHeight } = scrollStateRef.current;
    if (!cardOffsets.length || !containerHeight) {
      isUpdatingRef.current = false;
      return;
    }

    const stackPositionPx = parsePercentage(stackPosition, containerHeight);
    const scaleEndPositionPx = parsePercentage(scaleEndPosition, containerHeight);

    cardsRef.current.forEach((card, i) => {
      if (!card) return;

      const cardTop = cardOffsets[i];
      const triggerStart = cardTop - stackPositionPx - itemStackDistance * i;
      const triggerEnd = cardTop - scaleEndPositionPx;
      const pinStart = triggerStart;
      const pinEnd = (endOffset || triggerEnd) - containerHeight / 2;

      const scaleProgress = calculateProgress(scrollTop, triggerStart, triggerEnd);
      const targetScale = baseScale + i * itemScale;
      const scale = 1 - scaleProgress * (1 - targetScale);
      const rotation = rotationAmount ? i * rotationAmount * scaleProgress : 0;

      let blur = 0;
      if (blurAmount) {
        let topCardIndex = 0;
        for (let j = 0; j < cardOffsets.length; j++) {
          const jTriggerStart = cardOffsets[j] - stackPositionPx - itemStackDistance * j;
          if (scrollTop >= jTriggerStart) {
            topCardIndex = j;
          }
        }

        if (i < topCardIndex) {
          const depthInStack = topCardIndex - i;
          blur = Math.max(0, depthInStack * blurAmount);
        }
      }

      let translateY = 0;
      const isPinned = scrollTop >= pinStart && scrollTop <= pinEnd;

      if (isPinned) {
        translateY = scrollTop - cardTop + stackPositionPx + itemStackDistance * i;
      } else if (scrollTop > pinEnd) {
        translateY = pinEnd - cardTop + stackPositionPx + itemStackDistance * i;
      }

      const newTransform = {
        translateY: Math.round(translateY * 100) / 100,
        scale: Math.round(scale * 1000) / 1000,
        rotation: Math.round(rotation * 100) / 100,
        blur: Math.round(blur * 100) / 100
      };

      const lastTransform = lastTransformsRef.current.get(i);
      const hasChanged =
        !lastTransform ||
        Math.abs(lastTransform.translateY - newTransform.translateY) > 0.1 ||
        Math.abs(lastTransform.scale - newTransform.scale) > 0.001 ||
        Math.abs(lastTransform.rotation - newTransform.rotation) > 0.1 ||
        Math.abs(lastTransform.blur - newTransform.blur) > 0.1;

      if (hasChanged) {
        const transform = `translate3d(0, ${newTransform.translateY}px, 0) scale(${newTransform.scale}) rotate(${newTransform.rotation}deg)`;
        const filter = newTransform.blur > 0 ? `blur(${newTransform.blur}px)` : '';

        card.style.transform = transform;
        card.style.filter = filter;

        lastTransformsRef.current.set(i, newTransform);
      }

      if (i === cardOffsets.length - 1) {
        const isInView = scrollTop >= pinStart && scrollTop <= pinEnd;
        if (isInView && !stackCompletedRef.current) {
          stackCompletedRef.current = true;
          onStackComplete?.();
        } else if (!isInView && stackCompletedRef.current) {
          stackCompletedRef.current = false;
        }
      }
    });

    isUpdatingRef.current = false;
  }, [
    itemScale,
    itemStackDistance,
    stackPosition,
    scaleEndPosition,
    baseScale,
    rotationAmount,
    blurAmount,
    onStackComplete,
    calculateProgress,
    parsePercentage
  ]);

  const scheduleUpdate = useCallback(() => {
    if (pendingUpdateRef.current || !isActiveRef.current) return;
    pendingUpdateRef.current = requestAnimationFrame(() => {
      pendingUpdateRef.current = null;
      updateCardTransforms();
    });
  }, [updateCardTransforms]);

  const updateScrollState = useCallback(
    (event?: { scroll?: number }) => {
      if (event && typeof event.scroll === 'number') {
        scrollStateRef.current.scrollTop = event.scroll;
        scrollStateRef.current.containerHeight = useWindowScroll
          ? window.innerHeight
          : scrollerRef.current?.clientHeight ?? 0;
        return;
      }

      const { scrollTop, containerHeight } = getScrollData();
      scrollStateRef.current = { scrollTop, containerHeight };
    },
    [getScrollData, useWindowScroll]
  );

  const handleScroll = useCallback(
    (event?: { scroll?: number }) => {
      updateScrollState(event);
      scheduleUpdate();
    },
    [scheduleUpdate, updateScrollState]
  );

  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const cards = Array.from(
      useWindowScroll
        ? document.querySelectorAll('.scroll-stack-card')
        : scroller.querySelectorAll('.scroll-stack-card')
    ) as HTMLElement[];

    cardsRef.current = cards;
    const transformsCache = lastTransformsRef.current;

    cards.forEach((card, i) => {
      if (i < cards.length - 1) {
        card.style.marginBottom = `${itemDistance}px`;
      }
      card.style.willChange = 'transform, filter';
      card.style.transformOrigin = 'top center';
      card.style.backfaceVisibility = 'hidden';
      card.style.transform = 'translate3d(0,0,0)';
      card.style.webkitTransform = 'translate3d(0,0,0)';
      card.style.perspective = '1000px';
      card.style.webkitPerspective = '1000px';
    });

    measureLayout();
    scheduleUpdate();

    const resizeObserver = 'ResizeObserver' in window ? new ResizeObserver(measureLayout) : null;
    resizeObserver?.observe(scroller);
    cards.forEach((card) => resizeObserver?.observe(card));

    const onWindowResize = () => {
      measureLayout();
      scheduleUpdate();
    };

    const onScroll = (event: Event) => {
      if (!isActiveRef.current) return;
      handleScroll();
    };

    const attachTarget = useWindowScroll ? window : scroller;
    attachTarget.addEventListener('scroll', onScroll, { passive: true });

    const onWindowLoad = () => {
      measureLayout();
      scheduleUpdate();
    };
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('load', onWindowLoad);

    const fontReady = (document as any).fonts?.ready;
    if (fontReady?.then) {
      fontReady.then(() => {
        measureLayout();
        scheduleUpdate();
      });
    }

    const observer = 'IntersectionObserver' in window
      ? new IntersectionObserver(
          (entries) => {
            const [entry] = entries;
            isActiveRef.current = !!entry?.isIntersecting;
            if (isActiveRef.current) {
              measureLayout();
              scheduleUpdate();
            }
          },
          { threshold: 0.1 }
        )
      : null;
    if (observer && scroller) observer.observe(scroller);

    return () => {
      if (pendingUpdateRef.current) {
        cancelAnimationFrame(pendingUpdateRef.current);
        pendingUpdateRef.current = null;
      }
      resizeObserver?.disconnect();
      observer?.disconnect();
      attachTarget.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onWindowResize);
      window.removeEventListener('load', onWindowLoad);
      stackCompletedRef.current = false;
      cardsRef.current = [];
      transformsCache.clear();
      isUpdatingRef.current = false;
    };
  }, [
    itemDistance,
    itemScale,
    itemStackDistance,
    stackPosition,
    scaleEndPosition,
    baseScale,
    _scaleDuration,
    rotationAmount,
    blurAmount,
    useWindowScroll,
    onStackComplete,
    measureLayout,
    scheduleUpdate,
    handleScroll
  ]);

  const scrollerClasses = [
    'scroll-stack-scroller',
    useWindowScroll ? 'scroll-stack-scroller--window' : '',
    className
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={scrollerClasses} ref={scrollerRef}>
      <div className="scroll-stack-inner">
        {children}
        {/* Spacer so the last pin can release cleanly */}
        <div className="scroll-stack-end" />
      </div>
    </div>
  );
};

export default ScrollStack;

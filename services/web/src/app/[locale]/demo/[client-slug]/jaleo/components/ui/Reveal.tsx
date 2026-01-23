'use client';

import React, { useEffect, useRef } from 'react';
import { motion, useInView, useAnimation, Variants, useScroll, useTransform } from 'framer-motion';

interface Props {
  children: React.ReactNode;
  width?: 'fit-content' | '100%';
  delay?: number;
  duration?: number;
  type?: 'slide-up' | 'fade' | 'blur' | 'scale';
  className?: string;
  viewportMargin?: string;
}

export const Reveal: React.FC<Props> = ({ 
  children, 
  width = 'fit-content', 
  delay = 0.25, 
  duration = 0.8,
  type = 'slide-up',
  className = "",
  viewportMargin = "-50px"
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: viewportMargin as any });
  const mainControls = useAnimation();

  useEffect(() => {
    if (isInView) {
      mainControls.start("visible");
    }
  }, [isInView, mainControls]);

  const variants: Record<string, Variants> = {
    'slide-up': {
      hidden: { opacity: 0, y: 75 },
      visible: { opacity: 1, y: 0 },
    },
    'fade': {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
    },
    'blur': {
      hidden: { opacity: 0, filter: 'blur(10px)' },
      visible: { opacity: 1, filter: 'blur(0px)' },
    },
    'scale': {
      hidden: { opacity: 0, scale: 0.9 },
      visible: { opacity: 1, scale: 1 },
    }
  };

  return (
    <div ref={ref} style={{ position: 'relative', width }} className={className}>
      <motion.div
        variants={variants[type]}
        initial="hidden"
        animate={mainControls}
        transition={{ duration, delay, ease: [0.25, 0.25, 0.25, 0.75] }}
      >
        {children}
      </motion.div>
    </div>
  );
};

export const StaggerText: React.FC<{ text: string; className?: string; delay?: number }> = ({ text, className, delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: delay }
    }
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { type: "spring", damping: 12, stiffness: 100 }
    },
    hidden: {
      opacity: 0,
      y: 20,
      filter: 'blur(5px)',
    }
  };

  return (
    <motion.div
      ref={ref}
      style={{ display: "flex", flexWrap: "wrap" }}
      variants={container}
      initial="hidden"
      animate={controls}
      className={className}
    >
      {text.split(" ").map((word, index) => (
        <motion.span variants={child} key={index} style={{ marginRight: "0.25em" }}>
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
};

export const Parallax: React.FC<{ 
  children: React.ReactNode; 
  offset?: number; 
  className?: string;
  direction?: 'up' | 'down';
}> = ({ children, offset = 50, className = "", direction = 'up' }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const range = direction === 'up' ? [-offset, offset] : [offset, -offset];
  const y = useTransform(scrollYProgress, [0, 1], range);

  return (
    <div ref={ref} className={className}>
      <motion.div style={{ y }}>
        {children}
      </motion.div>
    </div>
  );
};

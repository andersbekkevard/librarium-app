"use client";

import { useEffect, useRef, useState } from "react";

interface UseScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export const useScrollAnimation = (options: UseScrollAnimationOptions = {}) => {
  const { threshold = 0.1, rootMargin = "0px 0px -50px 0px", triggerOnce = true } = options;
  const [isVisible, setIsVisible] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && (!triggerOnce || !hasTriggered)) {
          setIsVisible(true);
          if (triggerOnce) {
            setHasTriggered(true);
          }
        } else if (!triggerOnce && !entry.isIntersecting) {
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold, rootMargin, triggerOnce, hasTriggered]);

  return { elementRef, isVisible };
};

// Specific hook for staggered animations
export const useStaggeredScrollAnimation = (
  itemCount: number,
  options: UseScrollAnimationOptions = {}
) => {
  const { elementRef, isVisible } = useScrollAnimation(options);
  const [visibleItems, setVisibleItems] = useState<boolean[]>(
    new Array(itemCount).fill(false)
  );

  useEffect(() => {
    if (isVisible) {
      // Stagger the animations with 150ms delay between each item
      // Add base delay of 200ms to ensure smooth fade-in for first item
      visibleItems.forEach((_, index) => {
        setTimeout(() => {
          setVisibleItems(prev => {
            const newArray = [...prev];
            newArray[index] = true;
            return newArray;
          });
        }, (index * 150) + 200);
      });
    } else if (!options.triggerOnce) {
      setVisibleItems(new Array(itemCount).fill(false));
    }
  }, [isVisible, itemCount, options.triggerOnce]);

  return { elementRef, isVisible, visibleItems };
};
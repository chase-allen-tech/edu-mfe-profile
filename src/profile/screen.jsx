import React, { useEffect, useState, useRef } from "react";
import { motion, useAnimation } from "framer-motion";

export const useOnScreen = (ref, rootMargin = "0px") => {
  // State and setter for storing whether element is visible
  const [isIntersecting, setIntersecting] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Update our state when observer callback fires
        setIntersecting(entry.isIntersecting);
      },
      {
        rootMargin,
      }
    );
    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => {
      ref.current ? observer.unobserve(ref.current) : <></>
    };
  }, []); // Empty array ensures that effect is only run on mount and unmount
  return isIntersecting;
}

export const LazyShow = ({ children, initX, initY, targetX, targetY, isW100 = true }) => {

  const controls = useAnimation();
  const rootRef = useRef();
  const onScreen = useOnScreen(rootRef);

  useEffect(() => {
    if (onScreen) {
      controls.start({
        x: targetX,
        y: targetY,
        opacity: 1,
        transition: {
          duration: 0.5,
          ease: "easeOut"
        }
      });
    }
  }, [onScreen, controls]);

  return (
    <motion.div
      className="lazy-div position-absolute"
      ref={rootRef}
      initial={{ opacity: 0, x: initX, y: initY, width: isW100 ? '100%' : 'inherite' }}
      animate={controls}
    >
      {children}
    </motion.div>
  );
};
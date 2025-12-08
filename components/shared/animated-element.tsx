"use client";

import { useEffect, useRef, useState } from "react";

interface AnimatedElementProps {
  children: React.ReactNode;
  delay?: number;
  variant?: "fadeUp" | "fadeIn" | "slideLeft" | "slideRight";
}

export const AnimatedElement = ({
  children,
  delay = 0,
  variant = "fadeUp",
}: AnimatedElementProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const variants = {
    fadeUp: "opacity-0 translate-y-10",
    fadeIn: "opacity-0",
    slideLeft: "opacity-0 translate-x-10",
    slideRight: "opacity-0 -translate-x-10",
  };

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${
        isVisible
          ? "opacity-100 translate-y-0 translate-x-0"
          : variants[variant]
      }`}
      style={{ transitionDelay: isVisible ? `${delay}ms` : "0ms" }}
    >
      {children}
    </div>
  );
};

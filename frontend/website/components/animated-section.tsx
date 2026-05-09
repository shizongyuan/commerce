"use client";

import { useEffect, useState, ReactNode, useRef } from "react";

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: "up" | "down" | "left" | "right" | "fade" | "scale" | "rotate";
  stagger?: boolean;
  staggerIndex?: number;
  staggerDelay?: number;
  once?: boolean;
  parallax?: boolean;
  parallaxSpeed?: number;
}

export function AnimatedSection({
  children,
  className = "",
  delay = 0,
  duration = 800,
  direction = "up",
  stagger = false,
  staggerIndex = 0,
  staggerDelay = 100,
  once = true,
  parallax = false,
  parallaxSpeed = 0.5,
}: AnimatedSectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [offsetY, setOffsetY] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!parallax) return;

    const handleScroll = () => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        const scrollY = window.scrollY;
        const elementTop = rect.top + scrollY;
        const relativePosition = (scrollY - elementTop + window.innerHeight) / (window.innerHeight + rect.height);
        setOffsetY(relativePosition * parallaxSpeed * 100);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [parallax, parallaxSpeed]);

  const transforms: Record<string, string> = {
    up: "translate-y-12",
    down: "-translate-y-12",
    left: "translate-x-12",
    right: "-translate-x-12",
    fade: "opacity-0 scale-95",
    scale: "scale-90",
    rotate: "rotate-3",
  };

  const staggerOffset = stagger ? staggerIndex * staggerDelay : 0;
  const totalDelay = delay + staggerOffset;

  return (
    <div
      ref={sectionRef}
      className={`transition-all ease-out ${className}`}
      style={{
        transitionDelay: `${totalDelay}ms`,
        transitionDuration: `${duration}ms`,
        transform: isVisible
          ? "translate(0) scale(1) rotate(0)"
          : parallax
          ? `translateY(${offsetY}px) ${transforms[direction]}`
          : transforms[direction],
        opacity: isVisible ? 1 : 0,
      }}
    >
      {children}
    </div>
  );
}

interface MorphButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}

export function MorphButton({
  children,
  className = "",
  onClick,
  variant = "primary",
  size = "md",
}: MorphButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  const baseStyles = "relative overflow-hidden rounded-full font-medium transition-all duration-300";

  const variants = {
    primary: "bg-gradient-to-r from-hermes-orange to-hermes-orange-light text-white hover:shadow-lg hover:shadow-hermes-orange/30",
    secondary: "border-2 border-hermes-orange text-hermes-orange hover:bg-hermes-orange hover:text-white",
    ghost: "text-apple-gray-2 hover:text-hermes-orange",
  };

  const sizes = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
  };

  return (
    <button
      onClick={onClick}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className} ${
        isPressed ? "scale-95" : "hover:scale-105"
      }`}
    >
      <span className="relative z-10">{children}</span>
      {variant === "primary" && (
        <div className="absolute inset-0 bg-gradient-to-r from-hermes-orange-light to-hermes-orange opacity-0 hover:opacity-100 transition-opacity duration-300" />
      )}
    </button>
  );
}

interface FloatingOrbProps {
  className?: string;
  color?: "orange" | "gold" | "white";
  size?: "sm" | "md" | "lg";
  animate?: boolean;
}

export function FloatingOrb({
  className = "",
  color = "orange",
  size = "md",
  animate = true,
}: FloatingOrbProps) {
  const colors = {
    orange: "from-hermes-orange/30 to-transparent",
    gold: "from-[#D4AF37]/20 to-transparent",
    white: "from-white/10 to-transparent",
  };

  const sizes = {
    sm: "w-32 h-32 blur-[60px]",
    md: "w-64 h-64 blur-[100px]",
    lg: "w-96 h-96 blur-[150px]",
  };

  return (
    <div
      className={`absolute rounded-full bg-gradient-to-br ${colors[color]} ${sizes[size]} ${
        animate ? "animate-pulse" : ""
      } ${className}`}
    />
  );
}

interface MagneticWrapperProps {
  children: ReactNode;
  className?: string;
  strength?: number;
}

export function MagneticWrapper({
  children,
  className = "",
  strength = 0.3,
}: MagneticWrapperProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current || !isHovered) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = (e.clientX - centerX) * strength;
    const deltaY = (e.clientY - centerY) * strength;
    setPosition({ x: deltaX, y: deltaY });
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setPosition({ x: 0, y: 0 });
      }}
      className={`transition-transform duration-300 ease-out ${className}`}
      style={{
        transform: `translate(${position.x}px, ${position.y}px) scale(${isHovered ? 1.05 : 1})`,
      }}
    >
      {children}
    </div>
  );
}

interface ShineEffectProps {
  children: ReactNode;
  className?: string;
}

export function ShineEffect({ children, className = "" }: ShineEffectProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {children}
      <div className="absolute inset-0 -translate-x-full hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
    </div>
  );
}

interface CounterAnimationProps {
  end: number;
  duration?: number;
  className?: string;
  suffix?: string;
}

export function CounterAnimation({
  end,
  duration = 2000,
  className = "",
  suffix = "",
}: CounterAnimationProps) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const startTime = Date.now();
          const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(easeOut * end));

            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };
          animate();
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [end, duration, hasAnimated]);

  return (
    <div ref={ref} className={className}>
      {count}
      {suffix}
    </div>
  );
}

interface RippleEffectProps {
  className?: string;
}

export function RippleEffect({ className = "" }: RippleEffectProps) {
  return (
    <div
      className={`absolute inset-0 rounded-inherit pointer-events-none overflow-hidden ${className}`}
    >
      <span className="absolute w-[200%] h-[200%] -top-[50%] -left-[50%] animate-ripple bg-gradient-to-r from-hermes-orange/10 via-hermes-orange/5 to-transparent" />
    </div>
  );
}

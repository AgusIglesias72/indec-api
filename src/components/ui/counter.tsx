import { useState, useEffect, useRef } from "react"
import { useInView } from "framer-motion"

interface CounterProps {
  end: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  separator?: string;
  className?: string;
}

export default function Counter({
  end,
  duration = 0.5,
  decimals = 0,
  prefix = "",
  suffix = "",  
  separator = ",",
  className = "",
}: CounterProps) {
  const [count, setCount] = useState(0);
  const counterRef = useRef<HTMLSpanElement>(null);
  const inView = useInView(counterRef, { once: true, amount: 0.5 });
  const countRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!inView) return;

    let startTime: number | null = null;
    const finalCount = end;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);

      // Linear progress
      const currentCount = progress * finalCount;
      countRef.current = currentCount;
      setCount(currentCount);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setCount(finalCount); // Ensure we end exactly at the target
      }
    };

    // Start the animation
    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [inView, end, duration]);

  // Format number according to specified decimals
  const formatNumber = (num: number, separator: string = ',') => {
    if (separator === '.') {
      return num.toLocaleString('es-AR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).replace(/,/g, '.');
    }

    return num.toLocaleString('es-AR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  return (
    <span ref={counterRef} className={className}>
      {prefix}{formatNumber(count, separator)}{suffix}
    </span>
  );
}
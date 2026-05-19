import React, { useEffect, useRef, useState } from 'react';

export default function ScaledComponent({ children, style }: { children: React.ReactNode, style?: React.CSSProperties }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [baseSize, setBaseSize] = useState<{ width: number; height: number } | null>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const measureAndScale = () => {
      if (!containerRef.current) return;

      const parent = containerRef.current.parentElement;
      if (!parent) return;
      const { width: availWidth, height: availHeight } = parent.getBoundingClientRect();

      if (!baseSize) {
        // Set the base size only once
        setBaseSize({ width: availWidth, height: availHeight });
        setScale(1);
      } else {
        const scaleX = availWidth / baseSize.width;
        const scaleY = availHeight / baseSize.height;
        setScale(Math.min(scaleX, scaleY));
      }
    };

    measureAndScale();
    window.addEventListener('resize', measureAndScale);
    return () => window.removeEventListener('resize', measureAndScale);
  }, [baseSize]);

  return (
    <div
      ref={containerRef}
      style={{
        ...style,
        width: baseSize?.width ?? '100%',
        height: baseSize?.height ?? '100%',
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        position: 'absolute',
      }}
    >
       {children}
    </div>
  );
}

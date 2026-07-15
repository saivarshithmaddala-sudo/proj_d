"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const LiquidEther = dynamic(() => import("@/components/LiquidEther"), { ssr: false });

/**
 * Adaptive LiquidEther background.
 * – Detects mobile/tablet via matchMedia to scale down simulation quality.
 * – Disables pointer-events so scrolling is never blocked on touch devices.
 */
export default function LiquidEtherBackground() {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const mq480 = window.matchMedia("(max-width: 480px)");
    const mq768 = window.matchMedia("(max-width: 768px)");

    const update = () => {
      setIsMobile(mq480.matches);
      setIsTablet(!mq480.matches && mq768.matches);
    };

    update();
    mq480.addEventListener("change", update);
    mq768.addEventListener("change", update);
    return () => {
      mq480.removeEventListener("change", update);
      mq768.removeEventListener("change", update);
    };
  }, []);

  // Scale quality to device power
  const resolution   = isMobile ? 0.25 : isTablet ? 0.35 : 0.5;
  const iterations   = isMobile ? 12   : isTablet ? 20   : 32;
  const cursorSize   = isMobile ? 60   : isTablet ? 80   : 120;
  const autoIntensity = isMobile ? 1.6 : isTablet ? 2.0  : 2.5;
  const mouseForce   = isMobile ? 18   : 25;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        // Never block touch-scroll on mobile
        pointerEvents: "none",
        touchAction: "none",
        opacity: 0.55,
        mixBlendMode: "screen",
      }}
    >
      <LiquidEther
        colors={["#0d9488", "#6366f1", "#0891b2", "#14b8a6"]}
        mouseForce={mouseForce}
        cursorSize={cursorSize}
        resolution={resolution}
        iterationsPoisson={iterations}
        iterationsViscous={iterations}
        autoDemo={true}
        autoSpeed={0.35}
        autoIntensity={autoIntensity}
        autoResumeDelay={2000}
        autoRampDuration={0.8}
        takeoverDuration={0.3}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}

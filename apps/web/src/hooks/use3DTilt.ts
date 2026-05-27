import { RefObject, useEffect } from "react";

interface Use3DTiltOptions {
  maxTilt?: number;
  perspective?: number;
  scale?: number;
}

export function use3DTilt(
  ref: RefObject<HTMLElement | null>,
  options: Use3DTiltOptions = {}
) {
  const { maxTilt = 15, perspective = 1000, scale = 1.02 } = options;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let rafId: number;
    
    // For smooth transitions back to 0
    let currentX = 0;
    let currentY = 0;
    let targetX = 0;
    let targetY = 0;
    let isHovering = false;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isHovering) return;
      
      const rect = element.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      
      const centerX = rect.left + width / 2;
      const centerY = rect.top + height / 2;
      
      const mouseX = e.clientX - centerX;
      const mouseY = e.clientY - centerY;
      
      targetX = (mouseY / (height / 2)) * maxTilt;
      targetY = -(mouseX / (width / 2)) * maxTilt;
    };

    const handleMouseEnter = () => {
      isHovering = true;
      element.style.transition = "none";
    };

    const handleMouseLeave = () => {
      isHovering = false;
      targetX = 0;
      targetY = 0;
      // Use CSS transition for the snap back
      element.style.transition = "transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)";
      element.style.transform = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale(1)`;
      
      // Reset CSS custom properties for the shine
      element.style.setProperty("--mouse-x", "50%");
      element.style.setProperty("--mouse-y", "50%");
      element.style.setProperty("--opacity", "0");
    };

    const handlePointerMove = (e: MouseEvent) => {
      if (!isHovering) return;
      
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      element.style.setProperty("--mouse-x", `${x}px`);
      element.style.setProperty("--mouse-y", `${y}px`);
      element.style.setProperty("--opacity", "1");
    };

    const animate = () => {
      if (isHovering) {
        currentX += (targetX - currentX) * 0.1;
        currentY += (targetY - currentY) * 0.1;
        
        element.style.transform = `perspective(${perspective}px) rotateX(${currentX}deg) rotateY(${currentY}deg) scale(${scale})`;
      }
      rafId = requestAnimationFrame(animate);
    };

    element.addEventListener("mouseenter", handleMouseEnter);
    element.addEventListener("mousemove", handleMouseMove);
    element.addEventListener("mousemove", handlePointerMove);
    element.addEventListener("mouseleave", handleMouseLeave);
    
    rafId = requestAnimationFrame(animate);

    return () => {
      element.removeEventListener("mouseenter", handleMouseEnter);
      element.removeEventListener("mousemove", handleMouseMove);
      element.removeEventListener("mousemove", handlePointerMove);
      element.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(rafId);
    };
  }, [ref, maxTilt, perspective, scale]);
}

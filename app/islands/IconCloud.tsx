import { useEffect, useRef, useState } from "hono/jsx";

interface Icon {
  x: number;
  y: number;
  z: number;
  scale: number;
  opacity: number;
  id: number;
}

interface IconCloudProps {
  images: string[];
  width?: number;
  height?: number;
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export default function IconCloud({
  images,
  width = 400,
  height = 400,
}: IconCloudProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [iconPositions, setIconPositions] = useState<Icon[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [targetRotation, setTargetRotation] = useState<{
    x: number;
    y: number;
    startX: number;
    startY: number;
    distance: number;
    startTime: number;
    duration: number;
  } | null>(null);

  const animationFrameRef = useRef<number>(0);
  const rotationRef = useRef({ x: 0, y: 0 });
  const iconCanvasesRef = useRef<HTMLCanvasElement[]>([]);
  const imagesLoadedRef = useRef<boolean[]>([]);

  // Icon size constant
  const iconSize = 70;
  const iconRadius = iconSize / 2;

  // Create icon canvases once when images change
  useEffect(() => {
    if (!images || images.length === 0) return;

    imagesLoadedRef.current = new Array(images.length).fill(false);

    const newIconCanvases = images.map((imageUrl, index) => {
      const offscreen = document.createElement("canvas");
      offscreen.width = iconSize;
      offscreen.height = iconSize;
      const offCtx = offscreen.getContext("2d");

      if (offCtx) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = imageUrl;
        img.onload = () => {
          offCtx.clearRect(0, 0, offscreen.width, offscreen.height);

          // Draw the image slightly smaller (80% of size) with transparent background
          const padding = iconSize * 0.1; // 10% padding on each side
          offCtx.drawImage(
            img,
            padding,
            padding,
            iconSize - padding * 2,
            iconSize - padding * 2
          );

          imagesLoadedRef.current![index] = true;
        };
      }
      return offscreen;
    });

    iconCanvasesRef.current = newIconCanvases;
  }, [images]);

  // Generate initial icon positions on a sphere (Fibonacci sphere)
  useEffect(() => {
    if (!images || images.length === 0) return;

    const newIcons: Icon[] = [];
    const numIcons = images.length;
    // Sphere radius scales with canvas size - use actual width/height props
    const sphereRadius = Math.min(width, height) * 0.27;

    const offset = 2 / numIcons;
    const increment = Math.PI * (3 - Math.sqrt(5));

    for (let i = 0; i < numIcons; i++) {
      const y = i * offset - 1 + offset / 2;
      const r = Math.sqrt(1 - y * y);
      const phi = i * increment;

      const x = Math.cos(phi) * r;
      const z = Math.sin(phi) * r;

      newIcons.push({
        x: x * sphereRadius,
        y: y * sphereRadius,
        z: z * sphereRadius,
        scale: 1,
        opacity: 1,
        id: i,
      });
    }
    setIconPositions(newIcons);
  }, [images, width, height]);

  // Handle mouse events
  const handleMouseDown = (e: MouseEvent) => {
    const canvas = canvasRef.current;
    const rect = canvas?.getBoundingClientRect();
    if (!rect || !canvas) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    iconPositions.forEach((icon) => {
      const cosX = Math.cos(rotationRef.current!.x);
      const sinX = Math.sin(rotationRef.current!.x);
      const cosY = Math.cos(rotationRef.current!.y);
      const sinY = Math.sin(rotationRef.current!.y);

      const rotatedX = icon.x * cosY - icon.z * sinY;
      const rotatedZ = icon.x * sinY + icon.z * cosY;
      const rotatedY = icon.y * cosX + rotatedZ * sinX;

      const screenX = canvas.width / 2 + rotatedX;
      const screenY = canvas.height / 2 + rotatedY;

      const scale = (rotatedZ + 200) / 300;
      const clickRadius = iconRadius * scale;
      const dx = x - screenX;
      const dy = y - screenY;

      if (dx * dx + dy * dy < clickRadius * clickRadius) {
        const targetX = -Math.atan2(
          icon.y,
          Math.sqrt(icon.x * icon.x + icon.z * icon.z)
        );
        const targetY = Math.atan2(icon.x, icon.z);

        const currentX = rotationRef.current!.x;
        const currentY = rotationRef.current!.y;
        const distance = Math.sqrt(
          Math.pow(targetX - currentX, 2) + Math.pow(targetY - currentY, 2)
        );

        const duration = Math.min(2000, Math.max(800, distance * 1000));

        setTargetRotation({
          x: targetX,
          y: targetY,
          startX: currentX,
          startY: currentY,
          distance,
          startTime: performance.now(),
          duration,
        });
        return;
      }
    });

    setIsDragging(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setMousePos({ x, y });
    }

    if (isDragging) {
      const deltaX = e.clientX - lastMousePos.x;
      const deltaY = e.clientY - lastMousePos.y;

      rotationRef.current = {
        x: rotationRef.current!.x + deltaY * 0.002,
        y: rotationRef.current!.y + deltaX * 0.002,
      };

      setLastMousePos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Animation and rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);
      const dx = mousePos.x - centerX;
      const dy = mousePos.y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const speed = 0.003 + (distance / maxDistance) * 0.01;

      if (targetRotation) {
        const elapsed = performance.now() - targetRotation.startTime;
        const progress = Math.min(1, elapsed / targetRotation.duration);
        const easedProgress = easeOutCubic(progress);

        rotationRef.current = {
          x:
            targetRotation.startX +
            (targetRotation.x - targetRotation.startX) * easedProgress,
          y:
            targetRotation.startY +
            (targetRotation.y - targetRotation.startY) * easedProgress,
        };

        if (progress >= 1) {
          setTargetRotation(null);
        }
      } else if (!isDragging) {
        const rotation = rotationRef.current ?? { x: 0, y: 0 };
        rotationRef.current = {
          x: rotation.x + (dy / canvas.height) * speed,
          y: rotation.y + (dx / canvas.width) * speed,
        };
      }

      // Sort icons by z-depth for proper rendering order
      const rotation = rotationRef.current ?? { x: 0, y: 0 };
      const sortedIcons = [...iconPositions].map((icon) => {
        const cosX = Math.cos(rotation.x);
        const sinX = Math.sin(rotation.x);
        const cosY = Math.cos(rotation.y);
        const sinY = Math.sin(rotation.y);

        const rotatedX = icon.x * cosY - icon.z * sinY;
        const rotatedZ = icon.x * sinY + icon.z * cosY;
        const rotatedY = icon.y * cosX + rotatedZ * sinX;

        return { ...icon, rotatedX, rotatedY, rotatedZ };
      });

      sortedIcons.sort((a, b) => a.rotatedZ - b.rotatedZ);

      sortedIcons.forEach((icon) => {
        const scale = (icon.rotatedZ + 200) / 300;
        const opacity = Math.max(0.2, Math.min(1, (icon.rotatedZ + 150) / 200));

        ctx.save();
        ctx.translate(
          canvas.width / 2 + icon.rotatedX,
          canvas.height / 2 + icon.rotatedY
        );
        ctx.scale(scale, scale);
        ctx.globalAlpha = opacity;

        const iconCanvases = iconCanvasesRef.current ?? [];
        const imagesLoaded = imagesLoadedRef.current ?? [];
        if (iconCanvases[icon.id] && imagesLoaded[icon.id]) {
          ctx.drawImage(
            iconCanvases[icon.id],
            -iconRadius,
            -iconRadius,
            iconSize,
            iconSize
          );
        } else {
          // Fallback: show a placeholder circle while loading
          ctx.beginPath();
          ctx.arc(0, 0, iconRadius - 4, 0, Math.PI * 2);
          ctx.fillStyle = "#3f3f46";
          ctx.fill();
        }

        ctx.restore();
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [images, iconPositions, isDragging, mousePos, targetRotation]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      onMouseDown={handleMouseDown as unknown as () => void}
      onMouseMove={handleMouseMove as unknown as () => void}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      class="cursor-grab active:cursor-grabbing"
      aria-label="Interactive 3D Icon Cloud"
      role="img"
    />
  );
}

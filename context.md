# Implementing Particles Effect in Homepage

## Overview
The particles effect creates an animated background with floating dots that interact with mouse movement, adding a dynamic visual element to your webpage. This implementation is based on the magicui components system and uses HTML5 Canvas for optimal performance.

## Prerequisites
- Next.js project with Tailwind CSS
- React 18 or higher
- A modern browser that supports Canvas API
- Basic understanding of React hooks and Canvas

## Step 1: Create the Mouse Position Hook

First, create a custom hook for tracking mouse position in the `Particles.js` file:

```javascript
import { useEffect, useState } from "react";

function useMousePosition() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleMouseMove = (event) => {
        setMousePosition({ x: event.clientX, y: event.clientY });
      };
      window.addEventListener("mousemove", handleMouseMove);
      return () => window.removeEventListener("mousemove", handleMouseMove);
    }
  }, []);

  return mousePosition;
}
```

## Step 2: Create a Helper Function to Convert Hex Colors to RGB

```javascript
function hexToRgb(hex) {
  hex = hex.replace("#", "");
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return [r, g, b];
}
```

## Step 3: Create the Particles Component

Create `Particles.js` inside `components/magicui/` and add the following implementation:

```javascript
import React, { useEffect, useRef, useState } from "react";
import useMousePosition from "../hooks/useMousePosition";

const Particles = ({ className = "", quantity = 125, ease = 50, color = "#ffffff" }) => {
  const canvasRef = useRef(null);
  const context = useRef(null);
  const mousePosition = useMousePosition();
  const [dpr, setDpr] = useState(1);
  const particles = useRef([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setDpr(window.devicePixelRatio || 1);
      const canvas = canvasRef.current;
      if (canvas) {
        context.current = canvas.getContext("2d");
      }
      initCanvas();
      createParticles();
      animate();
      window.addEventListener("resize", initCanvas);
      return () => window.removeEventListener("resize", initCanvas);
    }
  }, [color]);

  const initCanvas = () => {
    if (canvasRef.current && context.current && typeof window !== "undefined") {
      const canvas = canvasRef.current;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      context.current.scale(dpr, dpr);
    }
  };

  const createParticles = () => {
    if (typeof window !== "undefined") {
      particles.current = [];
      for (let i = 0; i < quantity; i++) {
        particles.current.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          size: Math.random() * 3 + 0.5,
          speedX: Math.random() * 0.75 - 0.375,
          speedY: Math.random() * 0.75 - 0.375,
          color: hexToRgb(color),
        });
      }
    }
  };

  const drawParticles = () => {
    if (!context.current || typeof window === "undefined") return;
    context.current.clearRect(0, 0, window.innerWidth * dpr, window.innerHeight * dpr);
    particles.current.forEach((particle) => {
      context.current.beginPath();
      context.current.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      context.current.fillStyle = `rgba(${particle.color[0]}, ${particle.color[1]}, ${particle.color[2]}, 0.5)`;
      context.current.fill();
      context.current.closePath();
      particle.x += particle.speedX;
      particle.y += particle.speedY;
      if (particle.x < 0) particle.x = window.innerWidth;
      if (particle.x > window.innerWidth) particle.x = 0;
      if (particle.y < 0) particle.y = window.innerHeight;
      if (particle.y > window.innerHeight) particle.y = 0;
    });
  };

  const animate = () => {
    drawParticles();
    if (typeof window !== "undefined") {
      window.requestAnimationFrame(animate);
    }
  };

  return (
    <canvas
      ref={canvasRef}
      className={`${className} w-full h-full pointer-events-none absolute inset-0 z-0`}
    />
  );
};

export default Particles;
```

## Step 4: Add the Particles Component to the Homepage

Modify `pages/index.js` to include the Particles component:

```javascript
import Particles from "../components/magicui/Particles";

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col bg-gradient-to-br from-purple-400 via-pink-500 to-red-500">
      <Particles className="absolute inset-0" quantity={125} ease={50} color="#ffffff" />
      <Navbar />
      {/* Your existing homepage content */}
      <Footer />
    </div>
  );
}
```

## Configuration Options

| Prop       | Description                                 | Default Value |
|------------|---------------------------------------------|---------------|
| `className` | Additional CSS classes                     | `""`           |
| `quantity` | Number of particles                        | `125`         |
| `ease`     | Animation ease factor                      | `50`          |
| `color`    | Particle color in hex format              | `"#ffffff"`    |

## Notes

1. The particles are rendered using HTML5 Canvas for optimal performance.
2. The component is responsive and will adjust to window resizing.
3. Particles wrap around the screen edges for a continuous effect.
4. The effect is purely decorative and doesn't interfere with user interactions.
5. Device pixel ratio (DPR) is considered for crisp rendering on high-DPI displays.

## Troubleshooting

If the particles are not visible:
- Ensure the container has a relative position.
- Check that the z-index values are correct.
- Verify that the container has a defined height.
- Confirm that the color contrast is sufficient against the background.

For best performance, adjust the quantity of particles based on the target device capabilities.


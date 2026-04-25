'use client';
import React, { useLayoutEffect, useRef, useState, useCallback, useEffect } from 'react';

/**
 * Interfaces for typing the animation data structure
 */
interface PathData {
    id: string;
    d: string;
    color: string;
    blur: number;
}

interface NodePoint {
    id: string;
    cx: number;
    cy: number;
    r: number;
}

const COLORS = ['#3B82F6', '#60A5FA', '#93C5FD', '#FFFFFF'];

const App: React.FC = () => {
    const svgRef = useRef<SVGSVGElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const [paths, setPaths] = useState<PathData[]>([]);
    const [nodes, setNodes] = useState<NodePoint[]>([]);
    const [gsapLoaded, setGsapLoaded] = useState(false);

    /**
     * Load GSAP from CDN dynamically to avoid resolution errors
     */
    useEffect(() => {
        if ((window as any).gsap) {
            setGsapLoaded(true);
            return;
        }

        const script = document.createElement('script');
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js";
        script.async = true;
        script.onload = () => setGsapLoaded(true);
        document.head.appendChild(script);

        return () => {
            document.head.removeChild(script);
        };
    }, []);

    /**
     * Generates random data for Bezier lines and nodes
     */
    const generateSceneData = useCallback(() => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const lineCount = 15;

        const newPaths: PathData[] = [];
        const newNodes: NodePoint[] = [];

        for (let i = 0; i < lineCount; i++) {
            const x1 = Math.random() * width;
            const y1 = Math.random() * height;
            const cx1 = x1 + (Math.random() - 0.5) * 600;
            const cy1 = y1 + (Math.random() - 0.5) * 600;
            const cx2 = x1 + (Math.random() - 0.5) * 600;
            const cy2 = y1 + (Math.random() - 0.5) * 600;
            const x2 = x1 + (Math.random() - 0.5) * 800;
            const y2 = y1 + (Math.random() - 0.5) * 800;

            const pathString = `M${x1},${y1} C${cx1},${cy1} ${cx2},${cy2} ${x2},${y2}`;

            newPaths.push({
                id: `path-${i}`,
                d: pathString,
                color: COLORS[Math.floor(Math.random() * COLORS.length)],
                blur: Math.random() > 0.5 ? Math.random() * 2 : 0
            });

            if (Math.random() > 0.3) {
                newNodes.push({
                    id: `node-a-${i}`,
                    cx: x1,
                    cy: y1,
                    r: Math.random() * 3 + 1
                });
                newNodes.push({
                    id: `node-b-${i}`,
                    cx: x2,
                    cy: y2,
                    r: Math.random() * 2 + 1
                });
            }
        }

        setPaths(newPaths);
        setNodes(newNodes);
    }, []);

    useLayoutEffect(() => {
        generateSceneData();
        const handleResize = () => generateSceneData();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [generateSceneData]);

    /**
     * Animation orchestration with GSAP (loaded via window)
     */
    useLayoutEffect(() => {
        if (!gsapLoaded || paths.length === 0) return;

        const gsap = (window as any).gsap;
        if (!gsap) return;

        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                defaults: { ease: "power3.inOut" }
            });

            // 1. Prepare and animate lines (draw effect)
            gsap.set(".line-path", {
                strokeDasharray: (i: number, target: SVGPathElement) => target.getTotalLength(),
                strokeDashoffset: (i: number, target: SVGPathElement) => target.getTotalLength(),
            });

            tl.to(".line-path", {
                strokeDashoffset: 0,
                duration: 2.5,
                stagger: {
                    each: 0.1,
                    from: "random"
                },
                ease: "expo.inOut"
            });

            // 2. Animate nodes appearance
            tl.fromTo(".node-circle",
                { opacity: 0, scale: 0 },
                { opacity: 1, scale: 1, duration: 0.8, stagger: 0.02 },
                "-=1.5"
            );

            // 3. Animate text content
            tl.to(contentRef.current, {
                opacity: 1,
                duration: 1.5,
            }, "-=1");

            tl.from(titleRef.current, {
                y: 50,
                letterSpacing: "30px",
                filter: "blur(10px)",
                duration: 2,
                ease: "power2.out"
            }, "-=1.5");

            // 4. Infinite floating animation for organic look
            gsap.to(".line-path", {
                x: "random(-20, 20)",
                y: "random(-20, 20)",
                duration: "random(4, 7)",
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
                stagger: 0.1
            });

        }, svgRef);

        return () => ctx.revert();
    }, [paths, gsapLoaded]);

    const handleRestart = () => {
        setPaths([]);
        setTimeout(generateSceneData, 10);
    };

    return (
        <div className="relative w-full h-screen bg-[#050505] overflow-hidden flex items-center justify-center font-sans">

            {!gsapLoaded && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black">
                    <div className="text-blue-500 animate-pulse tracking-widest uppercase text-sm">Cargando experiencia...</div>
                </div>
            )}

            {/* SVG Container */}
            <div className="absolute inset-0 z-0">
                <svg
                    ref={svgRef}
                    className="w-full h-full"
                    preserveAspectRatio="xMidYMid slice"
                >
                    {paths.map((path) => (
                        <path
                            key={path.id}
                            className="line-path fill-none stroke-[1.5] stroke-cap-round"
                            d={path.d}
                            stroke={path.color}
                            style={{ filter: path.blur ? `blur(${path.blur}px)` : 'none' }}
                        />
                    ))}
                    {nodes.map((node) => (
                        <circle
                            key={node.id}
                            className="node-circle fill-white"
                            cx={node.cx}
                            cy={node.cy}
                            r={node.r}
                            style={{ filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.6))' }}
                        />
                    ))}
                </svg>
            </div>

            {/* UI Content */}
            <div
                ref={contentRef}
                className="relative z-10 text-center pointer-events-none opacity-0"
            >
                <h1
                    ref={titleRef}
                    className="text-6xl md:text-8xl font-black text-white tracking-tighter mb-4 select-none"
                >
                    REACT <span className="text-blue-500">&</span> GSAP
                </h1>
                <p className="text-blue-400 text-lg md:text-xl tracking-[0.5em] uppercase font-light">
                    Interacción & Código
                </p>
            </div>

            {/* Control Button */}
            <div className="absolute bottom-10 right-10 z-20">
                <button
                    onClick={handleRestart}
                    className="px-6 py-2 bg-white/5 border border-white/10 text-white rounded-full 
                     backdrop-blur-md hover:bg-white/20 transition-all active:scale-95 text-sm uppercase tracking-widest"
                >
                    Reiniciar
                </button>
            </div>

        </div>
    );
};

export default App;
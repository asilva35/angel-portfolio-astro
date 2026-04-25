"use client";

import { useRef, useMemo, Suspense, useEffect, useState, forwardRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useTexture, Stats } from '@react-three/drei';
import { EffectComposer, DotScreen, ChromaticAberration } from '@react-three/postprocessing';
import { gsap } from 'gsap'
import { ExternalLink } from 'lucide-react';

type Project = {
    name: string;
    image: string;
    description: string;
    link: string;
    tags: string[];
}

// Definición de Shaders extraída fuera del componente para mejor rendimiento
const vertexShader = `
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uMosaic;

  void main() {
    vUv = uv;
    vec3 pos = position;

    // Distancia del mouse en espacio UV
    float dist = distance(uv, uMouse);
    
    // Ondulación base constante (desordenada)
    float wave = (sin(pos.x * 2.0 + uTime) + cos(pos.y * 2.0 + uTime)) * 0.12;
    
    // Elevación por proximidad del mouse
    float mouseInfluence = smoothstep(0.45, 0.0, dist);
    
    // Deformación total
    float deformation = wave + (mouseInfluence * 1.5);
    
    // Aplicamos la deformación proporcional a uMosaic
    // Cuando uMosaic = 1.0, está deformado. Cuando uMosaic = 0.0, es plano.
    pos.z += deformation * uMosaic;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = `
  varying vec2 vUv;
  uniform sampler2D uTexture;
  uniform float uGridSize;
  uniform float uGap;
  uniform float uGrayScale;
  uniform float uTime;
  uniform float uMosaic;

  void main() {
    // Cálculo del mosaico (hacia donde se mueven los pixeles)
    vec2 gridUv = floor(vUv * uGridSize) / uGridSize;
    vec2 centeredGridUv = gridUv + (0.5 / uGridSize);
    
    // Interpolación de UVs para el efecto de "acomodar pixeles"
    vec2 mixedUv = mix(vUv, centeredGridUv, uMosaic);
    
    // Obtener el color base en la posición interpolada
    vec4 color = texture2D(uTexture, mixedUv);
    
    // Efecto de mosaico (luces, ruido, vignette)
    vec3 mosaicEffect = color.rgb;
    
    // Iluminación sutil
    mosaicEffect *= 0.85 + 0.15 * sin(vUv.y * 15.0);

    // Ruido sutil
    float n = fract(sin(dot(vUv, vec2(12.9898, 78.233))) * 43758.5453);
    mosaicEffect += n * 0.05;

    // Vignette
    float dist = distance(vUv, vec2(0.5));
    mosaicEffect *= smoothstep(0.8, 0.2, dist * 0.7);

    // Gray Scale
    float gray = dot(mosaicEffect, vec3(0.2126, 0.7152, 0.0722));
    mosaicEffect = mix(mosaicEffect, vec3(gray), uGrayScale);
    
    // Mezclamos el color original con el efecto de mosaico según uMosaic
    // Usamos mixedUv para que los píxeles parezcan deslizarse a su lugar
    vec4 originalColor = texture2D(uTexture, vUv);
    color.rgb = mix(originalColor.rgb, mosaicEffect, uMosaic);

    // Gaps (espacios entre grids) - Suavizado para transición fluida
    vec2 fractUv = fract(vUv * uGridSize);
    float gapMask = smoothstep(uGap, uGap + 0.01, fractUv.x) * 
                    smoothstep(1.0 - uGap, 1.0 - uGap - 0.01, fractUv.x) * 
                    smoothstep(uGap, uGap + 0.01, fractUv.y) * 
                    smoothstep(1.0 - uGap, 1.0 - uGap - 0.01, fractUv.y);

    // El efecto de rejilla (gap) solo aparece cuando uMosaic > 0
    float finalAlpha = mix(1.0, gapMask, uMosaic);
    
    gl_FragColor = vec4(color.rgb, finalAlpha * color.a);
  }
`;

const InteractivePlane = ({ idPlane, currentPlane, project, position, grayScale, interactivePlaneFocus }: { idPlane: number, currentPlane: number, project: Project, position: [number, number, number], grayScale: number, interactivePlaneFocus: boolean }) => {
    const materialRef = useRef<THREE.ShaderMaterial>(null);
    const [isInteractive, setIsInteractive] = useState(true);

    // useTexture de drei es más estable y maneja automáticamente la compatibilidad y caché
    const texture = useTexture(project.image);

    // Inicializamos los uniformes
    const uniforms = useMemo(
        () => ({
            uTime: { value: 0 },
            uTexture: { value: texture },
            uMouse: { value: new THREE.Vector2(0.0, 0.0) },
            uGridSize: { value: 320.0 },
            uGap: { value: 0.12 },
            uGrayScale: { value: 0.0 },
            uMosaic: { value: 1.0 },
        }),
        [texture]
    );

    useEffect(() => {
        setIsInteractive(!interactivePlaneFocus);
    }, [interactivePlaneFocus])

    useEffect(() => {
        if (materialRef.current) {
            const targetValue = currentPlane === idPlane ? 0.0 : 1.0;
            // Animamos uMosaic para una transición suave de 0.5s
            gsap.to(materialRef.current.uniforms.uMosaic, {
                value: targetValue,
                duration: 0.5,
                delay: 3.6, // Mantenemos la sincronización con el tiempo de transporte
                ease: "power2.inOut",
                overwrite: "auto"
            });
        }
    }, [currentPlane, idPlane]);

    useFrame((state) => {
        if (materialRef.current) {
            if (isInteractive) {
                // Actualizamos el tiempo de la ola
                materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();

                // Suavizado progresivo del GrayScale
                // materialRef.current.uniforms.uGrayScale.value = THREE.MathUtils.lerp(
                //     materialRef.current.uniforms.uGrayScale.value,
                //     grayScale,
                //     0.1
                // );

                // Actualizamos y suavizamos la posición del mouse
                const targetMouseX = (state.mouse.x + 1) / 2;
                const targetMouseY = (state.mouse.y + 1) / 2;

                materialRef.current.uniforms.uMouse.value.x = THREE.MathUtils.lerp(
                    materialRef.current.uniforms.uMouse.value.x,
                    targetMouseX,
                    0.1
                );
                materialRef.current.uniforms.uMouse.value.y = THREE.MathUtils.lerp(
                    materialRef.current.uniforms.uMouse.value.y,
                    targetMouseY,
                    0.1
                );
            }


        }
    });

    return (
        <mesh rotation={[-0.1, 0, 0]} position={position}>
            <planeGeometry args={[6, 4, 128, 128]} />
            <shaderMaterial
                ref={materialRef}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
                transparent={true}
                side={THREE.DoubleSide}
            />
        </mesh>
    );
};

const GroupPlane = forwardRef<THREE.Group, { projects: Project[], currentPlane: number, isTransitioning: boolean, interactivePlaneFocus: boolean }>(({ projects, currentPlane, isTransitioning, interactivePlaneFocus }, ref) => {
    const [grayScale, setGrayScale] = useState(0.0);
    useEffect(() => {
        if (isTransitioning) {
            setGrayScale(1.0);
        } else {
            setGrayScale(0.0);
        }
    }, [isTransitioning])

    return (
        <group ref={ref} position={[2, 0, 0]} rotation={[0, -Math.PI / 4, Math.PI / 16]}>
            {projects.map((project, i) => (
                <InteractivePlane idPlane={i} currentPlane={currentPlane} project={project} key={i} position={[0, i * -5, 0]} grayScale={grayScale} interactivePlaneFocus={interactivePlaneFocus} />
            ))}
        </group>
    )
})



export default function App({ begin, projects, onChangeIndex }: { begin: boolean, projects: Project[], onChangeIndex: (index: number) => void }) {
    const [interactivePlaneFocus, setInteractivePlaneFocus] = useState(false);
    const scrollBounceRef = useRef(0);
    const isMovingRef = useRef(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const groupRef = useRef<THREE.Group>(null);
    const indexRef = useRef(-1);
    const totalPlanes = projects.length;
    const [postProcessing, setPostProcessing] = useState(false);
    const [listenToScroll, setListenToScroll] = useState(false);
    const [showInfo, setShowInfo] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const loadingBar = useRef<HTMLDivElement>(null);
    const tlRef = useRef<gsap.core.Timeline | null>(null);

    useEffect(() => {
        if (!groupRef.current) return;
        if (begin) {
            if (indexRef.current === -1) {
                indexRef.current = 0;
                setActiveIndex(0);
            }
            gsap.to(groupRef.current.position, {
                x: 0,
                duration: 1.2,
                ease: 'power3.out',
            });
            gsap.to(groupRef.current!.rotation, {
                y: 0,
                z: 0,
                duration: 1.2,
                ease: 'power3.Out',
                onComplete: () => {
                    setListenToScroll(true);
                    setShowInfo(true);
                }
            });
        }
        else {
            gsap.to(groupRef.current!.position, {
                x: 2,
                duration: 1.2,
                ease: 'power3.out',
            });
            gsap.to(groupRef.current!.rotation, {
                y: -Math.PI / 4,
                z: 0,
                duration: 1.2,
                ease: 'power3.Out',
                onComplete: () => {
                    setListenToScroll(false);
                    setShowInfo(false);
                }
            });
        }
    }, [begin])

    useEffect(() => {
        onChangeIndex(activeIndex)
    }, [activeIndex])

    const doAnimation = (bounce: boolean = false, bounceDirection: number = 1) => {
        // Matar animaciones previas para evitar colisiones
        if (tlRef.current) tlRef.current.kill();
        gsap.killTweensOf(groupRef.current!.position);
        gsap.killTweensOf(loadingBar.current);

        if (!bounce) {
            tlRef.current = gsap.timeline({
                onComplete: () => {
                    isMovingRef.current = false;
                    setIsTransitioning(false);
                }
            });

            tlRef.current.to(groupRef.current!.position, {
                z: -2,
                duration: 1.2,
                ease: 'power3.inOut'
            })
                .to(groupRef.current!.position, {
                    y: indexRef.current * 5,
                    duration: 1.2,
                    ease: 'power3.inOut'
                })
                .to(groupRef.current!.position, {
                    z: 0,
                    duration: 1.2,
                    ease: 'power3.inOut'
                });

            // Loading bar animation
            gsap.to(loadingBar.current, {
                width: `100%`,
                display: 'block',
                duration: 3.6,
                ease: 'power3.inOut',
                overwrite: "auto",
                onComplete: () => {
                    gsap.to(loadingBar.current, {
                        display: 'none',
                        width: `0%`,
                        duration: 0.2,
                        ease: 'power3.inOut',
                        overwrite: "auto"
                    });
                }
            });

        } else {
            // Bounce Effect
            tlRef.current = gsap.timeline({
                onComplete: () => {
                    isMovingRef.current = false;
                    setIsTransitioning(false);
                }
            });
            tlRef.current.to(groupRef.current!.position, {
                y: indexRef.current * 5 + bounceDirection * 0.8,
                duration: 0.25,
                ease: 'power2.out'
            }).to(groupRef.current!.position, {
                y: indexRef.current * 5,
                duration: 0.6,
                ease: 'elastic.out(1, 0.5)'
            });
        }
    }

    const handleNextManual = () => {
        if (indexRef.current < totalPlanes - 1) {
            indexRef.current++;
            setActiveIndex(indexRef.current);
            doAnimation(false, 1);
        } else {
            doAnimation(true, 1);
        }
    }

    const handlePrevManual = () => {
        if (indexRef.current > 0) {
            indexRef.current--;
            setActiveIndex(indexRef.current);
            doAnimation(false, -1);
        } else {
            doAnimation(true, -1);
        }
    }

    const handleDotClick = (index: number) => {
        if (index === indexRef.current) return;
        // Evitamos clicks si ya está en movimiento o transicionando
        if (isMovingRef.current || isTransitioning) return;

        const diff = index - indexRef.current;
        indexRef.current = index;
        setActiveIndex(index);
        setIsTransitioning(true);
        isMovingRef.current = true;
        doAnimation(false, diff > 0 ? 1 : -1);
    };

    const handleFocusPlane = () => {
        // setInteractivePlaneFocus(!interactivePlaneFocus)
        // if (interactivePlaneFocus) {
        //     //setPostProcessing(true);
        // }
        // gsap.to(groupRef.current!.position, {
        //     z: interactivePlaneFocus ? 0 : 5,
        //     duration: 1.2,
        //     ease: 'power3.inOut',
        //     onComplete: () => {
        //         if (!interactivePlaneFocus) {
        //             //setPostProcessing(false);
        //         }
        //     }
        // });
        window.open(projects[activeIndex].link, '_blank');
    }

    useEffect(() => {
        if (!listenToScroll) return
        if (interactivePlaneFocus) return

        let timer: ReturnType<typeof setTimeout>
        const handleWheel = (e: WheelEvent) => {
            // Bloqueo síncrono para evitar saltos de pasos
            if (isMovingRef.current || isTransitioning) return

            scrollBounceRef.current += e.deltaY

            // Umbral de activación
            if (Math.abs(scrollBounceRef.current) > 100) {
                // Solo activamos si estamos dentro de los límites o si es un bounce
                const isNext = scrollBounceRef.current > 0;
                const isPrev = !isNext;

                if ((isNext && indexRef.current < totalPlanes - 1) || (isPrev && indexRef.current > 0)) {
                    isMovingRef.current = true;
                    setIsTransitioning(true);
                    if (isNext) handleNextManual();
                    else handlePrevManual();
                    scrollBounceRef.current = 0;
                } else if (Math.abs(scrollBounceRef.current) > 150) {
                    // Efecto bounce en los extremos
                    isMovingRef.current = true;
                    setIsTransitioning(true);
                    if (isNext) handleNextManual();
                    else handlePrevManual();
                    scrollBounceRef.current = 0;
                }
            }

            clearTimeout(timer)
            timer = setTimeout(() => {
                scrollBounceRef.current = 0
            }, 150)
        }

        let touchStartY = 0;
        const handleTouchStart = (e: TouchEvent) => {
            touchStartY = e.touches[0].clientY;
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (isMovingRef.current || isTransitioning) return;
            const touchCurrentY = e.touches[0].clientY;
            const delta = touchStartY - touchCurrentY;

            if (Math.abs(delta) > 50) { // Umbral para navegación táctil
                const isNext = delta > 0;
                const isPrev = !isNext;

                if ((isNext && indexRef.current < totalPlanes - 1) || (isPrev && indexRef.current > 0)) {
                    isMovingRef.current = true;
                    setIsTransitioning(true);
                    if (isNext) handleNextManual();
                    else handlePrevManual();
                } else {
                    // Bounce en extremos táctil
                    isMovingRef.current = true;
                    setIsTransitioning(true);
                    if (isNext) handleNextManual();
                    else handlePrevManual();
                }
                touchStartY = touchCurrentY; // Reset para evitar disparos múltiples rápidos
            }
        };

        window.addEventListener('wheel', handleWheel, { passive: true })
        window.addEventListener('touchstart', handleTouchStart, { passive: true })
        window.addEventListener('touchmove', handleTouchMove, { passive: true })
        return () => {
            window.removeEventListener('wheel', handleWheel)
            window.removeEventListener('touchstart', handleTouchStart)
            window.removeEventListener('touchmove', handleTouchMove)
            clearTimeout(timer)
        }
    }, [listenToScroll, interactivePlaneFocus, totalPlanes]);

    return (
        <div className="w-full h-screen bg-black">
            {/* <div className="absolute top-10 left-10 z-10 text-white select-none pointer-events-none font-sans">
                <h1 className="text-4xl font-black tracking-tighter mb-1 uppercase">Shader Mosaic</h1>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                    <p className="text-[10px] uppercase tracking-[0.3em] text-white/50">Interacción en tiempo real</p>
                </div>
            </div> */}

            {/* Simplificamos la cámara inyectándola en el Canvas para evitar bugs de dependencias */}
            <Canvas camera={{ position: [0, 0, 5], fov: 50 }} dpr={[1, 2]}>
                <color attach="background" args={['#000000']} />
                <ambientLight intensity={0.5} />

                {/* <Stats /> */}
                {/* Suspense es obligatorio cuando usamos carga de texturas */}
                <Suspense fallback={null}>
                    <GroupPlane projects={projects} currentPlane={indexRef.current} ref={groupRef} isTransitioning={isTransitioning} interactivePlaneFocus={interactivePlaneFocus} />
                </Suspense>

                {postProcessing && (
                    <EffectComposer multisampling={0} enableNormalPass={false}>
                        <DotScreen
                            angle={Math.PI * 0.125}
                            scale={1.2}
                        />
                        <ChromaticAberration
                            offset={new THREE.Vector2(0.0015, 0.0015)}
                        />
                    </EffectComposer>
                )}
            </Canvas>

            {showInfo && (
                <>
                    {!isTransitioning && (
                        <>
                            <div className="absolute top-1/2 -translate-y-1/2 left-10 right-10 z-10 flex justify-between items-end pointer-events-none select-none">
                                <div className="flex flex-col gap-4">
                                    <div className="max-w-[250px] text-[10px] text-white/30 leading-relaxed uppercase tracking-widest">
                                        <h2 className="text-[2rem] text-white/80 uppercase font-bold">{projects[activeIndex].name}</h2>
                                    </div>
                                    <div className="max-w-[250px] text-[10px] text-white/80 leading-relaxed uppercase tracking-widest">
                                        {projects[activeIndex].description}
                                    </div>
                                    <div className="text-white/80 text-[10px] font-mono">
                                        {projects[activeIndex].tags.join(' // ')}
                                    </div>
                                </div>
                            </div>
                            <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                                <button
                                    onClick={() => handleFocusPlane()}
                                    className="pointer-events-auto flex items-center gap-2 w-60 h-12 bg-black/20 border border-white/20 hover:border-white/50 hover:bg-black/50 transition-colors duration-300 rounded-full flex items-center justify-center cursor-pointer"
                                >
                                    OPEN PROJECT <ExternalLink />
                                </button>
                            </div>
                        </>
                    )}

                    {/* Sliderbar Dots */}
                    <div className="sidebar-slider fixed right-14 md:right-25 top-1/2 -translate-y-1/2 h-[50vh] w-[20px] flex flex-col justify-between items-center z-[100]">
                        <div className="absolute h-full w-[1px] bg-white/20 -z-10" />
                        {projects.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleDotClick(idx)}
                                className="relative w-full h-8 flex justify-center items-center group cursor-pointer"
                            >
                                <div
                                    className={`w-2 h-2 rounded-full transition-all duration-300 group-hover:scale-[1.8] group-hover:bg-white
                                        ${activeIndex === idx ? 'bg-white scale-[1.5] shadow-[0_0_10px_rgba(255,255,255,0.8)]' : 'bg-white/40'}
                                    `}
                                />
                            </button>
                        ))}
                    </div>

                    <div className="loading-bar-cnt fixed bottom-10 left-1/2 -translate-x-1/2 z-10 pointer-events-none" style={{ opacity: isTransitioning ? 1 : 0 }}>
                        <div className="w-60 h-2 bg-black/20 border border-white/20 rounded-full overflow-hidden">
                            <div ref={loadingBar} className="w-0 h-full bg-white/80" />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
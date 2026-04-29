import { Suspense, useMemo, useState, useRef, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {
    CameraControls,
    Stats,
    useGLTF,
    ContactShadows,
    useTexture,
    useProgress,
} from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'

const matcapTextures = {
    gold: '/assets/textures/matcaps/gold.png',
    emerald: '/assets/textures/matcaps/emerald.png',
    rubberBlack: '/assets/textures/matcaps/rubber-black.png',
    plasticWhite: '/assets/textures/matcaps/plastic-white.png',
    polishedMetal: '/assets/textures/matcaps/polished-metal.png',
    plasticBlue: '/assets/textures/matcaps/plastic-blue.png',
    plasticBlack: '/assets/textures/matcaps/plastic-black.png',
    leatherGray: '/assets/textures/matcaps/leather-gray.png',
    leatherBlack: '/assets/textures/matcaps/leather-black.png',
    mateGray: '/assets/textures/matcaps/mate-gray.png',
    mateWhite: '/assets/textures/matcaps/mate-white.png',
    brillantBlue: '/assets/textures/matcaps/brillant-blue.png',
    earth: '/assets/textures/matcaps/earth.png',
    concrete: '/assets/textures/concrete_tiles_02_diff_1k.jpg',
    pavement: '/assets/textures/pavement.png',
    blueMate: '/assets/textures/matcaps/blue-mate.png',
};

function Smoke() {
    const smokeTexture = useTexture('/assets/images/Smoke/0000.png');
    const count = 10;
    const meshRef = useRef<THREE.InstancedMesh>(null);

    const dummy = useMemo(() => new THREE.Object3D(), []);

    // 1. Añadimos 'direction' a los datos iniciales
    const particles = useMemo(() => {
        return Array.from({ length: count }, () => ({
            pos: new THREE.Vector3(Math.random() * 3 - 1.5, Math.random() * 3, -5),
            rot: Math.random() * Math.PI,
            speed: 0.2 + Math.random() * 0.3,
            direction: 1 // 1 para subir, -1 para bajar
        }));
    }, []);

    useFrame((state, delta) => {
        if (!meshRef.current) return;

        particles.forEach((p, i) => {
            // 2. Multiplicamos el movimiento por la dirección
            p.pos.y += delta * p.speed * p.direction;
            p.rot += delta * 0.125;

            // 3. Invertimos la dirección al llegar a los límites
            if (p.pos.y > 3.5) {
                p.pos.y = 3.5;
                p.direction = -1; // Cambia a bajar
            }
            if (p.pos.y < 2) {
                p.pos.y = 2;
                p.direction = 1; // Cambia a subir
            }

            dummy.position.copy(p.pos);
            dummy.quaternion.copy(state.camera.quaternion);
            dummy.rotateZ(p.rot);
            dummy.scale.set(8, 8, 1);
            dummy.updateMatrix();

            meshRef.current!.setMatrixAt(i, dummy.matrix);
        });

        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
            <planeGeometry args={[1, 1]} />
            <meshLambertMaterial
                map={smokeTexture}
                transparent
                opacity={0.5}
                emissive="#222222"
                depthWrite={false}
            />
        </instancedMesh>
    );
}


function Scene({ isDriving, darkMode, firstAnimation, isInsideCar }: { isDriving: boolean, darkMode: boolean, firstAnimation: boolean, isInsideCar: boolean }) {
    const { scene } = useGLTF('/assets/models/gltf/SuvCar.glb');
    const { camera } = useThree();
    const textures = useTexture(matcapTextures);
    const floorRef = useRef<THREE.Mesh>(null);
    const timeline = useRef<gsap.core.Timeline | null>(null);
    const [firstAnimationFinished, setFirstAnimationFinished] = useState(false);
    const seatRef = useRef<THREE.Object3D>(null);
    const controlsRef = useRef<CameraControls>(null);

    useEffect(() => {
        if (!controlsRef.current || !firstAnimationFinished) return;

        if (isInsideCar && seatRef.current) {
            const worldPos = new THREE.Vector3();
            seatRef.current.getWorldPosition(worldPos);

            // Posicionar la cámara en el asiento y mirar hacia adelante
            controlsRef.current.setLookAt(
                worldPos.x, worldPos.y + 0.3, worldPos.z,
                worldPos.x, worldPos.y + 0.3, worldPos.z + 0.1,
                true
            );
        } else if (firstAnimationFinished) {
            // Volver a la vista exterior
            controlsRef.current.setLookAt(5, 2, 1, 0, 1, 0, true);
        }
    }, [isInsideCar, firstAnimationFinished]);

    // Camera intro animation
    useEffect(() => {
        if (controlsRef.current) {
            controlsRef.current.setLookAt(0, 1, 7, 0, 1, 0, false);
            const proxy = { x: 0, y: 1, z: 7, tx: 0, ty: 1, tz: 0 };
            gsap.to(proxy, {
                z: 6,
                duration: 4.0,
                ease: "power3.out",
                delay: 0.2,
                onUpdate: () => {
                    controlsRef.current?.setLookAt(proxy.x, proxy.y, proxy.z, proxy.tx, proxy.ty, proxy.tz, false);
                }
            });
        }
    }, [camera]);

    // First Animation: Put Camera one Side of Car
    useEffect(() => {
        if (firstAnimation && controlsRef.current) {
            const proxy = { x: 0, y: 1, z: 6, tx: 0, ty: 1, tz: 0 };
            gsap.to(proxy, {
                x: 5,
                y: 2,
                z: 1,
                duration: 2,
                ease: "power3.out",
                delay: 0.5,
                onUpdate: () => {
                    controlsRef.current?.setLookAt(proxy.x, proxy.y, proxy.z, proxy.tx, proxy.ty, proxy.tz, false);
                },
                onComplete: () => {
                    setFirstAnimationFinished(true);
                }
            });
        }
    }, [firstAnimation]);

    // Refs for animation
    const wheelsRef = useRef<THREE.Object3D[]>([]);
    const speedRef = useRef(0);
    const carGroupRef = useRef<THREE.Group>(null);

    const textureConcrete = textures.concrete;
    textureConcrete.wrapS = THREE.RepeatWrapping;
    textureConcrete.wrapT = THREE.RepeatWrapping;
    textureConcrete.repeat.set(30, 30);

    const floorBasicMaterial = useMemo(() => new THREE.MeshBasicMaterial({
        map: textureConcrete,
        color: '#e1f6f3',
    }), [textureConcrete]);

    const seatMaterial = useMemo(() => new THREE.MeshMatcapMaterial({
        matcap: textures.plasticBlack,
    }), [textures.plasticBlack]);

    const leatherGreyMaterial = useMemo(() => new THREE.MeshMatcapMaterial({
        matcap: textures.leatherGray,
    }), [textures.leatherGray]);

    const glassRedMaterial = useMemo(() => new THREE.MeshMatcapMaterial({
        matcap: textures.mateGray,
        transparent: true,
        opacity: 0.2,
    }), [textures.mateGray]);

    const reflectBumpGMaterial = new THREE.MeshMatcapMaterial({
        matcap: textures.mateGray,
        transparent: true,
        opacity: 0.5,
    })

    const redIllumMaterial = new THREE.MeshMatcapMaterial({
        matcap: textures.mateGray,
        transparent: true,
        opacity: 0.5,
    })

    const glassBumpMaterial = new THREE.MeshMatcapMaterial({
        matcap: textures.mateGray,
        transparent: true,
        opacity: 0.5,
    })

    const chromeBumpMaterial = new THREE.MeshMatcapMaterial({
        matcap: textures.mateGray,
        transparent: true,
        opacity: 0.5,
    })

    const redIllumBMaterial = new THREE.MeshMatcapMaterial({
        matcap: textures.mateGray,
        transparent: true,
        opacity: 0.5,
    })

    const intDMaterial = new THREE.MeshMatcapMaterial({
        matcap: textures.mateGray,
        transparent: true,
        opacity: 0.5,
    })

    const plateMaterial = new THREE.MeshMatcapMaterial({
        matcap: textures.mateGray,
        transparent: true,
        opacity: 0.5,
    })

    const material22Material = new THREE.MeshMatcapMaterial({
        matcap: textures.mateGray,
        transparent: true,
        opacity: 0.5,
    })

    const metalRoughMaterial = new THREE.MeshMatcapMaterial({
        matcap: textures.mateGray,
    })

    const metalRoughDarkMaterial = new THREE.MeshMatcapMaterial({
        matcap: textures.mateGray,
    })

    const metalBrushCirularMaterial = new THREE.MeshMatcapMaterial({
        matcap: textures.mateGray,
    })

    const metalRoughPlusMaterial = new THREE.MeshMatcapMaterial({
        matcap: textures.mateGray,
    })

    const carBodyMaterial = useMemo(() => new THREE.MeshMatcapMaterial({
        matcap: textures.emerald,
        color: '#808ceb',
    }), [textures.emerald]);

    const metalBlackMaterial = useMemo(() => new THREE.MeshMatcapMaterial({
        matcap: textures.plasticBlack,
    }), [textures.plasticBlack]);

    const chromeMaterial = useMemo(() => new THREE.MeshMatcapMaterial({
        matcap: textures.rubberBlack,
        color: '#d5d5d8',
    }), [textures.rubberBlack]);

    const tireRubberMaterial = useMemo(() => new THREE.MeshMatcapMaterial({
        matcap: textures.mateGray,
        color: '#383737',
    }), [textures.mateGray]);

    const carGlassMaterial = useMemo(() => new THREE.MeshMatcapMaterial({
        matcap: textures.mateGray,
        transparent: true,
        opacity: 0.2,
    }), [textures.mateGray]);

    const blackMaterial = useMemo(() => new THREE.MeshBasicMaterial({ color: 'black' }), []);

    const lightEmmisiveMaterial = useMemo(() => new THREE.MeshLambertMaterial({ emissive: '#ffffff', emissiveIntensity: 0.0 }), []);

    //Animate LightEmissiveMaterial on the dark mode, when it is dark the light should be white and when it is light the light should be black.
    useEffect(() => {
        gsap.to(lightEmmisiveMaterial, {
            emissiveIntensity: darkMode ? 1.0 : 0.0,
            duration: 2.0,
            ease: "power2.inOut",
            delay: 1,
        });
    }, [darkMode]);


    // GSAP animation for speed transition
    useEffect(() => {
        gsap.to(speedRef, {
            current: isDriving ? 1 : 0,
            duration: 2,
            ease: "power2.inOut"
        });
    }, [isDriving]);

    useEffect(() => {
        if (!controlsRef.current) return;

        if (timeline.current) {
            timeline.current.kill();
            timeline.current = null;
        }

        if (!isDriving || isInsideCar) {
            if (firstAnimationFinished && !isInsideCar) {
                controlsRef.current.setLookAt(5, 2, 1, 0, 1, 0, true);
            }
            return;
        }

        const proxy = {
            x: 5,
            y: 2,
            z: 1,
            tx: 0,
            ty: 1,
            tz: 0
        };

        timeline.current = gsap.timeline({
            repeat: -1,
            yoyo: true,
            onUpdate: () => {
                controlsRef.current?.setLookAt(proxy.x, proxy.y, proxy.z, proxy.tx, proxy.ty, proxy.tz, false);
            }
        });

        timeline.current.to(proxy, {
            x: -2,
            y: 1.25,
            z: 4.73,
            tx: 0,
            ty: 0,
            tz: 0,
            duration: 3,
            ease: "power3.inOut",
            onComplete: () => {
                console.log("Complete t1");
            }
        }, 't1');

        timeline.current.to(proxy, {
            x: -5,
            y: 1.1,
            z: 1.4,
            tx: 0,
            ty: 0,
            tz: 0,
            duration: 2,
            ease: "power3.inOut",
            onComplete: () => {
                console.log("Complete t2");
            }
        }, 't2');

        timeline.current.to(proxy, {
            x: -1.97,
            y: 1.31,
            z: -4.74,
            tx: 0,
            ty: 0,
            tz: 0,
            duration: 2,
            ease: "power3.inOut",
            onComplete: () => {
                console.log("Complete t3");
            }
        }, 't3');

        timeline.current.to(proxy, {
            x: 0,
            y: 4.9,
            z: 4.8,
            tx: 0,
            ty: 0,
            tz: 0,
            duration: 2,
            ease: "power3.inOut",
            onComplete: () => {
                console.log("Complete t4");
            }
        }, 't4');


        timeline.current.to(proxy, {
            x: 2.28,
            y: 0.83,
            z: 3.9,
            tx: 0,
            ty: 0,
            tz: 0,
            duration: 2,
            ease: "power3.inOut",
            onComplete: () => {
                console.log("Complete t5");
            }
        }, 't5');

        timeline.current.to(proxy, {
            x: 1.66,
            y: 1.57,
            z: -3.89,
            tx: 0,
            ty: 0,
            tz: 0,
            duration: 2,
            ease: "power3.inOut",
            onComplete: () => {
                console.log("Complete t6");
            }
        }, 't6');

        timeline.current.to(proxy, {
            x: 5.56,
            y: 4.52,
            z: 4.18,
            tx: 0,
            ty: 0,
            tz: 0,
            duration: 2,
            ease: "power3.inOut",
            onComplete: () => {
                console.log("Complete t7");
            }
        }, 't7');

        return () => {
            timeline.current?.kill();
            timeline.current = null;
        }
    }, [isDriving, isInsideCar, firstAnimationFinished]);

    useEffect(() => {
        if (floorRef.current) {
            if (darkMode) {
                floorRef.current.visible = false;
            } else {
                floorRef.current.visible = true;
            }
        }
        if (carGroupRef.current) {
            carGroupRef.current.traverse((child) => {
                if (child.name.includes('SeatAxis')) {
                    seatRef.current = child;
                }
                if ((child as THREE.Mesh).isMesh) {
                    const mesh = child as THREE.Mesh;
                    mesh.castShadow = false;
                    mesh.receiveShadow = false;
                    mesh.frustumCulled = true;

                    if (mesh.name === 'Plane') {
                        mesh.position.y = -0.1;
                        floorRef.current = mesh;
                        mesh.material = floorBasicMaterial;
                        mesh.visible = !darkMode;
                    } else {

                        // If darkMode is active, use the black silhouette material
                        if (darkMode) {
                            if (mesh.name.includes('carPaint_doors003_chrome_0') || mesh.name.includes('carPaint_doors035_glass_clear_0')) {
                                mesh.material = lightEmmisiveMaterial;
                            } else if (mesh.name.includes('carPaint_doors010_glass_clear_0')) {
                                mesh.visible = false;
                            } else if (mesh.name.includes('_leather_grey')) {
                                return;
                            } else if (mesh.name.includes('_seats_0')) {
                                return;
                            } else if (mesh.name.includes('_plastic_rough_black_0')) {
                                return;
                            } else if (mesh.name.includes('_plastic_rough_black_plus_0')) {
                                return;
                            } else if (mesh.name.includes('_intD_0')) {
                                return;
                            } else {
                                mesh.material = blackMaterial;
                            }
                            return;
                        }

                        // Original material assignment logic
                        const matName = (mesh.material as THREE.MeshStandardMaterial).name;
                        if (mesh.name.includes('body_carpaint_metalic_green')) {
                            mesh.material = carBodyMaterial;
                        }
                        else if (mesh.name.includes('_plastic_shiny_black_0')) {
                            mesh.material = metalBlackMaterial;
                        }
                        else if (mesh.name.includes('_chromerough_0')) {
                            mesh.material = chromeMaterial;
                        }
                        else if (mesh.name.includes('wheelBkL_tire_0') || mesh.name.includes('wheelFtL_tire_0') || mesh.name.includes('wheelFtR_tire_0') || mesh.name.includes('wheelBkR_tire_0')) {
                            mesh.material = tireRubberMaterial;
                        }
                        else if (mesh.name.includes('_glass_clear_0')) {
                            mesh.material = carGlassMaterial;
                            mesh.visible = true;
                        }
                        else if (mesh.name.includes('_seats_0')) {
                            //mesh.material = seatMaterial;
                        }
                        else if (mesh.name.includes('_leather_grey')) {
                            //mesh.material = seatMaterial;
                        }
                        else if (mesh.name.includes('_glass_red_0')) {
                            mesh.material = glassRedMaterial;
                        }
                        else if (mesh.name.includes('_reflectBumpG_0')) {
                            mesh.material = reflectBumpGMaterial;
                        }
                        else if (mesh.name.includes('_glass_red_bumpB_0')) {
                            mesh.material = glassRedMaterial;
                        }
                        else if (mesh.name.includes('_red_illum_0')) {
                            mesh.material = redIllumMaterial;
                        }
                        else if (mesh.name.includes('_glass_bumpL_0')) {
                            mesh.material = glassBumpMaterial;
                        }
                        else if (mesh.name.includes('_glass_bumpG_0')) {
                            mesh.material = glassBumpMaterial;
                        }
                        else if (mesh.name.includes('_chromeBumpA_0')) {
                            mesh.material = chromeBumpMaterial;
                        }
                        else if (mesh.name.includes('_red_illumB_0')) {
                            mesh.material = redIllumBMaterial;
                        }
                        else if (mesh.name.includes('_intD_0')) {
                            //mesh.material = intDMaterial;
                        }
                        else if (mesh.name.includes('_plate_0')) {
                            mesh.material = plateMaterial;
                        }
                        else if (mesh.name.includes('_led_0')) {
                            mesh.material = material22Material;
                        }
                        else if (mesh.name.includes('_metal_rough_0') || mesh.name.includes('wheelFtL001')) {
                            mesh.material = metalRoughMaterial;
                        }
                        else if (mesh.name.includes('_metal_rough_dark_0') || mesh.name.includes('wheelFtL002')) {
                            mesh.material = metalRoughDarkMaterial;
                        }
                        else if (mesh.name.includes('_metal_brush_cirular_0') || mesh.name.includes('wheelFtL004')) {
                            mesh.material = metalBrushCirularMaterial;
                        }
                        else if (mesh.name.includes('_metal_rough_plus_0') || mesh.name.includes('wheelFtL006')) {
                            mesh.material = metalRoughPlusMaterial;
                        } else if (mesh.name.includes('_chrome_0') || mesh.name.includes('wheelFtL003')) {
                            mesh.material = chromeMaterial;
                        } else if (mesh.name.includes('_plastic_rough_black_0') || mesh.name.includes('wheelFtL007')) {
                            //mesh.material = metalBlackMaterial;
                        } else if (mesh.name.includes('_plastic_rough_black_plus_0')) {
                            // mesh.material = metalBlackMaterial;
                        } else if (mesh.name.includes('_metal_black_0') || mesh.name.includes('wheelFtL005')) {
                            mesh.material = metalRoughDarkMaterial;
                        } else if (mesh.name.includes('_glass_bumpA_0')) {
                            mesh.material = glassBumpMaterial;
                        }
                    }
                }
            })
        }
    }, [darkMode]);

    useMemo(() => {
        wheelsRef.current = []; // Clear refs on re-memo
        scene.traverse((child) => {
            if (child.name === 'wheelFTL' || child.name === 'wheelBkL' || child.name === 'wheelBkR' || child.name === 'wheelFtR') {
                wheelsRef.current.push(child);
            }
            if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;
                mesh.castShadow = false;
                mesh.receiveShadow = false;
                mesh.frustumCulled = true;
            }
        })
    }, [scene, darkMode]);

    useFrame((state, delta) => {
        const speed = speedRef.current;

        // 1. Animate Floor Texture (The most performant "infinite" loop)
        if (textureConcrete) {
            // Adjust offset to simulate movement. 
            // Negative increment moves the texture "backwards", creating forward illusion.
            textureConcrete.offset.y += speed * delta * 5;
        }

        // 2. Rotate Wheels
        wheelsRef.current.forEach((wheel) => {
            // Rotation speed based on linear speed
            wheel.rotation.x += speed * delta * 15;
        });

        // 3. Subtle car vibration/bounce
        if (carGroupRef.current) {
            if (isDriving) {
                carGroupRef.current.position.y = Math.sin(state.clock.elapsedTime * 20) * 0.001;
                carGroupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 15) * 0.0005;
            } else {
                carGroupRef.current.position.y = THREE.MathUtils.lerp(carGroupRef.current.position.y, 0, 0.1);
                carGroupRef.current.rotation.x = THREE.MathUtils.lerp(carGroupRef.current.rotation.x, 0, 0.1);
            }
        }
    });

    // Detect When user press space key
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key === ' ') {
                console.log(camera.position.x, camera.position.y, camera.position.z)
            }
            if (e.key === 'c') {
                camera.position.set(0.343, 1.15, -0.88);
                camera.lookAt(0, 0, 0);
            }
        };
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, []);

    return (
        <>
            {darkMode && <Smoke />}
            <group ref={carGroupRef}>
                <primitive object={scene} />
            </group>
            {/* <Stats /> */}
            <fog attach="fog" args={['#e1f6f3ff', 5, 15]} />
            {isInsideCar && <pointLight position={[0, 0, 0]} intensity={2} />}
            {isInsideCar && <pointLight position={[0, 1.5, 0]} intensity={1} />}
            <ContactShadows
                position={[0, 0, 0]}
                opacity={0.6}
                scale={6}
                blur={2}
                far={4}
            />
            <CameraControls
                ref={controlsRef}
                makeDefault
                minDistance={isInsideCar ? 0.001 : 3}
                maxDistance={isInsideCar ? 0.001 : 7}
                minAzimuthAngle={-Infinity}
                maxAzimuthAngle={Infinity}
                minPolarAngle={0}
                maxPolarAngle={isInsideCar ? Math.PI : Math.PI / 2}
            />
        </>
    )
}

// ─── Loading Screen ───────────────────────────────────────────────────────────

function Loader() {
    const { active, progress } = useProgress();
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        if (!active && progress === 100) {
            const timer = setTimeout(() => setVisible(true), 800);
            return () => clearTimeout(timer);
        }
    }, [active, progress]);

    if (!visible) return null;

    return (
        <div id="loader" style={{
            position: 'fixed',
            inset: 0,
            background: '#050505',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            transition: 'opacity 0.8s ease-in-out',
            opacity: active ? 1 : 0,
            pointerEvents: active ? 'all' : 'none',
            fontFamily: '"Outfit", sans-serif'
        }}>
            <div style={{
                position: 'absolute',
                bottom: '100px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}>
                <p style={{
                    color: 'white',
                    fontSize: '1rem',
                    fontWeight: 900,
                    margin: 0,
                    letterSpacing: '4px',
                    fontStyle: 'italic'
                }}>
                    {Math.round(progress)}<span style={{ color: '#ffffffff', fontSize: '1rem', verticalAlign: 'top', fontStyle: 'normal' }}>%</span>
                </p>

                <div style={{
                    width: '300px',
                    height: '2px',
                    background: 'rgba(255,255,255,0.05)',
                    marginTop: '10px',
                    overflow: 'hidden',
                    borderRadius: '10px'
                }}>
                    <div style={{
                        width: `${progress}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #808ceb, #ff4757)',
                        transition: 'width 0.4s cubic-bezier(0.1, 0, 0, 1)'
                    }} />
                </div>

                <p style={{
                    color: 'rgba(255,255,255,0.3)',
                    fontSize: '0.7rem',
                    textTransform: 'uppercase',
                    letterSpacing: '4px',
                    marginTop: '20px',
                    fontWeight: 'bold'
                }}>
                    Engineering Excellence
                </p>
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SuvCar() {
    const [isDriving, setIsDriving] = useState(false);
    const [darkMode, setDarkMode] = useState(true);
    const [firstAnimation, setFirstAnimation] = useState(false);
    const [showUi, setShowUi] = useState(false);
    const engineSound = useRef<HTMLAudioElement | null>(null);
    const backgroundSound = useRef<HTMLAudioElement | null>(null);
    const [isInsideCar, setInsideCar] = useState(false);

    useEffect(() => {
        engineSound.current = new Audio('/assets/sounds/start-engine.mp3');
        backgroundSound.current = new Audio('/assets/music/Leather_Wheel.mp3');
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDarkMode(false);
            setFirstAnimation(true);
            setShowUi(true);
        }, 6000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div style={{
            width: '100vw',
            height: '100vh',
            background: darkMode ? '#000' : '#fff',
            overflow: 'hidden',
            position: 'relative',
            fontFamily: '"Outfit", sans-serif'
        }}>

            <Loader />

            {/* UI Overlay */}
            {showUi && <div style={{
                position: 'absolute',
                top: '40px',
                left: '40px',
                zIndex: 10,
                color: '#2d3436'
            }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 900, margin: 0, letterSpacing: '-2px' }}>
                    SUV <span style={{ color: '#808ceb' }}>EXPERIENCE</span>
                </h1>
                <p style={{ opacity: 0.6, fontSize: '0.8rem', textTransform: 'uppercase' }}>
                    Interactive 3D Automotive Showcase
                </p>
            </div>}

            {/* Controls Button */}
            {showUi && <button
                onClick={() => {
                    if (!isDriving && engineSound.current && backgroundSound.current) {
                        engineSound.current.currentTime = 0;
                        engineSound.current.volume = 0.5;
                        engineSound.current.play().catch(e => console.error("Sound play failed", e));

                        backgroundSound.current.currentTime = 0;
                        backgroundSound.current.volume = 0.5;
                        backgroundSound.current.play().catch(e => console.error("Sound play failed", e));
                        backgroundSound.current.loop = true;
                    } else if (isDriving && backgroundSound.current) {
                        // Slow down audio progressive using gsap
                        gsap.to(backgroundSound.current, {
                            volume: 0,
                            duration: 1,
                            ease: "power3.out",
                            onComplete: () => {
                                backgroundSound.current!.pause();
                                backgroundSound.current!.currentTime = 0;
                            }
                        });
                    }
                    setIsDriving(!isDriving);
                }}
                style={{
                    position: 'absolute',
                    bottom: '60px',
                    right: '0px',
                    textAlign: 'center',
                    lineHeight: '1.1',
                    transform: 'translateX(-50%)',
                    zIndex: 20,
                    padding: '0',
                    borderRadius: '100%',
                    border: '1px solid rgba(255,255,255,0.15)',
                    background: isDriving
                        ? 'radial-gradient(circle at center, #ff4757 0%, #c0392b 100%)'
                        : 'radial-gradient(circle at center, #5d5d5f 0%, #1e1e20 100%)',
                    color: '#fff',
                    fontSize: '1rem',
                    fontWeight: '900',
                    cursor: 'pointer',
                    boxShadow: isDriving
                        ? '0 0 30px rgba(255, 71, 87, 0.4), inset 0 2px 4px rgba(255,255,255,0.3), inset 0 -6px 12px rgba(0,0,0,0.5)'
                        : '0 20px 40px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.1), inset 0 -6px 12px rgba(0,0,0,0.7)',
                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    display: 'flex',
                    alignItems: 'center',
                    width: '120px',
                    height: '120px',
                    gap: '12px',
                    flexDirection: 'column',
                    justifyContent: 'center',
                }}
            >
                {isDriving ? <>STOP<br />ENGINE</> : <>START<br />ENGINE</>}
            </button>}

            {(showUi && !isDriving) && <button
                onClick={() => {
                    setInsideCar(!isInsideCar);
                }}
                style={{
                    position: 'absolute',
                    bottom: '60px',
                    right: '150px',
                    textAlign: 'center',
                    lineHeight: '1.1',
                    transform: 'translateX(-50%)',
                    zIndex: 20,
                    padding: '0',
                    borderRadius: '100%',
                    border: '1px solid rgba(255,255,255,0.15)',
                    background: isInsideCar
                        ? 'radial-gradient(circle at center, #ff4757 0%, #c0392b 100%)'
                        : 'radial-gradient(circle at center, #5d5d5f 0%, #1e1e20 100%)',
                    color: '#fff',
                    fontSize: '0.7rem',
                    fontWeight: '900',
                    cursor: 'pointer',
                    boxShadow: isInsideCar
                        ? '0 0 20px rgba(255, 71, 87, 0.3), inset 0 2px 4px rgba(255,255,255,0.3), inset 0 -4px 8px rgba(0,0,0,0.5)'
                        : '0 20px 40px rgba(0,0,0,0.2), inset 0 2px 4px rgba(255,255,255,0.1), inset 0 -4px 8px rgba(0,0,0,0.6)',
                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    display: 'flex',
                    alignItems: 'center',
                    width: '80px',
                    height: '80px',
                    gap: '12px',
                    flexDirection: 'column',
                    justifyContent: 'center',
                }}
            >
                {isInsideCar ? <>OUTSIDE<br />CAR</> : <>INSIDE<br />CAR</>}
            </button>}

            <style>{`
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.5); opacity: 0.5; }
                    100% { transform: scale(1); opacity: 1; }
                }
                button:hover {
                    transform: translateX(-50%) translateY(-5px) scale(1.05);
                    box-shadow: 0 30px 60px rgba(0,0,0,0.15);
                }
                button:active {
                    transform: translateX(-50%) translateY(0) scale(0.95);
                }
            `}</style>

            <Canvas
                camera={{ fov: 40, near: 0.01, far: 100, position: [0, 1, 7] }}
                gl={{ antialias: true }}
                style={{ position: 'absolute', inset: 0 }}
            >
                <Suspense fallback={null}>
                    <Scene isDriving={isDriving} darkMode={darkMode} firstAnimation={firstAnimation} isInsideCar={isInsideCar} />
                </Suspense>
            </Canvas>

        </div>
    )
}

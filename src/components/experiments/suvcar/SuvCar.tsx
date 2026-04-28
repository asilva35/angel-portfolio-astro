import { Suspense, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import {
    Environment,
    OrbitControls,
    Stats,
    useGLTF,
    ContactShadows,
    useTexture
} from '@react-three/drei'
import * as THREE from 'three'

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
};

import { CONCRETE_FRAGMENT_SHADER, CONCRETE_VERTEX_SHADER } from '@/components/shaders/ConcreteShader'
import { DOMO_VERTEX_SHADER, DOMO_FRAGMENT_SHADER } from '@/components/shaders/DomoShader'


function Scene() {
    const { scene } = useGLTF('/assets/models/gltf/SuvCar.glb');
    const textures = useTexture(matcapTextures);

    const wallsMaterial = new THREE.ShaderMaterial({
        vertexShader: DOMO_VERTEX_SHADER,
        fragmentShader: DOMO_FRAGMENT_SHADER,
        side: THREE.DoubleSide,
        fog: false,
    });

    const wallMatcapMaterial = useMemo(() => new THREE.MeshMatcapMaterial({
        matcap: textures.leatherBlack,
        side: THREE.BackSide,
        color: '#554c4c',
    }), [textures.leatherBlack]);

    const textureWall = textures.pavement;
    textureWall.wrapS = THREE.RepeatWrapping;
    textureWall.wrapT = THREE.RepeatWrapping;
    textureWall.repeat.set(180, 50);

    const wallBasicMaterial = useMemo(() => new THREE.MeshBasicMaterial({
        map: textureWall,
        side: THREE.BackSide,
        color: '#e1f6f3',
    }), [textureWall]);

    const floorMaterial = new THREE.ShaderMaterial({
        vertexShader: CONCRETE_VERTEX_SHADER,
        fragmentShader: CONCRETE_FRAGMENT_SHADER,
        fog: false,
    });

    const floorMatcapMaterial = useMemo(() => new THREE.MeshMatcapMaterial({
        matcap: textures.rubberBlack,
        //color: '#554c4c',
    }), [textures.rubberBlack]);

    const textureConcrete = textures.concrete;
    textureConcrete.wrapS = THREE.RepeatWrapping;
    textureConcrete.wrapT = THREE.RepeatWrapping;
    textureConcrete.repeat.set(30, 30);

    const floorBasicMaterial = useMemo(() => new THREE.MeshBasicMaterial({
        map: textureConcrete,
        color: '#e1f6f3',
    }), [textureConcrete]);

    const seatMaterial = new THREE.MeshMatcapMaterial({
        matcap: textures.leatherGray,
    })

    const leatherGreyMaterial = new THREE.MeshMatcapMaterial({
        matcap: textures.leatherGray,
    })

    const glassRedMaterial = new THREE.MeshMatcapMaterial({
        matcap: textures.mateGray,
        transparent: true,
        opacity: 0.5,
    })

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
        transparent: true,
        opacity: 0.5,
    })

    const metalRoughDarkMaterial = new THREE.MeshMatcapMaterial({
        matcap: textures.mateGray,
        transparent: true,
        opacity: 0.5,
    })

    const metalBrushCirularMaterial = new THREE.MeshMatcapMaterial({
        matcap: textures.mateGray,
        transparent: true,
        opacity: 0.5,
    })

    const metalRoughPlusMaterial = new THREE.MeshMatcapMaterial({
        matcap: textures.mateGray,
        transparent: true,
        opacity: 0.5,
    })

    const greenMaterial = useMemo(() => new THREE.MeshMatcapMaterial({
        matcap: textures.emerald,
        color: '#808ceb',
    }), [textures.emerald]);

    const metalBlackMaterial = new THREE.MeshMatcapMaterial({
        matcap: textures.plasticBlack,
    })

    const chromeMaterial = new THREE.MeshMatcapMaterial({
        matcap: textures.polishedMetal,
    })

    const tireRubberMaterial = new THREE.MeshMatcapMaterial({
        matcap: textures.rubberBlack,
    })

    const carGlassMaterial = new THREE.MeshMatcapMaterial({
        matcap: textures.mateGray,
        transparent: true,
        opacity: 0.5,
    })



    useMemo(() => {
        scene.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;
                mesh.castShadow = false;
                mesh.receiveShadow = false;
                mesh.frustumCulled = true;
                (mesh.material as THREE.MeshMatcapMaterial).needsUpdate = true;
                if (child.name == 'Torus') {
                    //mesh.material = wallMatcapMaterial;
                    //mesh.material = wallsMaterial;
                    mesh.material = wallBasicMaterial;
                    mesh.visible = false;
                }
                else if (child.name == 'Plane') {
                    mesh.position.y = -0.1;
                    //mesh.material = floorMatcapMaterial;
                    //mesh.material = floorMaterial;
                    mesh.material = floorBasicMaterial;
                    mesh.visible = true;
                } else {
                    mesh.visible = true;
                    if ((mesh.material as THREE.MeshStandardMaterial).name === 'carpaint_metalic_green') {
                        mesh.material = greenMaterial;
                    }
                    else if ((mesh.material as THREE.MeshStandardMaterial).name === 'plastic_shiny_black') {
                        mesh.material = metalBlackMaterial;
                    }
                    else if ((mesh.material as THREE.MeshStandardMaterial).name === 'chromerough') {
                        mesh.material = chromeMaterial;
                    }
                    else if ((mesh.material as THREE.MeshStandardMaterial).name === 'tire') {
                        mesh.material = tireRubberMaterial;
                    }
                    else if ((mesh.material as THREE.MeshStandardMaterial).name === 'glass_clear') {
                        mesh.material = carGlassMaterial;
                    }
                    else if ((mesh.material as THREE.MeshStandardMaterial).name === 'seats') {
                        mesh.material = seatMaterial;
                    }
                    else if ((mesh.material as THREE.MeshStandardMaterial).name === 'leather_grey') {
                        mesh.material = leatherGreyMaterial;
                    }
                    else if ((mesh.material as THREE.MeshStandardMaterial).name === 'glass_red') {
                        mesh.material = glassRedMaterial;
                    }
                    else if ((mesh.material as THREE.MeshStandardMaterial).name === 'reflectBumpG') {
                        mesh.material = reflectBumpGMaterial;
                    }
                    else if ((mesh.material as THREE.MeshStandardMaterial).name === 'glass_red_bumpB') {
                        mesh.material = glassRedMaterial;
                    }
                    else if ((mesh.material as THREE.MeshStandardMaterial).name === 'red_illum') {
                        mesh.material = redIllumMaterial;
                    }
                    else if ((mesh.material as THREE.MeshStandardMaterial).name === 'glass_bumpL') {
                        mesh.material = glassBumpMaterial;
                    }
                    else if ((mesh.material as THREE.MeshStandardMaterial).name === 'glass_bumpG') {
                        mesh.material = glassBumpMaterial;
                    }
                    else if ((mesh.material as THREE.MeshStandardMaterial).name === 'chromeBumpA') {
                        mesh.material = chromeBumpMaterial;
                    }
                    else if ((mesh.material as THREE.MeshStandardMaterial).name === 'red_illumB') {
                        mesh.material = redIllumBMaterial;
                    }
                    else if ((mesh.material as THREE.MeshStandardMaterial).name === 'intD') {
                        mesh.material = intDMaterial;
                    }
                    else if ((mesh.material as THREE.MeshStandardMaterial).name === 'plate') {
                        mesh.material = plateMaterial;
                    }
                    else if ((mesh.material as THREE.MeshStandardMaterial).name === 'material_22') {
                        mesh.material = material22Material;
                    }
                    else if ((mesh.material as THREE.MeshStandardMaterial).name === 'metal_rough') {
                        mesh.material = metalRoughMaterial;
                    }
                    else if ((mesh.material as THREE.MeshStandardMaterial).name === 'metal_rough_dark') {
                        mesh.material = metalRoughDarkMaterial;
                    }
                    else if ((mesh.material as THREE.MeshStandardMaterial).name === 'metal_brush_cirular') {
                        mesh.material = metalBrushCirularMaterial;
                    }
                    else if ((mesh.material as THREE.MeshStandardMaterial).name === 'metal_rough_plus') {
                        mesh.material = metalRoughPlusMaterial;
                    } else if ((mesh.material as THREE.MeshStandardMaterial).name === 'chrome') {
                        mesh.material = chromeMaterial;
                    } else if ((mesh.material as THREE.MeshStandardMaterial).name === 'plastic_rough_black') {
                        mesh.material = tireRubberMaterial;
                    } else if ((mesh.material as THREE.MeshStandardMaterial).name === 'plastic_rough_black_plus') {
                        mesh.material = tireRubberMaterial;
                    } else if ((mesh.material as THREE.MeshStandardMaterial).name === 'metal_black') {
                        mesh.material = metalRoughDarkMaterial;
                    } else if ((mesh.material as THREE.MeshStandardMaterial).name === 'glass_bumpA') {
                        mesh.material = glassBumpMaterial;
                    } else {
                        // mesh.visible = false;
                        //  console.log((mesh.material as THREE.MeshStandardMaterial).name);
                    }

                }
            }
        })
    }, [scene])
    return (
        <>
            <primitive object={scene} />
            <Stats />
            <fog attach="fog" args={['#e1f6f3ff', 5, 15]} />
            {/* <Environment background={false} preset="apartment" /> */}
            {/* <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 10]} intensity={2} /> */}
            <ContactShadows
                position={[0, 0, 0]}
                opacity={0.6}
                scale={6}
                blur={2}
                far={4}
            />

            <OrbitControls
                enableDamping
                dampingFactor={0.06}
                rotateSpeed={0.55}
                zoomSpeed={0.8}
                panSpeed={0.6}
                minDistance={2}
                maxDistance={16}
                maxPolarAngle={Math.PI / 2 - 0.05}
                target={[0, 0, 0]}
            />
        </>
    )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SuvCar() {

    return (
        <div style={{ width: '100vw', height: '100vh', background: '#ffffffff', overflow: 'hidden', position: 'relative' }}>

            <Canvas
                camera={{ fov: 40, near: 0.1, far: 100, position: [0, 3, 6] }}
                gl={{ antialias: true }}
                style={{ position: 'absolute', inset: 0 }}
            >
                <Suspense fallback={null}>
                    <Scene />
                </Suspense>
            </Canvas>

        </div>
    )
}

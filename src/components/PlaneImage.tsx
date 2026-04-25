import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitControls, useTexture, Center } from '@react-three/drei';

// Shader minimalista para renderizado puro
const vertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    // Proyección estándar sin deformación
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  varying vec2 vUv;
  uniform sampler2D uTexture;

  void main() {
    // Muestreo directo de la textura sin efectos
    vec4 color = texture2D(uTexture, vUv);
    gl_FragColor = color;
  }
`;

const CleanImagePlane = () => {
    const materialRef = useRef<THREE.ShaderMaterial>(null);

    // Cargamos la textura
    const texture = useTexture('/assets/images/7wwm.png');

    // Optimización de calidad de imagen
    useMemo(() => {
        if (texture) {
            // Mejora la nitidez en ángulos oblicuos
            texture.anisotropy = 16;
            // Filtrado lineal para evitar pixelación
            texture.minFilter = THREE.LinearMipmapLinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.needsUpdate = true;
        }
    }, [texture]);

    const uniforms = useMemo(
        () => ({
            uTexture: { value: texture },
        }),
        [texture]
    );

    return (
        <Center>
            <mesh>
                {/* Usamos pocos segmentos ya que no hay deformación, optimizando el rendimiento */}
                <planeGeometry args={[6, 4, 1, 1]} />
                <shaderMaterial
                    ref={materialRef}
                    vertexShader={vertexShader}
                    fragmentShader={fragmentShader}
                    uniforms={uniforms}
                    transparent={false}
                />
            </mesh>
        </Center>
    );
};

export default function App() {
    return (
        <div className="w-full h-screen bg-black">


            <Canvas
                // dpr={[1, 2]} asegura que se vea bien en pantallas Retina/High-res
                dpr={[1, 2]}
                camera={{ position: [0, 0, 5], fov: 45 }}
            >
                <color attach="background" args={['#000000']} />

                <Suspense fallback={null}>
                    <CleanImagePlane />
                </Suspense>

                <OrbitControls
                    enableZoom={true}
                    enablePan={true}
                    makeDefault
                />
            </Canvas>
        </div>
    );
}
export const CONCRETE_VERTEX_SHADER = `
#include <common>
#include <fog_pars_vertex>
varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;

void main() {
    vUv = uv;
    vPosition = position;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    #include <fog_vertex>
}
`;

export const CONCRETE_FRAGMENT_SHADER = `
#include <common>
#include <fog_pars_fragment>
varying vec2 vUv;

// ... (resto de funciones hash, noise, fbm)
float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (1.0 - 2.0 * f);
    return mix(mix(hash(i + vec2(0.0,0.0)), hash(i + vec2(1.0,0.0)), u.x),
               mix(hash(i + vec2(0.0,1.0)), hash(i + vec2(1.0,1.0)), u.x), u.y);
}

float fbm(vec2 p) {
    float f = 0.0;
    float amp = 0.5;
    mat2 rot = mat2(0.8, -0.6, 0.6, 0.8);
    for(int i = 0; i < 5; i++) {
        f += amp * noise(p);
        p = rot * p * 2.01;
        amp *= 0.5;
    }
    return f;
}

void main() {
    vec2 uv = vUv * 1000.0;
    float baseNoise = fbm(uv * 0.5);
    float detailNoise = fbm(uv * 2.5);
    float fineGrain = hash(uv * 50.0);
    float pores = noise(uv * 15.0);
    float poreMask = smoothstep(0.65, 0.85, pores);
    float cracks = abs(noise(uv * 4.0) - 0.5) * 2.0;
    float crackMask = smoothstep(0.05, 0.0, cracks) * 0.4;
    vec3 colorLight = vec3(0.95, 0.94, 0.93);
    vec3 colorDark = vec3(0.80, 0.79, 0.78);
    vec3 colorDetail = vec3(0.65, 0.64, 0.63);
    vec3 finalColor = mix(colorDark, colorLight, baseNoise + 0.1);
    finalColor = mix(finalColor, colorDark, detailNoise * 0.3);
    finalColor -= (1.0 - fineGrain) * 0.04;
    finalColor = mix(finalColor, colorDetail, poreMask * 0.3);
    finalColor = mix(finalColor, colorDetail, crackMask);
    float vignette = length(vUv - 0.5);
    finalColor -= vignette * 0.15;
    
    gl_FragColor = vec4(finalColor, 1.0);
    #include <fog_fragment>
}
`;

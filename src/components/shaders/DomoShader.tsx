export const DOMO_VERTEX_SHADER = `
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

export const DOMO_FRAGMENT_SHADER = `
#include <common>
#include <fog_pars_fragment>
varying vec2 vUv;

void main() {
    // Escalas de los patrones
    float dotScale = 200.0;   // Densidad de los puntos pequeños (micro cuadrícula)
    float gridScale = 20.0;   // Tamaño de los rombos/cuadrados principales
    
    // 1. Patrón principal (Macro)
    // Rotamos las coordenadas 45 grados (PI/4 = 0.785398) para obtener los rombos
    float angle = 0.785398; 
    mat2 rot = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
    vec2 rotatedUv = rot * (vUv - 0.5) * gridScale;
    
    // Usamos función coseno para generar áreas que definan el tamaño de los puntos
    float macroPattern = (cos(rotatedUv.x) * cos(rotatedUv.y)) * 0.5 + 0.5;
    
    // 2. Patrón de puntos (Micro)
    vec2 microUv = fract(vUv * dotScale);
    float dist = distance(microUv, vec2(0.5)); // Distancia al centro de cada celda
    
    // 3. Modulación del tamaño
    // El radio de cada punto varía dependiendo del patrón principal
    float radius = mix(0.05, 0.65, macroPattern);
    
    // Dibujamos el punto con bordes suaves para antialiasing
    float dot = smoothstep(radius, radius - 0.05, dist);
    
    // 4. Colores (similares a la imagen adjunta)
    float bg_color = 0.88;
    vec3 bgColor = vec3(bg_color, bg_color, bg_color); // Gris claro de fondo
    float dot_color = 0.91;
    vec3 dotColor = vec3(dot_color, dot_color, dot_color);   // Puntos blancos
    
    // Color final usando mezcla
    vec3 finalColor = mix(bgColor, dotColor, dot);
    
    gl_FragColor = vec4(finalColor, 1.0);
    #include <fog_fragment>
}
`;

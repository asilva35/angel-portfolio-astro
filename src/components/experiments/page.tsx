const EXPERIMENTS = [
    { path: '/experiments/stress-materials', name: 'Stress Analysis Beam', color: 'text-cyan-400 group-hover:text-cyan-300' },
    { path: '/experiments/configurator', name: 'Configurator', color: 'text-slate-400 group-hover:text-slate-300' },
    { path: '/experiments/metropolis', name: 'Metropolis', color: 'text-slate-400 group-hover:text-slate-300' },
    { path: '/experiments/glass', name: 'Glass', color: 'text-slate-400 group-hover:text-slate-300' },
    { path: '/experiments/nutritional-calculator', name: 'Nutritional Calculator', color: 'text-slate-400 group-hover:text-slate-300' },
    { path: '/experiments/face-configurator', name: 'Face Configurator', color: 'text-slate-400 group-hover:text-slate-300' },
    { path: '/experiments/floor-planner', name: 'Floor Planner', color: 'text-slate-400 group-hover:text-slate-300' },
    { path: '/experiments/solar-map', name: 'Solar Map', color: 'text-slate-400 group-hover:text-slate-300' },
    { path: '/experiments/math-visualizer', name: 'Math Visualizer', color: 'text-slate-400 group-hover:text-slate-300' },
    { path: '/experiments/vr-showcase', name: 'VR Photo Studio Tour', color: 'text-slate-400 group-hover:text-slate-300' },
    { path: '/experiments/sport-management', name: 'Sport Management System', color: 'text-emerald-400 group-hover:text-emerald-300' },
    { path: '/experiments/academic', name: 'Academic Page', color: 'text-emerald-400 group-hover:text-emerald-300' },
    { path: '/experiments/electric-bike', name: 'Electric Bike', color: 'text-emerald-400 group-hover:text-emerald-300' },
    { path: '/experiments/materials', name: 'Materials', color: 'text-emerald-400 group-hover:text-emerald-300' },
    { path: '/experiments/matcaplab', name: 'Matcap Lab', color: 'text-emerald-400 group-hover:text-emerald-300' },
    { path: '/experiments/matcapcomposer', name: 'Matcap Composer', color: 'text-emerald-400 group-hover:text-emerald-300' },
    { path: '/experiments/matcap-smartloader', name: 'Smart Loader', color: 'text-emerald-400 group-hover:text-emerald-300' },
    { path: '/experiments/real-estate-insights', name: 'Real Estate Dashboard', color: 'text-emerald-400 group-hover:text-emerald-300' },
    { path: '/experiments/art-gallery', name: 'Art Gallery 3D', color: 'text-amber-400 group-hover:text-amber-300' },
    { path: '/experiments/art-gallery-v2', name: 'Art Gallery 3D V2', color: 'text-amber-400 group-hover:text-amber-300' },
    { path: '/experiments/shaders', name: 'Shaders', color: 'text-pink-400 group-hover:text-pink-300' },
    { path: '/experiments/pre-calc-shaders', name: 'Pre Calc Shaders', color: 'text-pink-400 group-hover:text-pink-300' },
    { path: '/experiments/node-editor', name: 'Node Editor', color: 'text-pink-400 group-hover:text-pink-300' },
    { path: '/experiments/webgl-bake-experience', name: 'WebGL Bake Experience', color: 'text-pink-400 group-hover:text-pink-300' },
    { path: '/experiments/image-to-lines', name: 'Image to Lines', color: 'text-pink-400 group-hover:text-pink-300' },
    { path: '/experiments/interactive-plane', name: 'Interactive Plane', color: 'text-pink-400 group-hover:text-pink-300' },
    { path: '/experiments/svg-animation', name: 'SVG Animation', color: 'text-pink-400 group-hover:text-pink-300' },
    { path: '/experiments/suvcar', name: 'Suv Car', color: 'text-pink-400 group-hover:text-pink-300' },
]


export default function Experiments() {

    return (
        <main className={`relative min-h-screen bg-black text-[#BBBBBB] font-sans selection:bg-[#DDDDDD] selection:text-black h-[100dvh] overflow-auto`}>

            {/* Background Interactive Elements */}
            <div className="absolute inset-0 z-0">

            </div>

            {/* Navigation */}
            <header className="fixed top-0 left-0 w-full z-50 px-12 py-8 flex justify-between items-center text-[11px] uppercase tracking-[0.3em] font-medium">
                <nav className="flex w-full justify-between">
                    <a href="/" className="hover:text-white transition-colors duration-300" >Home</a>
                    <a href="mailto:sistev.contacto@gmail.com" className="hover:text-white transition-colors duration-300">Contact Me</a>
                    <a href="/experiments" className="hover:text-white transition-colors duration-300">Experiments</a>
                </nav>
            </header>

            {/* Content Container */}
            <div className="min-h-screen p-8 md:p-16 lg:p-24 text-white font-sans bg-[#0B0F19] selection:bg-cyan-500/30">
                <div className="max-w-7xl mx-auto">
                    <header className="mb-16">
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                            Experiments <span className="text-slate-500 font-light">Directory</span>
                        </h1>
                        <p className="text-slate-400 text-lg max-w-2xl">
                            A collection of interactive web experiences, 3D configurators, and architectural prototypes.
                        </p>
                    </header>

                    <nav className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {EXPERIMENTS.map((p, i) => (
                            <a
                                key={i}
                                href={p.path}
                                className="group relative flex flex-col justify-between p-6 bg-slate-800/30 hover:bg-slate-800/60 border border-slate-700/50 hover:border-slate-600 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20 overflow-hidden"
                            >
                                {/* Subtle gradient background on hover */}
                                <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/0 group-hover:from-white/[0.03] group-hover:to-transparent transition-colors duration-500 pointer-events-none" />

                                <div className="flex justify-between items-start mb-12">
                                    <span className="text-xs font-mono text-slate-500 group-hover:text-slate-400 transition-colors">
                                        /{i < 10 ? `0${i + 1}` : i + 1}
                                    </span>

                                    <svg
                                        className={`w-5 h-5 opacity-0 -translate-x-4 translate-y-4 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-300 ease-out ${p.color.split(' ')[0]}`}
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </div>

                                <div className={`text-lg font-medium transition-colors ${p.color}`}>
                                    {p.name}
                                </div>
                            </a>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Footer */}
            <footer className="absolute bottom-0 left-0 w-full z-50 px-12 py-10 flex justify-between items-end pointer-events-none">

            </footer>
        </main>
    );
}

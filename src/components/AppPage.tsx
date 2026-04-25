'use client';

import InteractivePlanes from "@/components/interactive-planes/InteractivePlanes";

import { ArrowDown, ArrowUp } from 'lucide-react';

import { useEffect, useState, useRef } from "react";
import { gsap } from 'gsap'
import * as THREE from 'three';





const PROJECTS = [
  {
    name: "7 Wonders of the World Museum",
    image: "/assets/images/7wwm.png",
    description: "A 3D interactive website for the 7 Wonders of the World Museum, showcasing each wonder with stunning visuals and animations.",
    link: "https://7wwmuseum.vercel.app/",
    tags: ["Next.js", "Three.js", "TypeScript"],
  },
  {
    name: "Kodama",
    image: "/assets/images/kodama.png",
    description: "A minigame created in JavaScript using the Threejs library. This game, inspired by the spiritual world of Studio Ghibli, allows you as a player to catch as many Kodama as possible before time runs out.",
    link: "https://esquared-studio.itch.io/kodama-catchers",
    tags: ["JavaScript", "Three.js", "Blender"],
  },
  {
    name: "GTA JS Game",
    image: "/assets/images/gta4.png",
    description: "A 3D interactive website for the GTA Js Game. The game is developed in JavaScript and uses the Threejs library. I've always been a fan of GTA games, and making this project was a fascinating experience.",
    link: "https://esquared-studio.itch.io/js-theft-auto",
    tags: ["JavaScript", "Three.js", "Blender"],
  },
  {
    name: "3D shelf configurator",
    image: "/assets/images/3D-shelf-configurator.png",
    description: "3D configurator of shelves made with React and Threejs. The user can configure the shelves to their liking and see the result in 3D.",
    link: "https://experiments-pi-three.vercel.app/configurator",
    tags: ["React", "Three.js", "Gsap"],
  },
  {
    name: "Art Gallery",
    image: "/assets/images/art-gallery.png",
    description: "Art gallery made with React and Threejs. The user can browse the gallery and see the art in 3D.",
    link: "https://experiments-pi-three.vercel.app/art-gallery-v2",
    tags: ["React", "Three.js", "Gsap"],
  },
  {
    name: "Floor Planner",
    image: "/assets/images/floor-planner.png",
    description: "Floor planner made with React and Threejs. The user can plan their floor and see the result in 3D.",
    link: "https://experiments-pi-three.vercel.app/floor-planner",
    tags: ["React", "Three.js", "Gsap"],
  },
  {
    name: "Landing Page of Insighty AI Company",
    image: "/assets/images/insighty-ai.png",
    description: "Landing page for Insighty AI Company. The user can learn about the company and its products.",
    link: "https://www.insightyai.com/en",
    tags: ["Next.js", "TypeScript", "Tailwind CSS"],
  },
  {
    name: "Growth AI Landing Page",
    image: "/assets/images/growth-ai.png",
    description: "Landing page for Growth AI Company. The user can learn about the company and its products.",
    link: "https://growthpulse-ai-one.vercel.app/",
    tags: ["Next.js", "TypeScript", "Tailwind CSS"],
  },
  {
    name: "VR Photo Studio",
    image: "/assets/images/vr-photo-studio.png",
    description: "VR photo studio made with React and Threejs. The user can explore a virtual photo studio.",
    link: "https://experiments-pi-three.vercel.app/vr-photostudio-tour",
    tags: ["React", "Three.js", "Gsap"],
  },
  {
    name: "AR Glasses",
    image: "/assets/images/face-glasses.png",
    description: "AR glasses made with React and Threejs. The user can wear the glasses and see the world in 3D.",
    link: "https://experiments-pi-three.vercel.app/face-configurator",
    tags: ["React", "Three.js", "Gsap"],
  },
]

const SKILLS = [
  "Next.js", "Three.js", "TypeScript", "React", "HTML5/CSS3", "JavaScript",
  "Figma", "Tailwind CSS", "Blender", "N8N", "Git", "Docker", "AWS",
  "Google Cloud", "Firebase", "MongoDB", "PostgreSQL", "MySQL", "SQLite", "GSAP",
  "Framer Motion", "Shadcn UI", "Vercel", "Netlify", "Supabase", "Astro", "Wordpress",
  "Google Analitycs", "Google Search Console", "Google Ads"
];

const Preloader = ({ progress, complete }: { progress: number, complete: boolean }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (complete) {
      const tl = gsap.timeline();
      tl.to(textRef.current, {
        y: -100,
        opacity: 0,
        duration: 0.8,
        ease: "power4.in"
      })
        .to(containerRef.current, {
          y: "-100%",
          duration: 1,
          ease: "power4.inOut"
        }, "-=0.4");
    }
  }, [complete]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center pointer-events-auto"
    >
      <div className="overflow-hidden mb-4">
        <h2
          ref={textRef}
          className={`font-sans text-4xl lg:text-7xl text-white tracking-widest uppercase`}
        >
          Angel's Portfolio
        </h2>
      </div>

      <div className="w-64 h-[1px] bg-white/10 relative overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full bg-white transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-4 text-[10px] uppercase tracking-[0.4em] text-white/40">
        {progress}% Loading Experience
      </div>
    </div>
  );
};

export default function Home() {
  const skils_random = SKILLS;
  const [showingProjects, setShowingProjects] = useState(false);
  const [currentPlane, setCurrentPlane] = useState(0);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [loadComplete, setLoadComplete] = useState(false);
  const triggerShowHero = () => {
    setShowingProjects(false);
    gsap.to('#hero-section', {
      opacity: 1,
      pointerEvents: 'auto',
      alpha: 1,
      duration: 1,
      ease: 'power3.out',
    })
  }
  const triggerShowProjects = () => {
    setShowingProjects(true);
    // HERO SECTION HIDE AND POINTER EVENTS NONE
    gsap.to('#hero-section', {
      opacity: 0,
      pointerEvents: 'none',
      alpha: 0,
      duration: 1,
      ease: 'power3.out',
    })
  }
  useEffect(() => {
    // Configurar el manager de carga de Three.js
    THREE.DefaultLoadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
      const p = Math.round((itemsLoaded / itemsTotal) * 100);
      setProgress(p);
    };

    THREE.DefaultLoadingManager.onLoad = () => {
      setTimeout(() => {
        setLoadComplete(true);
        setTimeout(() => setLoading(false), 1500); // Dar tiempo a la animación de salida
      }, 1000);
    };

    // Caso de seguridad: si no hay assets 3D o tardan demasiado
    const timer = setTimeout(() => {
      if (progress < 100) {
        setProgress(100);
        setLoadComplete(true);
        setTimeout(() => setLoading(false), 1500);
      }
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {

    const handleWheel = (e: WheelEvent) => {
      if (showingProjects) return
      triggerShowProjects();
    }

    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (showingProjects) return;
      const touchCurrentY = e.touches[0].clientY;
      const delta = touchStartY - touchCurrentY;

      // Si hay un desplazamiento mínimo (drag), iniciamos
      if (Math.abs(delta) > 10) {
        triggerShowProjects();
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true })
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: true })

    return () => {
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
    }
  }, [showingProjects]);
  return (
    <main className={`relative min-h-screen bg-black text-[#BBBBBB] font-sans selection:bg-[#DDDDDD] selection:text-black`}>
      {loading && <Preloader progress={progress} complete={loadComplete} />}

      {/* Background Interactive Elements */}
      <div className="absolute inset-0 z-0">
        <InteractivePlanes begin={showingProjects} projects={PROJECTS} onChangeIndex={(index) => setCurrentPlane(index)} />
      </div>

      {/* Navigation */}
      <header className="fixed top-0 left-0 w-full z-50 px-12 py-8 flex justify-between items-center text-[11px] uppercase tracking-[0.3em] font-medium">
        <nav className="flex w-full justify-between">
          <a href="#projects" className="hover:text-white transition-colors duration-300" onClick={() => showingProjects ? triggerShowHero() : triggerShowProjects()}>{showingProjects ? 'Home' : 'Projects'}</a>
          <a href="mailto:sistev.contacto@gmail.com" className="hover:text-white transition-colors duration-300">Contact Me</a>
          <a href="/experiments" className="hover:text-white transition-colors duration-300">Experiments</a>
        </nav>
      </header>

      {/* Content Container */}
      <div id="hero-section" className="relative z-10 grid grid-cols-1 lg:grid-cols-2 min-h-screen px-12 lg:px-24">
        {/* Left Column: Hero Text */}
        <div className="flex flex-col justify-center py-20 lg:py-0 max-w-xl">
          <div className="space-y-2 mb-4">
            <h2 className="text-[1.2rem] text-[#BBBBBB] font-medium uppercase tracking-widest">
              Welcome To
            </h2>
            <h1 className={`font-sans text-[4rem] lg:text-[5.5rem] leading-[0.9] text-[#CCCCCC] uppercase mb-8`}>
              MY PORTFOLIO
            </h1>
          </div>

          <p className="text-[15px] text-[#AAAAAA] leading-relaxed mb-10 max-w-md font-light">
            Hi, my name is Angel. I&apos;m a web developer passionate about creating stunning user web experiences. With 15 years of experience, I&apos;ve worked across many industries, learning valuable things about advertising, user interfaces, optimization, 3D design, and more. Join me to explore some of my latest projects.
          </p>

          <div className="flex items-center gap-8 mb-16">
            <a href="mailto:sistev.contacto@gmail.com" className="bg-[#DDDDDD] text-black px-8 py-3 rounded-full text-[12px] font-bold tracking-widest hover:bg-white transition-all duration-300 active:scale-95">
              CONTACT ME
            </a>
            <a href="mailto:sistev.contacto@gmail.com" className="text-[12px] font-medium tracking-widest border-b border-transparent hover:border-[#BBBBBB] transition-all duration-300">
              DOWNLOAD MY CV
            </a>
          </div>

          <div className="space-y-6">
            <style>{`
              @keyframes vertical-scroll {
                0% { transform: translateY(0); }
                100% { transform: translateY(-50%); }
              }
            `}</style>
            <h3 className="text-[12px] font-extrabold tracking-[0.2em] uppercase text-[#BBBBBB]">
              SKILLS:
            </h3>
            <div className="relative h-[100px] overflow-hidden mask-fade-y">
              <div
                className="flex flex-col will-change-transform"
                style={{
                  animation: 'vertical-scroll 25s linear infinite'
                }}
              >
                {[...skils_random, ...skils_random].map((skill, index) => (
                  <div
                    key={index}
                    className={`text-[10px] text-[#555555] uppercase tracking-[0.2em] font-medium transition-colors hover:text-white cursor-default py-2`}
                    // Padding Left From 8rem to 16rem
                    style={{
                      paddingLeft: index % 2 === 0 ? "8rem" : "16rem",
                    }}
                  >
                    {skill}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Reserved for the image/3D element */}
        <div id="image-container" className="hidden lg:flex items-center justify-center pointer-events-none">
          {/* The InteractivePlanes component is already rendered in the background, 
              but we can use this column to define the layout space if needed. */}
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-0 left-0 w-full z-50 px-12 py-10 flex justify-between items-end pointer-events-none">
        <div className="flex items-center gap-3 text-[11px] uppercase tracking-widest text-[#AAAAAA] pointer-events-auto">
          <img src="/assets/images/menu.svg" alt="Logo" width={20} height={20} />
          <span>{currentPlane + 1} / {PROJECTS.length} Projects</span>
        </div>

        <div className="flex flex-col items-center gap-2 text-[11px] uppercase tracking-widest text-[#AAAAAA] pointer-events-auto">
          <div className="flex gap-1">
            {(currentPlane === 0 || currentPlane < PROJECTS.length - 1) && <ArrowDown className="w-4 h-4 animate-bounce text-[#AAAAAA]" />}
            {(currentPlane === PROJECTS.length - 1 || currentPlane > 0) && <ArrowUp className="w-4 h-4 animate-bounce text-[#AAAAAA]" />}
          </div>
          <span>Scroll {currentPlane === 0 ? 'down' : currentPlane === PROJECTS.length - 1 ? 'up' : 'up / down'}</span>
        </div>
      </footer>
    </main>
  );
}

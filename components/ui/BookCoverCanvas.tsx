'use client';

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Headphones, FileText } from 'lucide-react';

/* ─────────────────────────────────────────────
   PARTICLE SYSTEM  (canvas-based, 60 fps)
───────────────────────────────────────────── */
function ParticleCanvas() {
    const ref = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = ref.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d')!;
        let raf: number;

        const resize = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        interface Particle {
            x: number; y: number;
            vx: number; vy: number;
            radius: number;
            opacity: number;
            decayRate: number;
        }

        const particles: Particle[] = [];

        const spawn = () => {
            const cx = canvas.width / 2;
            // Spawn from the golden convergence point (lower third)
            const originX = cx + (Math.random() - 0.5) * 60;
            const originY = canvas.height * 0.72;
            particles.push({
                x: originX,
                y: originY,
                vx: (Math.random() - 0.5) * 0.6,
                vy: -(Math.random() * 1.2 + 0.4),
                radius: Math.random() * 1.8 + 0.4,
                opacity: Math.random() * 0.7 + 0.3,
                decayRate: Math.random() * 0.003 + 0.002,
            });
        };

        let frame = 0;
        const draw = () => {
            frame++;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (frame % 2 === 0) spawn();
            if (particles.length > 300) particles.splice(0, 10);

            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.opacity -= p.decayRate;

                if (p.opacity <= 0) { particles.splice(i, 1); continue; }

                const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 2);
                grd.addColorStop(0, `rgba(180, 220, 255, ${p.opacity})`);
                grd.addColorStop(1, `rgba(0, 142, 187, 0)`);

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius * 2, 0, Math.PI * 2);
                ctx.fillStyle = grd;
                ctx.fill();
            }

            raf = requestAnimationFrame(draw);
        };
        draw();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(raf);
        };
    }, []);

    return <canvas ref={ref} className="absolute inset-0 w-full h-full pointer-events-none z-10" />;
}

/* ─────────────────────────────────────────────
   ARABESQUE  (decorative SVG tile)
───────────────────────────────────────────── */
function ArabesqueBorder() {
    return (
        <svg
            viewBox="0 0 400 400"
            className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.06] z-0"
            preserveAspectRatio="xMidYMid slice"
        >
            <defs>
                <pattern id="arabesque" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                    <g stroke="#D8D7F6" strokeWidth="0.6" fill="none">
                        <circle cx="40" cy="40" r="28" />
                        <circle cx="40" cy="40" r="18" />
                        <circle cx="40" cy="40" r="8" />
                        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
                            const rad = (angle * Math.PI) / 180;
                            const x1 = 40 + Math.cos(rad) * 8;
                            const y1 = 40 + Math.sin(rad) * 8;
                            const x2 = 40 + Math.cos(rad) * 28;
                            const y2 = 40 + Math.sin(rad) * 28;
                            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />;
                        })}
                        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
                            const a = (i * 45 * Math.PI) / 180;
                            const x = 40 + Math.cos(a) * 38;
                            const y = 40 + Math.sin(a) * 38;
                            return <circle key={i} cx={x} cy={y} r="2.5" />;
                        })}
                    </g>
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#arabesque)" />
        </svg>
    );
}

/* ─────────────────────────────────────────────
   MAIN COVER  
───────────────────────────────────────────── */
export function BookCoverCanvas() {
    return (
        <div className="relative w-full h-[calc(100vh-9rem)] md:h-[calc(100vh-7rem)] overflow-hidden rounded-2xl md:rounded-3xl select-none"
            style={{ background: 'linear-gradient(175deg, #0d0c28 0%, #1a1750 30%, #16335e 60%, #0d1f3c 100%)' }}
        >
            {/* ── Layer 0: Arabesque tile pattern ── */}
            <ArabesqueBorder />

            {/* ── Layer 1: Particle canvas ── */}
            <ParticleCanvas />

            {/* ── Layer 2: The Divine Pathway – perspective road of light ── */}
            <div className="absolute inset-0 z-20 flex items-end justify-center">
                <svg
                    viewBox="0 0 800 700"
                    className="w-full h-full"
                    preserveAspectRatio="xMidYMax meet"
                >
                    <defs>
                        {/* Vertical light beam from the horizon (vanishing point) */}
                        <radialGradient id="beam" cx="50%" cy="42%" r="55%" gradientUnits="objectBoundingBox">
                            <stop offset="0%" stopColor="#008EBB" stopOpacity="0.55" />
                            <stop offset="40%" stopColor="#26245D" stopOpacity="0.15" />
                            <stop offset="100%" stopColor="#0d0c28" stopOpacity="0" />
                        </radialGradient>

                        {/* Path glow – the road itself */}
                        <linearGradient id="pathGlow" x1="0.5" y1="1" x2="0.5" y2="0">
                            <stop offset="0%" stopColor="#008EBB" stopOpacity="0.9" />
                            <stop offset="60%" stopColor="#D8D7F6" stopOpacity="0.6" />
                            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
                        </linearGradient>

                        {/* Horizontal horizon glow */}
                        <linearGradient id="horizonGlow" x1="0" y1="0.5" x2="1" y2="0.5">
                            <stop offset="0%" stopColor="#008EBB" stopOpacity="0" />
                            <stop offset="35%" stopColor="#008EBB" stopOpacity="0.5" />
                            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.9" />
                            <stop offset="65%" stopColor="#008EBB" stopOpacity="0.5" />
                            <stop offset="100%" stopColor="#008EBB" stopOpacity="0" />
                        </linearGradient>

                        {/* Golden star burst */}
                        <radialGradient id="starBurst" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                            <stop offset="20%" stopColor="#D8D7F6" stopOpacity="0.8" />
                            <stop offset="100%" stopColor="#008EBB" stopOpacity="0" />
                        </radialGradient>

                        <filter id="glow">
                            <feGaussianBlur stdDeviation="6" result="blur" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>

                        <filter id="softGlow">
                            <feGaussianBlur stdDeviation="12" result="blur" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Ambient radial glow around the vanishing point */}
                    <rect x="0" y="0" width="800" height="700" fill="url(#beam)" />

                    {/* The Pathway – two converging lines + filled road */}
                    {/* Road fill */}
                    <path
                        d="M 0 700 L 370 300 L 430 300 L 800 700 Z"
                        fill="url(#pathGlow)"
                        opacity="0.35"
                    />

                    {/* Left edge of path */}
                    <line x1="0" y1="700" x2="370" y2="300" stroke="url(#pathGlow)" strokeWidth="2" opacity="0.8" />
                    {/* Right edge of path */}
                    <line x1="800" y1="700" x2="430" y2="300" stroke="url(#pathGlow)" strokeWidth="2" opacity="0.8" />

                    {/* Perspective dashes on the path */}
                    {[0.92, 0.82, 0.70, 0.57, 0.44].map((t, i) => {
                        const y = 300 + (700 - 300) * t;
                        const halfW = (430 - 370) / 2 + (800 / 2 - (430 - 370) / 2 - 370) * (1 - t) * 0.5;
                        const cx = 400;
                        return (
                            <line
                                key={i}
                                x1={cx - halfW * 0.35}
                                y1={y}
                                x2={cx + halfW * 0.35}
                                y2={y}
                                stroke="#D8D7F6"
                                strokeWidth={1.5 * t}
                                opacity={0.25 * t}
                                strokeDasharray={`${8 * t} ${6 * t}`}
                            />
                        );
                    })}

                    {/* Horizon glow line */}
                    <rect x="0" y="296" width="800" height="8" fill="url(#horizonGlow)" />

                    {/* The Divine Light Source – starburst at vanishing point */}
                    <circle cx="400" cy="300" r="60" fill="url(#starBurst)" filter="url(#softGlow)" />
                    <circle cx="400" cy="300" r="22" fill="#ffffff" opacity="0.95" filter="url(#glow)" />
                    <circle cx="400" cy="300" r="8" fill="#ffffff" opacity="1" />

                    {/* Starburst rays */}
                    {[...Array(16)].map((_, i) => {
                        const angle = (i / 16) * 360;
                        const rad = (angle * Math.PI) / 180;
                        const inner = 24;
                        const outer = i % 2 === 0 ? 90 : 55;
                        return (
                            <line
                                key={i}
                                x1={400 + Math.cos(rad) * inner}
                                y1={300 + Math.sin(rad) * inner}
                                x2={400 + Math.cos(rad) * outer}
                                y2={300 + Math.sin(rad) * outer}
                                stroke="#D8D7F6"
                                strokeWidth={i % 2 === 0 ? 1.2 : 0.6}
                                opacity={i % 2 === 0 ? 0.55 : 0.3}
                                strokeLinecap="round"
                            />
                        );
                    })}

                    {/* Flanking vertical light columns */}
                    <rect x="180" y="0" width="3" height="300" fill="url(#pathGlow)" opacity="0.12" />
                    <rect x="620" y="0" width="3" height="300" fill="url(#pathGlow)" opacity="0.12" />
                </svg>
            </div>

            {/* ── Layer 3: Typography ── */}
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-between py-10 md:py-16 px-6 pointer-events-none">

                {/* Top: Publisher bar */}
                <motion.div
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, delay: 0.4 }}
                    className="flex items-center gap-3"
                >
                    <div className="h-px w-12 bg-white/20" />
                    <span className="text-[10px] md:text-xs uppercase tracking-[0.35em] text-white/40 font-sans font-semibold">
                        Al-Asr Educational Institute
                    </span>
                    <div className="h-px w-12 bg-white/20" />
                </motion.div>

                {/* Centre: Main title block */}
                <div className="text-center flex flex-col items-center gap-6 md:gap-8">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1.6, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="space-y-2"
                    >
                        <h1
                            className="font-serif font-bold leading-[1.05] tracking-tight text-white"
                            style={{ fontSize: 'clamp(2.8rem, 8vw, 6rem)', textShadow: '0 0 60px rgba(0,142,187,0.5)' }}
                        >
                            Pathway
                        </h1>
                        <h1
                            className="font-serif font-bold leading-[1.05] tracking-tight"
                            style={{
                                fontSize: 'clamp(2.8rem, 8vw, 6rem)',
                                textShadow: '0 0 60px rgba(0,142,187,0.8)',
                                color: '#D8D7F6',
                            }}
                        >
                            to&nbsp;<span style={{ color: '#008EBB' }}>Light</span>
                        </h1>
                    </motion.div>

                    {/* Ornamental divider */}
                    <motion.div
                        initial={{ opacity: 0, scaleX: 0 }}
                        animate={{ opacity: 1, scaleX: 1 }}
                        transition={{ duration: 1.2, delay: 1.6 }}
                        className="flex items-center gap-4"
                    >
                        <div className="h-px w-20 md:w-32 bg-gradient-to-r from-transparent to-[#008EBB]/60" />
                        <svg viewBox="0 0 24 24" width="16" height="16" className="opacity-50">
                            <polygon points="12,2 14.5,9.5 22,9.5 16,14.5 18.5,22 12,17 5.5,22 8,14.5 2,9.5 9.5,9.5" fill="none" stroke="#D8D7F6" strokeWidth="1" />
                        </svg>
                        <div className="h-px w-20 md:w-32 bg-gradient-to-l from-transparent to-[#008EBB]/60" />
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.2, delay: 2 }}
                        className="text-white/50 font-sans text-sm md:text-base tracking-[0.2em] uppercase font-medium max-w-xs md:max-w-md text-center leading-relaxed"
                    >
                        An easy reference guide<br className="md:hidden" /> to key Islamic concepts
                    </motion.p>
                </div>

                {/* Bottom: Action Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 2.6 }}
                    className="flex flex-col items-center gap-6"
                >
                    <div className="flex flex-wrap justify-center gap-4 pointer-events-auto">
                        <a
                            href="/audio/pathway-podcast.wav"
                            download="Pathway_To_Light_Podcast.wav"
                            className="flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-secondary text-white font-bold text-sm shadow-lg hover:shadow-secondary/20 hover:scale-105 transition-all group"
                        >
                            <Headphones size={16} />
                            Download Podcast
                        </a>
                        <a
                            href="/documents/pathway-to-light.pdf"
                            download="Pathway_To_Light_Guide.pdf"
                            className="flex items-center gap-2.5 px-6 py-2.5 rounded-full border border-white/20 bg-white/5 backdrop-blur-md text-white font-bold text-sm hover:bg-white/10 hover:border-secondary/40 transition-all group"
                        >
                            <FileText size={16} className="text-secondary" />
                            Download PDF
                        </a>
                    </div>

                    <p className="text-white/25 text-[10px] uppercase tracking-[0.4em] font-sans">Scroll to begin reading</p>

                    <motion.div
                        animate={{ y: [0, 4, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        className="flex flex-col items-center gap-1 opacity-40"
                    >
                        <div className="w-px h-4 bg-gradient-to-b from-secondary to-transparent" />
                        <div
                            className="w-1 h-1 rounded-full"
                            style={{ background: '#008EBB' }}
                        />
                    </motion.div>
                </motion.div>
            </div>

            {/* ── Layer 4: Vignette edge darkening ── */}
            <div
                className="absolute inset-0 z-40 pointer-events-none rounded-2xl md:rounded-3xl"
                style={{
                    background:
                        'radial-gradient(ellipse 120% 90% at 50% 50%, transparent 50%, rgba(13,12,40,0.85) 100%)',
                }}
            />
        </div>
    );
}

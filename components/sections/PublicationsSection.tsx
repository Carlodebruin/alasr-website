'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BookOpen, ArrowRight, Bookmark, Download, Headphones, FileText } from 'lucide-react';

export const PublicationsSection = () => {
    return (
        <section className="py-10 md:py-16 bg-gradient-to-b from-white to-surface/30 font-sans overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Section Header */}
                <div className="text-center mb-16">
                    <span className="inline-block text-secondary text-sm font-bold uppercase tracking-[0.25em] mb-3">
                        Al-Asr Institute
                    </span>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-primary tracking-tight">
                        Our Publications
                    </h2>
                    <p className="mt-3 text-foreground/60 text-lg max-w-xl mx-auto">
                        Knowledge shared is light multiplied. Explore our educational resources.
                    </p>
                </div>

                {/* Book Card */}
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-80px' }}
                        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                        className="relative flex flex-col md:flex-row gap-0 rounded-3xl overflow-hidden shadow-2xl border border-surface"
                    >
                        {/* LEFT – Animated mini cover panel */}
                        <div
                            className="relative w-full md:w-64 lg:w-72 shrink-0 flex items-center justify-center overflow-hidden"
                            style={{
                                background: 'linear-gradient(160deg, #0d0c28 0%, #1a1750 40%, #16335e 70%, #0d1f3c 100%)',
                                minHeight: '280px',
                            }}
                        >
                            {/* Arabesque dot-grid overlay */}
                            <svg className="absolute inset-0 w-full h-full opacity-[0.07]" xmlns="http://www.w3.org/2000/svg">
                                <defs>
                                    <pattern id="pub-dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                                        <circle cx="12" cy="12" r="1" fill="#D8D7F6" />
                                    </pattern>
                                </defs>
                                <rect width="100%" height="100%" fill="url(#pub-dots)" />
                            </svg>

                            {/* Horizon light beam */}
                            <div
                                className="absolute inset-0 pointer-events-none"
                                style={{
                                    background: 'radial-gradient(ellipse 80% 60% at 50% 55%, rgba(0,142,187,0.35) 0%, transparent 70%)',
                                }}
                            />

                            {/* Pathway lines */}
                            <svg viewBox="0 0 200 280" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
                                {/* Road */}
                                <path d="M0 280 L88 140 L112 140 L200 280 Z" fill="rgba(0,142,187,0.15)" />
                                <line x1="0" y1="280" x2="88" y2="140" stroke="rgba(0,142,187,0.6)" strokeWidth="1" />
                                <line x1="200" y1="280" x2="112" y2="140" stroke="rgba(0,142,187,0.6)" strokeWidth="1" />
                                {/* Horizon glow */}
                                <rect x="0" y="137" width="200" height="6" fill="rgba(255,255,255,0.25)" />
                                {/* Light source */}
                                <circle cx="100" cy="140" r="20" fill="rgba(255,255,255,0.12)" />
                                <circle cx="100" cy="140" r="8" fill="rgba(255,255,255,0.7)" />
                                <circle cx="100" cy="140" r="3" fill="white" />
                                {/* Rays */}
                                {[...Array(12)].map((_, i) => {
                                    const a = ((i / 12) * 360 * Math.PI) / 180;
                                    return (
                                        <line key={i}
                                            x1={100 + Math.cos(a) * 10} y1={140 + Math.sin(a) * 10}
                                            x2={100 + Math.cos(a) * 32} y2={140 + Math.sin(a) * 32}
                                            stroke="rgba(216,215,246,0.4)"
                                            strokeWidth="0.8"
                                            strokeLinecap="round"
                                        />
                                    );
                                })}
                            </svg>

                            {/* Title overlay on the panel */}
                            <div className="relative z-10 text-center px-6 select-none">
                                <p className="text-[10px] uppercase tracking-[0.35em] text-white/30 font-sans mb-3">Al-Asr Publications</p>
                                <h3 className="text-2xl md:text-3xl font-serif font-bold text-white leading-tight"
                                    style={{ textShadow: '0 0 30px rgba(0,142,187,0.6)' }}>
                                    Pathway<br /><span style={{ color: '#008EBB' }}>to Light</span>
                                </h3>
                                <div className="mt-3 flex items-center justify-center gap-2">
                                    <div className="h-px w-6 bg-white/20" />
                                    <BookOpen size={12} className="text-white/30" />
                                    <div className="h-px w-6 bg-white/20" />
                                </div>
                                <p className="mt-2 text-[10px] text-white/25 uppercase tracking-widest font-sans">First Edition · 2011</p>
                            </div>
                        </div>

                        {/* RIGHT – Book details */}
                        <div className="flex-1 bg-white p-6 md:p-10 flex flex-col justify-between gap-6">
                            {/* Badge */}
                            <div className="flex items-center gap-3">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface text-primary text-xs font-bold uppercase tracking-wider">
                                    <Bookmark size={11} />
                                    Islamic Reference Guide
                                </span>
                                <span className="text-xs text-foreground/30 font-sans">ISBN: 978-0-620-50334-1</span>
                            </div>

                            {/* Quote from Foreword */}
                            <div className="border-l-4 border-secondary/40 pl-5 py-1">
                                <p className="text-foreground/80 text-base md:text-lg leading-relaxed font-sans italic">
                                    "Pathway to Light is written in a simple, intelligible way — neither esoteric nor pedantic.
                                    In many ways it could be regarded as a quick overview of the Quran, summarising beautifully
                                    the tenets of faith."
                                </p>
                                <p className="mt-3 text-xs uppercase tracking-wider text-foreground/40 font-sans font-semibold">
                                    — Edris Khamissa, Educator & Human Development Consultant
                                </p>
                            </div>

                            {/* Summary */}
                            <p className="text-foreground/60 text-sm md:text-base leading-relaxed font-sans">
                                The important things in life are often straight forward and simple — such is the case with
                                the word of Allah. This publication presents the basic principles of Islam in a clear
                                question-and-answer format, drawing directly from the Quran, designed as an easy reference
                                for learners, educators, and seekers of knowledge alike.
                            </p>

                            {/* CTA */}
                            <div className="flex flex-col gap-5 pt-2">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                    <Link
                                        href="/pathway"
                                        className="inline-flex items-center gap-2 px-6 py-2.5 md:py-3 bg-primary text-white rounded-full font-bold text-sm md:text-base hover:bg-primary/90 transition-all shadow-md hover:shadow-lg group whitespace-nowrap"
                                    >
                                        <BookOpen size={16} />
                                        Read the Book
                                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                    <p className="text-xs text-foreground/30 font-sans italic">Free · No account required</p>
                                </div>

                                <div className="flex flex-wrap gap-3 border-t border-surface pt-5">
                                    <a
                                        href="/beta/documents/pathway-to-light.pdf"
                                        download="Pathway_To_Light_Guide.pdf"
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-surface text-primary border border-secondary/20 rounded-full font-bold text-xs hover:bg-white transition-all group"
                                    >
                                        <FileText size={14} className="text-secondary" />
                                        Download PDF
                                        <Download size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </a>
                                    <a
                                        href="/beta/audio/pathway-podcast.wav"
                                        download="Pathway_To_Light_Podcast.wav"
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-surface text-primary border border-secondary/20 rounded-full font-bold text-xs hover:bg-white transition-all group"
                                    >
                                        <Headphones size={14} className="text-secondary" />
                                        Download Podcast
                                        <Download size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

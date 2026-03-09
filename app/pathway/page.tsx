'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useSpring } from 'motion/react';
import { Menu, X, ChevronLeft, ChevronRight, BookOpen, Bookmark, BookmarkCheck, Search, Headphones } from 'lucide-react';
import { BookCoverCanvas } from '@/components/ui/BookCoverCanvas';

// ==========================================
// 1. FULL BOOK DATA
// ==========================================
import { bookData1 } from './bookData1';
import { bookData2 } from './bookData2';
import { bookData3 } from './bookData3';
import { bookData4 } from './bookData4';
import { bookData5 } from './bookData5';

const bookCover = {
    id: 'cover',
    title: 'Pathway To Light',
    chapterNum: 'Cover',
    sections: [
        {
            subtitle: '',
            content: '',
            verses: [],
            isCover: true
        }
    ]
};

const bookData = [
    bookCover,
    ...bookData1,
    ...bookData2,
    ...bookData3,
    ...bookData4,
    ...bookData5
];

interface SearchResult {
    index: number;
    title: string;
    chapterNum: string;
    preview: string;
}

// ==========================================
// 2. MAIN APPLICATION COMPONENT
// ==========================================
export default function LibraryPage() {
    const [activeChapterIndex, setActiveChapterIndex] = useState(0);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [bookmarks, setBookmarks] = useState<Record<number, number>>({});
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const mainRef = useRef<HTMLElement>(null);

    const { scrollYProgress } = useScroll({ container: mainRef });
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    const activeChapter = bookData[activeChapterIndex];

    // Load bookmarks on mount
    useEffect(() => {
        const saved = localStorage.getItem('pathway_bookmarks');
        if (saved) {
            try {
                setBookmarks(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to load bookmarks", e);
            }
        }
    }, []);

    // Save bookmarks when they change
    useEffect(() => {
        localStorage.setItem('pathway_bookmarks', JSON.stringify(bookmarks));
    }, [bookmarks]);

    // Handle search
    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }

        const query = searchQuery.toLowerCase();
        const results: SearchResult[] = [];

        bookData.forEach((chapter, idx) => {
            const inTitle = chapter.title.toLowerCase().includes(query);

            let sectionMatch = "";
            let foundInContent = false;

            for (const section of chapter.sections) {
                if (section.subtitle.toLowerCase().includes(query) || section.content.toLowerCase().includes(query)) {
                    sectionMatch = section.content;
                    foundInContent = true;
                    break;
                }
                for (const verse of section.verses) {
                    if (verse.text.toLowerCase().includes(query) || verse.reference.toLowerCase().includes(query)) {
                        sectionMatch = verse.text;
                        foundInContent = true;
                        break;
                    }
                }
                if (foundInContent) break;
            }

            if (inTitle || foundInContent) {
                let preview = "";
                if (foundInContent) {
                    const contentLower = sectionMatch.toLowerCase();
                    const matchIdx = contentLower.indexOf(query);
                    const startIdx = Math.max(0, matchIdx - 40);
                    const endIdx = Math.min(sectionMatch.length, matchIdx + query.length + 40);
                    preview = (startIdx > 0 ? "..." : "") +
                        sectionMatch.substring(startIdx, endIdx).replace(/\n/g, ' ') +
                        (endIdx < sectionMatch.length ? "..." : "");
                } else {
                    const firstSection = chapter.sections[0]?.content || "";
                    preview = firstSection.substring(0, 80).replace(/\n/g, ' ') + "...";
                }

                results.push({
                    index: idx,
                    title: chapter.title,
                    chapterNum: chapter.chapterNum,
                    preview
                });
            }
        });

        setSearchResults(results);
    }, [searchQuery]);

    // Handle chapter change and scroll restoration
    useEffect(() => {
        if (mainRef.current) {
            const savedScroll = bookmarks[activeChapterIndex];
            if (savedScroll !== undefined) {
                setTimeout(() => {
                    if (mainRef.current) {
                        mainRef.current.scrollTo({ top: savedScroll, behavior: 'smooth' });
                    }
                }, 100);
            } else {
                mainRef.current.scrollTo(0, 0);
            }
        }
    }, [activeChapterIndex]);

    const toggleBookmark = () => {
        const currentScroll = mainRef.current?.scrollTop || 0;
        setBookmarks(prev => {
            const next = { ...prev };
            if (next[activeChapterIndex] !== undefined) {
                delete next[activeChapterIndex];
            } else {
                next[activeChapterIndex] = currentScroll;
            }
            return next;
        });
    };

    // Close sidebar on mobile when chapter changes
    useEffect(() => {
        if (window.innerWidth < 768) {
            setSidebarOpen(false);
        }
    }, [activeChapterIndex]);

    const formatContent = (text: string) => {
        return text.split('\n').map((line, i) => (
            <React.Fragment key={i}>
                {line}
                <br />
            </React.Fragment>
        ));
    };

    return (
        <div className="flex h-[calc(100vh-5rem)] md:h-[calc(100vh-6rem)] bg-background text-foreground font-sans overflow-hidden relative">

            {/* BACKDROP FOR MOBILE SIDEBAR */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSidebarOpen(false)}
                        className="fixed inset-0 bg-primary/20 backdrop-blur-sm z-40 md:hidden"
                    />
                )}
            </AnimatePresence>

            {/* SIDEBAR NAVIGATION */}
            <aside
                className={`fixed md:relative inset-y-0 left-0 bg-white md:bg-surface/20 border-r border-secondary/10 transition-all duration-300 ease-in-out overflow-y-auto overflow-x-hidden flex flex-col z-50 md:z-10
                    ${sidebarOpen ? 'w-80 translate-x-0' : 'w-0 -translate-x-full md:translate-x-0'}`}
            >
                <div className="p-8 bg-primary text-background sticky top-0 z-10 shadow-md">
                    <div className="flex items-center justify-between gap-3 mb-2">
                        <div className="flex items-center gap-3">
                            <BookOpen className="text-secondary" size={24} />
                            <h1 className="m-0 text-xl font-bold font-serif leading-tight tracking-wide">
                                Pathway To Light
                            </h1>
                        </div>
                        <button onClick={() => setSidebarOpen(false)} className="md:hidden text-background/50 hover:text-background transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                    <p className="mt-2 text-xs text-background/70 uppercase tracking-widest font-semibold">Al-Asr Educational Institute</p>

                    <div className="mt-6 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-background/40" size={16} />
                        <input
                            type="text"
                            placeholder="Search chapters..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/10 border-none rounded-full py-2 pl-10 pr-4 text-base text-background placeholder:text-background/40 focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all font-sans"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none p-0 cursor-pointer text-background/40 hover:text-background"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    {/* Podcast Summary */}
                    <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10 group hover:border-secondary/30 transition-all">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-secondary/20 rounded-lg text-secondary group-hover:bg-secondary group-hover:text-white transition-all">
                                <Headphones size={18} />
                            </div>
                            <div className="flex-1 text-left">
                                <p className="text-[0.6rem] md:text-[0.7rem] uppercase tracking-widest text-background/50 font-bold mb-0.5 leading-none">AI Audio Guide</p>
                                <p className="text-sm font-bold text-background leading-tight">Podcast Overview</p>
                            </div>
                        </div>
                        <audio
                            controls
                            className="w-full h-8 brightness-90 contrast-125"
                            src="/beta/audio/pathway-podcast.wav"
                        >
                            Your browser does not support the audio element.
                        </audio>
                        <p className="mt-2 text-[0.65rem] text-background/30 italic font-medium text-left">Brief audio summary of the book.</p>
                    </div>
                </div>

                <nav className="p-4 bg-background md:bg-transparent">
                    {searchQuery ? (
                        <div className="space-y-4">
                            <p className="px-4 text-[0.7rem] uppercase tracking-widest text-foreground/40 font-bold text-left">
                                Search Results ({searchResults.length})
                            </p>
                            {searchResults.length > 0 ? (
                                <ul className="list-none p-0 m-0 space-y-2">
                                    {searchResults.map((result) => (
                                        <li key={result.index}>
                                            <button
                                                onClick={() => {
                                                    setActiveChapterIndex(result.index);
                                                    setSearchQuery('');
                                                }}
                                                className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-white border-none rounded-lg cursor-pointer transition-all group"
                                            >
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xs font-bold text-secondary">
                                                        {result.chapterNum !== "0" && result.chapterNum !== "Conclusion" ? `Ch ${result.chapterNum}` : ""}
                                                    </span>
                                                    <span className="text-sm font-bold text-primary group-hover:text-secondary transition-colors">
                                                        {result.title}
                                                    </span>
                                                </div>
                                                <p className="text-[0.75rem] text-foreground/60 line-clamp-2 italic leading-relaxed">
                                                    {result.preview}
                                                </p>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="px-4 text-sm text-foreground/40 italic text-left">No results found for "{searchQuery}"</p>
                            )}
                        </div>
                    ) : (
                        <ul className="list-none p-0 m-0 space-y-2">
                            {bookData.map((chapter, idx) => (
                                <li key={chapter.id}>
                                    <button
                                        onClick={() => setActiveChapterIndex(idx)}
                                        className={`w-full text-left px-4 py-3 border-none flex items-start gap-3 cursor-pointer text-base transition-all rounded-lg
                          ${activeChapterIndex === idx
                                                ? 'bg-primary text-white shadow-md font-semibold'
                                                : 'bg-transparent text-foreground/80 hover:bg-white/50 hover:text-primary font-medium'
                                            }`}
                                    >
                                        <span className={`font-bold min-w-[24px] ${activeChapterIndex === idx ? 'text-secondary' : 'text-foreground/30'}`}>
                                            {chapter.chapterNum !== "0" && chapter.chapterNum !== "Conclusion" ? chapter.chapterNum : ""}
                                        </span>
                                        <span className="leading-snug flex-1">{chapter.title}</span>
                                        {bookmarks[idx] !== undefined && (
                                            <Bookmark size={14} className={`${activeChapterIndex === idx ? 'text-white fill-white' : 'text-secondary fill-secondary'} shrink-0 mt-1`} />
                                        )}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </nav>
            </aside>

            {/* MAIN CONTENT AREA */}
            <main ref={mainRef} className="flex-1 overflow-y-auto relative scroll-smooth bg-background">

                {/* Reading Progress Bar */}
                <motion.div
                    className="sticky top-0 left-0 right-0 h-1 bg-secondary origin-left z-50"
                    style={{ scaleX }}
                />

                {/* Top Navbar / Mobile Toggle */}
                <header className="sticky top-0 z-20 bg-background/90 backdrop-blur-xl border-b border-secondary/5 px-4 md:px-6 py-3 flex items-center justify-between transition-all">
                    <div className="flex items-center gap-3 md:gap-4">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="bg-primary/5 hover:bg-primary/10 p-2 md:px-3 md:py-2 rounded-lg border-none cursor-pointer flex items-center gap-2 text-primary font-bold transition-all"
                        >
                            <Menu size={20} />
                            <span className="hidden sm:inline">Index</span>
                        </button>

                        <button
                            onClick={toggleBookmark}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold transition-all cursor-pointer border-none
                ${bookmarks[activeChapterIndex] !== undefined
                                    ? 'bg-secondary text-white shadow-sm'
                                    : 'bg-surface/30 text-foreground/60 hover:bg-surface/50'
                                }`}
                        >
                            {bookmarks[activeChapterIndex] !== undefined ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                            <span>{bookmarks[activeChapterIndex] !== undefined ? 'Bookmarked' : 'Bookmark'}</span>
                        </button>
                    </div>

                    <div className="text-sm text-foreground/40 font-medium tracking-widest uppercase">
                        Chapter {activeChapterIndex + 1} <span className="mx-2">/</span> {bookData.length}
                    </div>
                </header>

                {/* Reading View */}
                <div className="max-w-3xl mx-auto px-5 md:px-6 pt-6 md:pt-16 pb-32">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeChapterIndex}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                        >
                            {activeChapter.id !== 'cover' && (
                                <div className="mb-16 text-center">
                                    {activeChapter.chapterNum !== "0" && activeChapter.chapterNum !== "Conclusion" && activeChapter.chapterNum !== "Cover" && (
                                        <span className="inline-block text-secondary text-sm font-bold mb-6 tracking-[0.2em] uppercase">
                                            Chapter {activeChapter.chapterNum}
                                        </span>
                                    )}
                                    <h2 className="text-3xl md:text-5xl text-primary m-0 font-serif leading-tight font-bold">
                                        {activeChapter.title}
                                    </h2>
                                    <div className="w-24 h-1 bg-secondary/30 mx-auto mt-10 rounded-full"></div>
                                </div>
                            )}

                            <div className="flex flex-col gap-16">
                                {activeChapter.sections.map((section, idx) => (
                                    <section key={idx} className="group">

                                        {/* Animated Cover Canvas */}
                                        {(section as any).isCover && (
                                            <div className="-mx-5 md:mx-0">
                                                <BookCoverCanvas />
                                            </div>
                                        )}

                                        {/* Subtitle */}
                                        {section.subtitle && (
                                            <h3 className="text-2xl md:text-3xl text-primary m-0 mb-6 font-serif font-medium">
                                                {section.subtitle}
                                            </h3>
                                        )}

                                        {/* Explanatory Text */}
                                        {section.content && (
                                            <div className={`text-[1.1rem] leading-relaxed text-foreground/90 m-0 mb-8 whitespace-pre-wrap font-sans ${(section as any).isCover ? 'text-center italic text-foreground/50' : ''}`}>
                                                {idx === 0 && !(section as any).isCover ? (
                                                    <div className="first-letter:text-6xl first-letter:font-serif first-letter:font-bold first-letter:text-secondary first-letter:mr-3 first-letter:float-left first-letter:leading-none">
                                                        {formatContent(section.content)}
                                                    </div>
                                                ) : (
                                                    <div>{formatContent(section.content)}</div>
                                                )}
                                            </div>
                                        )}

                                        {/* Quranic Verses */}
                                        {section.verses && section.verses.length > 0 && (
                                            <div className={`flex flex-col gap-8 ${section.content ? 'mt-0' : 'mt-4'}`}>
                                                {section.verses.map((verse, vIdx) => (
                                                    <blockquote key={vIdx} className="m-0 p-8 md:p-10 bg-white border border-secondary/20 rounded-2xl relative shadow-sm transition-all hover:shadow-md hover:border-secondary/40">
                                                        <div className="absolute top-0 left-8 -translate-y-1/2 bg-white px-2">
                                                            <BookOpen className="text-secondary/40" size={24} />
                                                        </div>
                                                        <p className="text-xl md:text-2xl leading-relaxed text-primary relative z-10 m-0 font-serif italic">
                                                            {formatContent(verse.text)}
                                                        </p>
                                                        {verse.reference && (
                                                            <div className="mt-8 flex justify-end">
                                                                <span className="inline-block bg-surface text-primary px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase border border-secondary/10">
                                                                    {verse.reference}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </blockquote>
                                                ))}
                                            </div>
                                        )}

                                    </section>
                                ))}
                            </div>

                            {/* Bottom Next/Prev Pagination */}
                            <div className="flex justify-between items-center mt-24 border-t border-secondary/20 pt-12">
                                <button
                                    onClick={() => {
                                        setActiveChapterIndex(Math.max(0, activeChapterIndex - 1));
                                    }}
                                    disabled={activeChapterIndex === 0}
                                    className={`flex items-center gap-2 px-6 py-4 bg-transparent text-primary rounded-full font-bold transition-all
                    ${activeChapterIndex === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-surface/20 cursor-pointer'}`}
                                >
                                    <ChevronLeft size={20} />
                                    <span className="hidden sm:inline">Previous Chapter</span>
                                </button>
                                <button
                                    onClick={() => {
                                        setActiveChapterIndex(Math.min(bookData.length - 1, activeChapterIndex + 1));
                                    }}
                                    disabled={activeChapterIndex === bookData.length - 1}
                                    className={`flex items-center gap-2 px-8 py-4 bg-primary text-background rounded-full font-bold shadow-md transition-all
                    ${activeChapterIndex === bookData.length - 1 ? 'opacity-30 cursor-not-allowed shadow-none' : 'hover:bg-primary/90 hover:shadow-lg cursor-pointer transform hover:-translate-y-1'}`}
                                >
                                    <span className="hidden sm:inline">Next Chapter</span>
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}

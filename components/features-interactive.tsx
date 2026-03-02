'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    Linkedin,
    Github,
    Globe,
    Twitter,
    Briefcase,
    Calendar,
    Mail,
    FileText,
    Dribbble
} from 'lucide-react';
import { cn } from '@/lib/utils';

// --- Shared Styles ---
const CARD_BG = "bg-[#f3ede3]"; // Deeper cream/beige to match FH better
const CARD_ROUNDED = "rounded-[1.5rem]";
const ACCENT_COLOR = "#D36746";

// --- Card 01: Knowledge Sources (Calendar Grid Style) ---
const KnowledgeSourcesCard = () => {
    const [selected, setSelected] = useState(1);
    const sources = [
        { id: 0, label: 'LNKD', icon: <Linkedin className="size-3.5" /> },
        { id: 1, label: 'WEB', icon: <Globe className="size-3.5" /> },
        { id: 2, label: 'GITH', icon: <Github className="size-3.5" /> },
        { id: 3, label: 'TWTR', icon: <Twitter className="size-3.5" /> },
        { id: 4, label: 'DBBL', icon: <Dribbble className="size-3.5" /> },
        { id: 5, label: 'BLOG', icon: <FileText className="size-3.5" /> },
    ];

    return (
        <div className={cn("flex flex-col h-full p-10", CARD_BG, CARD_ROUNDED)}>
            <div className="text-center mb-10">
                <span className="text-[11px] font-bold text-[#D36746] tracking-[0.2em] mb-4 block uppercase font-mono">01</span>
                <h3 className="font-serif text-3xl text-neutral-800 mb-3 tracking-tight">Knowledge Ingestion</h3>
                <p className="text-sm text-neutral-500 font-light leading-relaxed max-w-[220px] mx-auto">
                    Instantly train your agent on your existing professional footprint.
                </p>
            </div>

            <div className="flex-1 flex flex-col justify-center">
                <div className="grid grid-cols-3 gap-2 px-2">
                    {sources.map((s, idx) => (
                        <button
                            key={s.id}
                            onClick={() => setSelected(idx)}
                            className={cn(
                                "flex flex-col items-center justify-center aspect-square rounded-xl transition-all duration-300 border border-neutral-200/50",
                                selected === idx
                                    ? "bg-[#D36746] text-white shadow-xl shadow-[#D36746]/20 border-transparent"
                                    : "bg-white/80 hover:bg-white text-neutral-400"
                            )}
                        >
                            <span className="text-[9px] font-bold tracking-tighter mb-1 opacity-60 uppercase">{s.label}</span>
                            <span className="font-serif text-lg">{idx + 1}</span>
                        </button>
                    ))}
                </div>

                <div className="mt-8 flex justify-center gap-6">
                    <div className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">
                        <span className="text-[#D36746] mr-2">●</span> 12.4K Tokens
                    </div>
                    <div className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">
                        <span className="text-[#D36746] mr-2">●</span> Ingested
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Card 02: Lead Qualification (Range Chart Style) ---
const PersonalityRangeCard = () => {
    return (
        <div className={cn("flex flex-col h-full p-10", CARD_BG, CARD_ROUNDED)}>
            <div className="text-center mb-10">
                <span className="text-[11px] font-bold text-[#D36746] tracking-[0.2em] mb-4 block uppercase font-mono">02</span>
                <h3 className="font-serif text-3xl text-neutral-800 mb-3 tracking-tight">Lead Qualification</h3>
                <p className="text-sm text-neutral-500 font-light leading-relaxed max-w-[220px] mx-auto">
                    Automatically score and filter incoming opportunities.
                </p>
            </div>

            <div className="flex-1 flex flex-col justify-center">
                <div className="relative h-40 w-full mb-6">
                    {/* Range Markers */}
                    <div className="absolute -left-12 top-0 bottom-0 flex flex-col justify-between py-2 text-[8px] font-bold text-neutral-400 tracking-[0.2em] uppercase items-end pr-4 border-r border-neutral-300/50">
                        <span>High Intent</span>
                        <span className="bg-[#D36746]/10 text-[#D36746] px-1 rounded">Qualified</span>
                        <span>Low Match</span>
                    </div>

                    {/* Chart Structure */}
                    <div className="absolute inset-0 ml-4 pb-2">
                        <svg className="w-full h-full overflow-visible" viewBox="0 0 300 120" preserveAspectRatio="none">
                            {/* Dotted Target Line */}
                            <line x1="0" y1="60" x2="300" y2="60" stroke="#D36746" strokeOpacity="0.1" strokeDasharray="4 4" />

                            {/* The Data Path */}
                            <motion.path
                                initial={{ pathLength: 0 }}
                                whileInView={{ pathLength: 1 }}
                                transition={{ duration: 1.5, ease: "easeInOut" }}
                                d="M0,80 C50,80 80,40 120,45 C160,50 180,90 220,70 C260,50 280,30 300,40"
                                fill="none"
                                stroke="#D36746"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />

                            {/* Range Data Points */}
                            {[120, 220, 280].map((x, i) => (
                                <motion.circle
                                    key={i}
                                    initial={{ opacity: 0, scale: 0 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.5 + i * 0.2 }}
                                    cx={x}
                                    cy={i === 0 ? 45 : i === 1 ? 70 : 40}
                                    r="4"
                                    fill="#D36746"
                                />
                            ))}

                            {/* Current Active Node */}
                            <motion.g
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1.5 }}
                            >
                                <circle cx="120" cy="45" r="8" fill="#D36746" fillOpacity="0.2" className="animate-pulse" />
                                <text x="120" y="30" textAnchor="middle" className="text-[10px] font-bold fill-[#D36746]">98% Match</text>
                            </motion.g>
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Card 03: Automated Workflows (Vertical List Style) ---
const ResponseProtocolCard = () => {
    const protocols = [
        { label: 'Lead Captured', icon: <Mail className="size-4" />, desc: 'Contact details securely saved' },
        { label: 'Scope Gathered', icon: <FileText className="size-4" />, desc: 'Project requirements identified' },
        { label: 'Meeting Booked', icon: <Calendar className="size-4" />, desc: 'Added to your Google Calendar' },
    ];

    return (
        <div className={cn("flex flex-col h-full p-10", CARD_BG, CARD_ROUNDED)}>
            <div className="text-center mb-10">
                <span className="text-[11px] font-bold text-[#D36746] tracking-[0.2em] mb-4 block uppercase font-mono">03</span>
                <h3 className="font-serif text-3xl text-neutral-800 mb-3 tracking-tight">Automated Workflows</h3>
                <p className="text-sm text-neutral-500 font-light leading-relaxed max-w-[220px] mx-auto">
                    Your agent handles the busywork so you can build.
                </p>
            </div>

            <div className="flex-1 flex flex-col justify-center space-y-3">
                {protocols.map((p, idx) => (
                    <div
                        key={idx}
                        className="flex items-center gap-5 p-4 bg-white/80 rounded-2xl border border-neutral-100 shadow-sm group hover:scale-[1.02] transition-transform duration-300"
                    >
                        <div className="size-10 rounded-xl bg-[#D36746] text-white flex items-center justify-center shadow-lg shadow-[#D36746]/20">
                            {p.icon}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <h4 className="text-[10px] font-bold text-neutral-900 uppercase tracking-widest leading-none mb-1.5">{p.label}</h4>
                            <p className="text-[11px] text-neutral-400 font-light truncate">{p.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- Main Page Component ---
export default function FeaturesInteractive() {
    return (
        <section className="bg-white py-32 overflow-hidden border-t border-neutral-100">
            <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20">
                <div className="flex flex-col items-center text-center mb-24 space-y-6">
                    <motion.h2
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                        className="font-serif text-5xl md:text-6xl lg:text-7xl text-neutral-900 tracking-tight leading-[1.1]"
                    >
                        Lead generation on <span className="italic font-normal">autopilot</span>
                    </motion.h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <KnowledgeSourcesCard />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
                    >
                        <PersonalityRangeCard />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                    >
                        <ResponseProtocolCard />
                    </motion.div>
                </div>

                <div className="mt-24 flex flex-col md:flex-row items-center justify-center gap-6">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="h-16 px-12 rounded-full bg-[#D36746] text-white font-bold text-sm transition-all hover:bg-[#b05234] shadow-2xl shadow-[#D36746]/30"
                    >
                        Build your agent
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="h-16 px-12 rounded-full border border-[#D36746] text-[#D36746] font-bold text-sm transition-all hover:bg-[#D36746]/5"
                    >
                        How it works
                    </motion.button>
                </div>
            </div>
        </section>
    );
}

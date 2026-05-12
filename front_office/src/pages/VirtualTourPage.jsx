import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "../components/Header";
import Footer from "../components/Footer";
import VirtualTour from "./vitrine/sections/VirtualTour";
import VipTour from "./vitrine/sections/VipTour";

const TABS = [
    {
        id: "gaming",
        label: "Gaming Room",
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="6" width="20" height="12" rx="2" />
                <path d="M12 12h.01M8 12h.01M16 12h.01M12 8v8" />
            </svg>
        ),
        accent: "#2BDFC8",
        desc: "10 PCs · 2 PS5 Setups",
    },
    {
        id: "vip",
        label: "VIP Room",
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
        ),
        accent: "#ffc946",
        desc: "6 VIP PCs · Streaming Room",
    },
];

const VirtualTourPage = () => {
    const [activeTab, setActiveTab] = useState("gaming");

    const currentTab = TABS.find(t => t.id === activeTab);

    return (
        <>
            <Header />
            <main className="flex-grow min-h-screen bg-[#12082a]">
                {/* ── Page hero strip ──────────────────────────── */}
                <section className="relative bg-[#12082a] pt-40 pb-6 overflow-hidden">
                    {/* Background blobs */}
                    <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#7700ff] rounded-full blur-[180px] opacity-10 pointer-events-none" />
                    <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#00d4ff] rounded-full blur-[160px] opacity-8 pointer-events-none" />

                    <div className="relative max-w-7xl mx-auto px-4 md:px-6">
                        {/* Eyebrow */}
                        <div className="flex items-center gap-3 mb-3">
                            <div className="h-px w-14 bg-gradient-to-r from-transparent to-[#2BDFC8]" />
                            <span className="text-[#2BDFC8] text-xs font-bold uppercase tracking-[0.25em]">
                                Interactive 3D Tour
                            </span>
                        </div>

                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white uppercase leading-tight tracking-tight mb-3">
                            EXPLORE{" "}
                            <span
                                className="bg-clip-text text-transparent"
                                style={{ backgroundImage: "linear-gradient(90deg, #FFFFFF 0%, #2BDFC8 45%)" }}
                            >
                                OUR GAMING FLOOR
                            </span>
                        </h1>
                        <p className="text-white/60 text-base max-w-2xl mb-8">
                            Get a feel for the space before you arrive. Drag to rotate, scroll to zoom — explore Gamefy's gaming center in full 3D.
                        </p>

                        {/* ── Tab switcher ──────────────────────────────── */}
                        <div className="flex gap-3 flex-wrap">
                            {TABS.map(tab => {
                                const isActive = activeTab === tab.id;
                                return (
                                    <motion.button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                        className="relative flex items-center gap-3 px-6 py-3.5 rounded-2xl border font-semibold text-[14px] tracking-wide transition-all duration-300"
                                        style={{
                                            background: isActive
                                                ? `linear-gradient(135deg, ${tab.accent}22, ${tab.accent}11)`
                                                : "rgba(255,255,255,0.04)",
                                            borderColor: isActive ? `${tab.accent}88` : "rgba(255,255,255,0.12)",
                                            color: isActive ? tab.accent : "rgba(255,255,255,0.55)",
                                            boxShadow: isActive ? `0 0 24px ${tab.accent}30` : "none",
                                        }}
                                    >
                                        <span>{tab.icon}</span>
                                        <span className="flex flex-col text-left">
                                            <span>{tab.label}</span>
                                            <span className="text-[11px] font-normal opacity-60 mt-0.5">{tab.desc}</span>
                                        </span>
                                        {isActive && (
                                            <motion.div
                                                layoutId="tab-indicator"
                                                className="absolute inset-0 rounded-2xl pointer-events-none"
                                                style={{ boxShadow: `inset 0 0 0 1.5px ${tab.accent}55` }}
                                            />
                                        )}
                                    </motion.button>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* ── Room content ──────────────────────────────── */}
                <div className="relative max-w-7xl mx-auto px-4 md:px-6 pb-20">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -16 }}
                            transition={{ duration: 0.45, ease: "easeOut" }}
                        >
                            {activeTab === "gaming" ? (
                                <VirtualTour embedded />
                            ) : (
                                <VipTour />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
            <Footer />
        </>
    );
};

export default VirtualTourPage;

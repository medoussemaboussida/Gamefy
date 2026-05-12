import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn, UserPlus, ChevronDown, Box } from "lucide-react";

const LoginDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const timeoutRef = useRef(null);
    const containerRef = useRef(null);

    const handleMouseEnter = () => {
        if (window.matchMedia("(hover: hover)").matches) {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            setIsOpen(true);
        }
    };

    const handleMouseLeave = () => {
        if (window.matchMedia("(hover: hover)").matches) {
            timeoutRef.current = setTimeout(() => {
                setIsOpen(false);
            }, 150);
        }
    };

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div 
            ref={containerRef}
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <button 
                onClick={toggleDropdown}
                className={`flex items-center gap-3 bg-gradient-to-r from-[#DD00B8] to-[#1CF3CA] text-white px-8 py-2.5 rounded-full font-['Inter'] font-medium text-[16px] tracking-widest hover:scale-105 transition-all shadow-lg shadow-[#DD00B8]/20 uppercase ${isOpen ? 'scale-105' : ''}`}
            >
                LOG IN
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <ChevronDown size={18} strokeWidth={3} />
                </motion.div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute right-0 mt-3 w-[260px] bg-[#24003E]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-[60]"
                    >
                        <div className="flex flex-col gap-1">
                            <Link 
                                to="/signin"
                                className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-white/90 hover:bg-white/10 hover:text-[#1CF3CA] transition-all group"
                                onClick={() => setIsOpen(false)}
                            >
                                <div className="p-2 rounded-lg bg-[#1CF3CA]/10 text-[#1CF3CA] group-hover:bg-[#1CF3CA] group-hover:text-black transition-all">
                                    <LogIn size={20} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-medium text-[15px]">Sign In</span>
                                    <span className="text-white/40 text-[11px]">Access your account</span>
                                </div>
                            </Link>

                            <div className="h-px bg-white/5 mx-2 my-1" />

                            <Link 
                                to="/signup"
                                className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-white/90 hover:bg-white/10 hover:text-[#FF89EB] transition-all group"
                                onClick={() => setIsOpen(false)}
                            >
                                <div className="p-2 rounded-lg bg-[#DD00B8]/10 text-[#DD00B8] group-hover:bg-[#DD00B8] group-hover:text-white transition-all">
                                    <UserPlus size={20} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-medium text-[15px]">Create Player Account</span>
                                    <span className="text-white/40 text-[11px]">Join Gamefy Academy</span>
                                </div>
                            </Link>

                            <div className="h-px bg-white/5 mx-2 my-1" />

                            <Link 
                                to="/virtual-tour"
                                className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-white/90 hover:bg-white/10 hover:text-[#06F0F6] transition-all group"
                                onClick={() => setIsOpen(false)}
                            >
                                <div className="p-2 rounded-lg bg-[#06F0F6]/10 text-[#06F0F6] group-hover:bg-[#06F0F6] group-hover:text-black transition-all">
                                    <Box size={20} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-medium text-[15px]">3D Virtual Tour</span>
                                    <span className="text-white/40 text-[11px]">Explore our gaming center</span>
                                </div>
                            </Link>
                        </div>
                        
                        {/* Decorative background glow */}
                        <div className="absolute -z-10 top-0 left-0 right-0 bottom-0 bg-gradient-to-br from-[#DD00B8]/5 to-[#1CF3CA]/5 rounded-2xl pointer-events-none" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LoginDropdown;

import React, { useState, useRef, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const NavDropdown = ({ title, items }) => {
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
                className={`flex items-center gap-2 text-[16px] font-['Inter'] font-medium tracking-widest transition-colors ${isOpen ? 'text-[#1CF3CA]' : 'text-white hover:text-[#1CF3CA]'}`}
            >
                {title}
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <ChevronDown size={14} strokeWidth={3} className="opacity-70 mt-0.5" />
                </motion.div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute left-0 mt-4 w-[220px] bg-[#24003E]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-[60]"
                    >
                        <div className="flex flex-col gap-1">
                            {items.map((item, index) => (
                                <Link 
                                    key={index}
                                    to={item.path}
                                    className="flex items-center justify-between px-4 py-3 rounded-xl text-white/80 hover:bg-white/10 hover:text-[#1CF3CA] transition-all group"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <span className="font-medium text-[14px] tracking-wide">{item.name}</span>
                                    <svg className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            ))}
                        </div>
                        
                        {/* Indicator Arrow */}
                        <div className="absolute top-[-5px] left-8 w-2.5 h-2.5 bg-[#24003E]/95 border-t border-l border-white/10 rotate-45" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NavDropdown;

import React, { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import logo from "../assets/images/auth_logo.png";

const Header = () => {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinks = [
        { name: "ROOMS", path: "/rooms", hasDropdown: true },
        { name: "COACHING", path: "/coaches", hasDropdown: true },
        { name: "EVENTS", path: "/events" },
        { name: "COMMUNITY", path: "/community" },
        { name: "PARTNERS", path: "/partners" },
    ];

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                ? "bg-black/10 backdrop-blur-lg border-b border-white/10 py-4"
                : "bg-transparent py-6"
                }`}
        >
            <div className="max-w-[1500px] mx-auto px-4 md:px-6 lg:px-10">
                <div className="flex justify-between items-center">
                    {/* Logo */}
                    <Link to="/" className="flex-shrink-0">
                        <img
                            src={logo}
                            alt="Gamefy"
                            className="w-24 sm:w-28 md:w-[134px] h-auto object-contain"
                        />
                    </Link>

                    {/* Navigation */}
                    <nav className="hidden lg:flex items-center space-x-10">
                        {navLinks.map((link) => (
                            <NavLink
                                key={link.name}
                                to={link.path}
                                className="flex items-center gap-2 text-[16px] font-['Inter'] font-medium tracking-widest text-white hover:text-[#1CF3CA] transition-colors"
                            >
                                {link.name}
                                {link.hasDropdown && (
                                    <svg className="w-3.5 h-3.5 mt-0.5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                                    </svg>
                                )}
                            </NavLink>
                        ))}
                    </nav>

                    {/* Log In Button */}
                    <div className="flex items-center">
                        <Link to="/signin" className="flex items-center gap-3 bg-gradient-to-r from-[#DD00B8] to-[#1CF3CA] text-white px-8 py-2.5 rounded-full font-['Inter'] font-medium text-[16px] tracking-widest hover:scale-105 transition-all shadow-lg shadow-[#DD00B8]/20 uppercase">
                            LOG IN
                            <svg className="w-4 h-4 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;

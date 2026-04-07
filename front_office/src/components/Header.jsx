import React, { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import logo from "../assets/images/auth_logo.png";
import LoginDropdown from "./LoginDropdown";
import NavDropdown from "./NavDropdown";

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
        { 
            name: "ROOMS", 
            items: [
                { name: "Gaming Room", path: "/signin" },
                { name: "VIP Room", path: "/signin" }
            ]
        },
        { 
            name: "COACHING", 
            items: [
                { name: "Our Coaches", path: "/#coaches" },
                { name: "Coaching Room", path: "/signin" }
            ]
        },
        { name: "EVENTS", path: "/#rooms-events" },
        { name: "COMMUNITY", path: "/#blog" },
        { name: "PARTNERS", path: "/#hero" },
    ];

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                ? "bg-[#24003E]/10 backdrop-blur-lg border-b border-white/10 py-4"
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
                            link.items ? (
                                <NavDropdown key={link.name} title={link.name} items={link.items} />
                            ) : (
                                <NavLink
                                    key={link.name}
                                    to={link.path}
                                    className="text-[16px] font-['Inter'] font-medium tracking-widest text-white hover:text-[#1CF3CA] transition-colors"
                                >
                                    {link.name}
                                </NavLink>
                            )
                        ))}
                    </nav>

                    {/* Log In Button */}
                    <div className="flex items-center">
                        <LoginDropdown />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;

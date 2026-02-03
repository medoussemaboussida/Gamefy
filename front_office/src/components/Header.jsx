import { Link, NavLink } from "react-router-dom";
import logo from "../assets/images/gamefy_logo.png";

const Header = () => {
    const navLinks = [
        { name: "ROOMS", path: "/rooms", hasDropdown: true },
        { name: "COACHING", path: "/coaches", hasDropdown: true },
        { name: "EVENTS", path: "/events" },
        { name: "COMMUNITY", path: "/community" },
        { name: "PARTNERS", path: "/partners" },
    ];

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-[#4b0082]/10 backdrop-blur-md border-b border-white/5">
            <div className="max-w-[1500px] mx-auto px-10">
                <div className="flex justify-between items-center h-24">
                    {/* Logo */}
                    <Link to="/" className="flex-shrink-0">
                        <img className="h-11 w-auto" src={logo} alt="Gamefy" />
                    </Link>

                    {/* Navigation */}
                    <nav className="hidden lg:flex items-center space-x-12">
                        {navLinks.map((link) => (
                            <NavLink
                                key={link.name}
                                to={link.path}
                                className="flex items-center gap-2 text-[14px] font-normal tracking-wider text-white hover:text-cyan-400 transition-colors"
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

                    {/* Log In Button - Kept slightly bold for hierarchy but simplified if needed */}
                    <div className="flex items-center">
                        <button className="flex items-center gap-3 bg-gradient-to-r from-cyan-400 via-[#8a2be2] to-[#ec008c] text-white px-9 py-3 rounded-full font-medium text-[14px] tracking-wide hover:scale-105 transition-all shadow-lg shadow-purple-500/20">
                            LOG IN
                            <svg className="w-4 h-4 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;

import { Link } from "react-router-dom";
import { Globe, Instagram, Facebook, Twitter, ShieldCheck as WhatsApp, Disc as Discord, Linkedin } from "lucide-react";
import logo from "../assets/images/gamefy_logo.png";

const Footer = () => {
    return (
        <footer className="relative pt-24 pb-12 overflow-hidden text-white font-sans">
            {/* Background Glows */}
            <div className="absolute inset-0 bg-[#030014] -z-10"></div>
            <div className="absolute inset-0 -z-10 opacity-60">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-600/40 rounded-full blur-[120px] -mr-40 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-500/30 rounded-full blur-[100px] -ml-40 -mb-20"></div>
            </div>

            <div className="max-w-[1500px] mx-auto px-10 relative z-10">
                <div className="flex flex-col lg:flex-row justify-between items-start gap-16 mb-24">
                    {/* Brand & Language */}
                    <div className="flex flex-col items-start gap-12">
                        <Link to="/">
                            <img src={logo} alt="Gamefy" className="h-12 w-auto" />
                        </Link>

                        <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 text-sm font-normal hover:bg-white/5 transition-colors">
                            <Globe className="w-4 h-4" />
                            <span>English</span>
                            <svg className="w-3.5 h-3.5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                    </div>

                    {/* Links Columns */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12 lg:gap-24">
                        {/* Gamefy Column */}
                        <div className="flex flex-col gap-6">
                            <h4 className="text-[#888] font-normal text-sm tracking-widest uppercase">Gamefy</h4>
                            <ul className="flex flex-col gap-4 font-normal tracking-tight">
                                <li><Link to="/rooms" className="hover:text-cyan-400 transition-colors">Rooms</Link></li>
                                <li><Link to="/coaching" className="hover:text-cyan-400 transition-colors">Coaching</Link></li>
                                <li><Link to="/events" className="hover:text-cyan-400 transition-colors">Events</Link></li>
                                <li><Link to="/partners" className="hover:text-cyan-400 transition-colors">Partners</Link></li>
                                <li><Link to="/community" className="hover:text-cyan-400 transition-colors">Community</Link></li>
                            </ul>
                        </div>

                        {/* Social Column */}
                        <div className="flex flex-col gap-6">
                            <h4 className="text-[#888] font-normal text-sm tracking-widest uppercase">Social</h4>
                            <ul className="flex flex-col gap-4 font-normal tracking-tight">
                                <li><a href="#" className="hover:text-cyan-400 transition-colors">Instagram</a></li>
                                <li><a href="#" className="hover:text-cyan-400 transition-colors">Facebook</a></li>
                                <li><a href="#" className="hover:text-cyan-400 transition-colors">X</a></li>
                                <li><a href="#" className="hover:text-cyan-400 transition-colors">Discord</a></li>
                                <li><a href="#" className="hover:text-cyan-400 transition-colors">Twitch</a></li>
                            </ul>
                        </div>

                        {/* Information Column */}
                        <div className="flex flex-col gap-6">
                            <h4 className="text-[#888] font-normal text-sm tracking-widest uppercase">Information</h4>
                            <ul className="flex flex-col gap-4 font-normal tracking-tight">
                                <li><Link to="/privacy" className="hover:text-cyan-400 transition-colors">Privacy & Guidelines</Link></li>
                                <li><Link to="/about" className="hover:text-cyan-400 transition-colors">About</Link></li>
                                <li><Link to="/contact" className="hover:text-cyan-400 transition-colors">Contact Us</Link></li>
                                <li><Link to="/faq" className="hover:text-cyan-400 transition-colors">FAQ</Link></li>
                            </ul>
                        </div>

                        {/* Contact Information Column */}
                        <div className="flex flex-col gap-6">
                            <h4 className="text-[#888] font-normal text-sm tracking-widest uppercase">Contact Information</h4>
                            <ul className="flex flex-col gap-4 font-normal tracking-tight">
                                <li><a href="mailto:contact@gamefy.com" className="hover:text-cyan-400 transition-colors">Mail</a></li>
                                <li><a href="tel:+1234567890" className="hover:text-cyan-400 transition-colors">Phone</a></li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-[#888] font-normal tracking-tight">@2026 Gamefy Academy</p>

                    <div className="flex items-center gap-6">
                        <a href="#" className="text-white hover:text-cyan-400 transition-colors"><Instagram className="w-5 h-5" /></a>
                        <a href="#" className="text-white hover:text-cyan-400 transition-colors"><Facebook className="w-5 h-5" /></a>
                        <a href="#" className="text-white hover:text-cyan-400 transition-colors"><Twitter className="w-5 h-5" /></a>
                        <a href="#" className="text-white hover:text-cyan-400 transition-colors"><WhatsApp className="w-5 h-5" /></a>
                        <a href="#" className="text-white hover:text-cyan-400 transition-colors"><Discord className="w-5 h-5" /></a>
                        <a href="#" className="text-white hover:text-cyan-400 transition-colors"><Linkedin className="w-5 h-5" /></a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

import React, { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Monitor,
  Calendar,
  Gift,
  User,
  LogOut,
  Menu as MenuIcon,
  X as CloseIcon,
} from "lucide-react";
import logo from "../assets/images/auth_logo.png";
import logoCollapsed from "../assets/images/logo_collapsed.png";

const Sidebar = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const location = useLocation();
  const navigate = useNavigate();

  // Handle window resize for mobile state
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setIsMobileOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/player/dashboard" },
    { name: "Rooms", icon: Monitor, path: "/player/rooms" },
    { name: "Events", icon: Calendar, path: "/player/events" },
    { name: "Packs", icon: Gift, path: "/player/packs" },
  ];

  const handleItemClick = (path) => {
    navigate(path);
    if (isMobile) setIsMobileOpen(false);
  };

  const SidebarContent = (
    <div
      className={`fixed left-0 top-0 h-screen bg-[#24003E] transition-all duration-500 ease-in-out z-50 flex flex-col items-center pt-8 pb-6 border-r border-white/5 ${isMobile
        ? isMobileOpen
          ? "w-[280px] translate-x-0"
          : "w-[280px] -translate-x-full"
        : isHovered
          ? "w-[240px]"
          : "w-[88px]"
        }`}
      onMouseEnter={() => !isMobile && setIsHovered(true)}
      onMouseLeave={() => !isMobile && setIsHovered(false)}
    >
      {/* Logo Section */}
      <div className="mb-12 flex w-full justify-center transition-all duration-300">
        <img
          src={isHovered && !isMobile ? logo : isMobile ? logo : logoCollapsed}
          alt="Logo"
          style={{
            width: !isHovered && !isMobile ? "30px" : "130px",
            marginTop: !isHovered && !isMobile ? "10px" : "0",
          }}
          className="transition-all duration-300 object-contain"
        />
      </div>

      {/* Nav Items */}
      <nav className="flex-1 w-full space-y-4 px-3">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.name}
              onClick={() => handleItemClick(item.path)}
              className={`w-full flex items-center p-3 rounded-full mt-2 transition-all group ${!isHovered && !isMobile ? "justify-center" : "justify-start px-6 gap-4"} ${isActive
                ? "bg-[#1CF3CA]/10 text-[#FF89EB]"
                : "text-[#1CF3CA] hover:bg-[#1CF3CA] hover:text-black font-medium"
                }`}
            >
              <item.icon
                size={20}
                className={`flex-shrink-0 transition-colors ${isActive ? "text-[#FF89EB]" : "text-[#1CF3CA] group-hover:text-black"
                  }`}
              />
              <span
                className={`font-['Inter'] font-medium text-[14px] whitespace-nowrap transition-all duration-300 ${!isMobile && !isHovered
                  ? "opacity-0 -translate-x-4 pointer-events-none w-0 overflow-hidden"
                  : "opacity-100 translate-x-0"
                  }`}
              >
                {item.name}
              </span>
            </button>
          );
        })}
      </nav>

      {/* User Info Section */}
      <div className="w-full space-y-4 px-3 mt-auto pt-6 border-t border-white/5">
        <button
          onClick={() => handleItemClick("/player/profile")}
          className={`w-full flex items-center p-3 rounded-full text-[#1CF3CA] hover:bg-[#1CF3CA] hover:text-black transition-all ${!isHovered && !isMobile ? "justify-center" : "justify-start px-6 gap-4"}`}
        >
          <div className="w-8 h-8 rounded-full bg-[#1CF3CA]/10 flex items-center justify-center flex-shrink-0 border border-[#1CF3CA]/20 group">
            <User size={18} className="text-[#1CF3CA] group-hover:text-black transition-colors" />
          </div>
          <span
            className={`font-['Inter'] font-medium text-[14px] whitespace-nowrap transition-all duration-300 ${!isMobile && !isHovered
              ? "opacity-0 w-0 overflow-hidden"
              : "opacity-100"
              }`}
          >
            DAHMAX
          </span>
        </button>

        <button
          onClick={() => handleItemClick("/logout")}
          className={`w-full flex items-center p-3 rounded-full text-[#1CF3CA] hover:bg-[#1CF3CA] hover:text-black transition-all ${!isHovered && !isMobile ? "justify-center" : "justify-start px-6 gap-4"}`}
        >
          <LogOut size={20} className="flex-shrink-0 text-[#1CF3CA] group-hover:text-black transition-colors" />
          <span
            className={`font-['Inter'] font-medium text-[14px] whitespace-nowrap transition-all duration-300 ${!isMobile && !isHovered
              ? "opacity-0 w-0 overflow-hidden"
              : "opacity-100"
              }`}
          >
            Log Out
          </span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      {isMobile && (
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="fixed top-6 left-6 z-[60] text-white bg-[#24003E] p-2 rounded-lg border border-white/10 shadow-lg"
        >
          {isMobileOpen ? <CloseIcon size={24} /> : <MenuIcon size={24} />}
        </button>
      )}

      {/* Overlay for mobile */}
      {isMobile && isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm transition-all"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {SidebarContent}
    </>
  );
};

export default Sidebar;

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Gift } from "lucide-react";

const UserPacksTooltip = ({ user, isVisible, sidebarHovered }) => {
  if (!user) return null;

  const hasGamefyPack = !!user.packGamefyName;
  const hasCoachingPack = !!user.packCoachingName;

  const getStatusStyles = (status) => {
    switch (status) {
      case "ACTIVE":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "EXPIRED":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      case "CONSUMED":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      default:
        return "bg-white/5 text-white/40 border-white/10";
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: -10, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -10, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className={`fixed z-[100] pointer-events-none`}
          style={{
            left: sidebarHovered ? "250px" : "98px",
            bottom: "85px",
          }}
        >
          <div className="bg-[#24003E]/95 backdrop-blur-xl border border-[#1CF3CA]/30 rounded-2xl p-4 shadow-[0_0_30px_rgba(28,243,202,0.2)] min-w-[240px]">
            <div className="text-[#1CF3CA] font-bold text-xs uppercase tracking-wider mb-3 border-b border-[#1CF3CA]/10 pb-2">
              My Packs
            </div>
            
            <div className="space-y-4">
              {/* Gamefy Pack */}
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${hasGamefyPack ? 'bg-[#FF89EB]/10 text-[#FF89EB]' : 'bg-white/5 text-white/30'}`}>
                  <Gift size={16} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <div className="text-[10px] text-white/50 uppercase font-medium">Gamefy Pack</div>
                    {hasGamefyPack && (
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-bold ${getStatusStyles(user.packGamefyStatus)}`}>
                        {user.packGamefyStatus}
                      </span>
                    )}
                  </div>
                  <div className={`text-sm font-semibold ${hasGamefyPack ? 'text-white' : 'text-white/30 italic'}`}>
                    {user.packGamefyName || "No active pack"}
                  </div>
                </div>
              </div>

              {/* Coaching Pack */}
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${hasCoachingPack ? 'bg-[#1CF3CA]/10 text-[#1CF3CA]' : 'bg-white/5 text-white/30'}`}>
                  <Package size={16} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <div className="text-[10px] text-white/50 uppercase font-medium">Coaching Pack</div>
                    {hasCoachingPack && (
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-bold ${getStatusStyles(user.packCoachingStatus)}`}>
                        {user.packCoachingStatus}
                      </span>
                    )}
                  </div>
                  <div className={`text-sm font-semibold ${hasCoachingPack ? 'text-white' : 'text-white/30 italic'}`}>
                    {user.packCoachingName || "No active pack"}
                  </div>
                </div>
              </div>
            </div>

            {/* Indicator arrow */}
            <div className="absolute left-[-6px] bottom-[20px] w-3 h-3 bg-[#24003E] border-l border-b border-[#1CF3CA]/30 rotate-45"></div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UserPacksTooltip;

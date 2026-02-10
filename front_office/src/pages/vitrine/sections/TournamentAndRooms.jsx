import React from "react";
import event_img from "../../../assets/images/vitrine_page_images/event.png";
import rooms_img from "../../../assets/images/vitrine_page_images/rooms.png";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut"
    }
  }
};

const TournamentAndRooms = () => {
  return (
    <section className="relative bg-[#24003E] overflow-hidden font-['Inter']">
      {/* Background Glows shared across both parts */}
      <div className="absolute top-[10%] -right-48 w-[800px] h-[800px] bg-[#DD00B8] rounded-full blur-[180px] opacity-20 z-0"></div>
      <div className="absolute top-[5%] -left-48 w-[600px] h-[600px] bg-[#DD00B8] rounded-full blur-[180px] opacity-15 z-0"></div>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[#06F0F6] rounded-full blur-[200px] opacity-10 z-0"></div>

      {/* --- Tournament Part --- */}
      <div className="relative pt-24 pb-32 z-10 flex flex-col items-center">
        <div className="max-w-7xl mx-auto px-6 w-full flex justify-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.3 }}
            className="relative w-[1239px] h-[591px] rounded-[50px] overflow-hidden border border-white/5 shadow-[0_0_100px_rgba(0,0,0,0.5)] group"
          >
            {/* Main Image Background */}
            <div className="absolute inset-0 z-0">
              <img
                src={event_img}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                alt="Tournament"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            </div>

            {/* Content Overlay */}
            <div className="absolute inset-0 z-10 p-20 md:p-10 flex flex-col justify-end">
              <div className="flex flex-col lg:flex-row justify-between items-end gap-10">
                {/* Left Content */}
                <div className="max-w-xl pb-4">
                  <motion.h2 variants={itemVariants} className="text-[54px] font-bold leading-[1.1] mb-4 tracking-tight text-white uppercase drop-shadow-2xl">
                    <span
                      className="bg-clip-text text-transparent"
                      style={{
                        backgroundImage:
                          "linear-gradient(90deg, #FFFFFF 0%, #2BDFC8 45%)",
                      }}
                    >
                      TOURNAMENT NAME
                    </span>
                  </motion.h2>
                  <motion.p variants={itemVariants} className="text-white font-regular text-[16px] mb-4 leading-relaxed drop-shadow-lg opacity-90 max-w-lg">
                    Play in high-end gaming rooms equipped with pro setups,
                    ergonomic chairs, and immersive lighting for the ultimate
                    gaming experience.
                  </motion.p>

                  <motion.div variants={itemVariants}>
                    <button className="w-[196px] h-[64px] flex items-center justify-center bg-gradient-to-r from-[#DD00B8] to-[#1CF3CA] rounded-full font-medium text-[14px] text-white tracking-wide shadow-[0_0_30px_rgba(221,0,184,0.3)] hover:scale-105 transition-all uppercase">
                      Tournament Details
                    </button>
                  </motion.div>
                </div>

                {/* Countdown Card */}
                <motion.div variants={itemVariants} className="bg-black/10 backdrop-blur-xl p-8 rounded-[35px] min-w-[340px] text-center mb-3">
                  <p className="text-white/60 text-[11px] font-medium uppercase tracking-[0.3em] mb-6">
                    Tournament Start in:
                  </p>
                  <div className="flex justify-center items-center gap-6 text-white pb-2">
                    <div className="flex flex-col items-center">
                      <span className="text-5xl font-black">59</span>
                      <span className="text-[10px] uppercase tracking-widest mt-2 opacity-60">
                        Hours
                      </span>
                    </div>
                    <span className="text-4xl font-light opacity-50 mb-6">
                      :
                    </span>
                    <div className="flex flex-col items-center">
                      <span className="text-5xl font-black">59</span>
                      <span className="text-[10px] uppercase tracking-widest mt-2 opacity-60">
                        Minutes
                      </span>
                    </div>
                    <span className="text-4xl font-light opacity-50 mb-6">
                      :
                    </span>
                    <div className="flex flex-col items-center">
                      <span className="text-5xl font-black">59</span>
                      <span className="text-[10px] uppercase tracking-widest mt-2 opacity-60">
                        Seconds
                      </span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      {/* --- Rooms Part --- */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.3 }}
        className="relative pt-20 pb-24 z-10"
      >
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="mb-12">
            <motion.h2 variants={itemVariants} className="text-[54px] font-bold leading-[1] mb-6 tracking-tight text-white uppercase">
              DISCOVER{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(90deg, #FFFFFF 0%, #2BDFC8 45%)",
                }}
              >
                OUR ROOMS
              </span>
            </motion.h2>
            <motion.p variants={itemVariants} className="text-white font-regular text-20 max-w-2xl leading-relaxed opacity-80">
              Play in high-end gaming rooms equipped with pro setups, ergonomic
              chairs, and immersive lighting for the ultimate gaming experience.
            </motion.p>
          </div>

          {/* Simplified Rooms Asset */}
          <motion.div variants={itemVariants} className="relative flex justify-center mb-16">
            <img
              src={rooms_img}
              alt="Discover Our Rooms"
              className="w-full h-auto max-w-[1239px] rounded-[0px]"
            />
          </motion.div>

          {/* Stats Row */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-[1239px] mx-auto text-white text-center mb-16 px-4">
            <div className="flex flex-col items-center">
              <span className="text-[25px] font-black leading-tight">
                240k+
              </span>
              <span className="text-[18px] text-white mt-1">
                Booking
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[25px] font-black leading-tight">
                100k+
              </span>
              <span className="text-[18px] text-white mt-1" >
                Tournament & Workshops
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[25px] font-black leading-tight">4.9</span>
              <span className="text-[18px] text-white mt-1">
                Rating
              </span>
            </div>
          </motion.div>

          {/* Footer Actions */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-10 relative z-10">
            <a
              href="#"
              className="text-[#06F0F6] font-medium text-[16px] tracking-wide underline underline-offset-[12px] decoration-2 hover:text-white transition-all drop-shadow-md"
            >
              View Room Details
            </a>
            <button className="w-[196px] h-[64px] flex items-center justify-center bg-gradient-to-r from-[#DD00B8] to-[#1CF3CA] rounded-full font-medium text-[14px] text-white tracking-wide shadow-[0_0_30px_rgba(221,0,184,0.3)] hover:scale-105 transition-all uppercase">
              Book Yours Now!
            </button>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default TournamentAndRooms;

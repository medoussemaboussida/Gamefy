import React from "react";
import event_img from "../../../assets/images/vitrine_page_images/event.png";
import room_1 from "../../../assets/images/vitrine_page_images/room_1.png";
import room2 from "../../../assets/images/vitrine_page_images/room2.png";
import description_card_one from "../../../assets/images/vitrine_page_images/description_card_one.png";
import description_card_two from "../../../assets/images/vitrine_page_images/description_card_two.png";
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
    <section id="rooms-events" className="relative bg-[#24003E] overflow-hidden font-['Inter']">
      {/* Background Glows shared across both parts */}
      <div className="absolute top-[10%] -right-48 w-[800px] h-[800px] bg-[#DD00B8] rounded-full blur-[180px] opacity-20 z-0"></div>
      <div className="absolute top-[5%] -left-48 w-[600px] h-[600px] bg-[#DD00B8] rounded-full blur-[180px] opacity-15 z-0"></div>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[#06F0F6] rounded-full blur-[200px] opacity-10 z-0"></div>

      {/* --- Tournament Part --- */}
      <div className="relative pt-16 md:pt-20 lg:pt-24 pb-24 md:pb-28 lg:pb-32 z-10 flex flex-col items-center">
        <div className="max-w-7xl mx-auto px-4 md:px-6 w-full flex justify-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.3 }}
            className="relative w-full max-w-[1239px] min-h-[500px] md:min-h-[550px] lg:h-[591px] rounded-[30px] md:rounded-[40px] lg:rounded-[50px] overflow-hidden border border-white/5 shadow-[0_0_100px_rgba(0,0,0,0.5)] group"
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
            <div className="absolute inset-0 z-10 p-6 md:p-10 lg:p-20 flex flex-col justify-end">
              <div className="flex flex-col lg:flex-row justify-between items-end gap-6 md:gap-8 lg:gap-10">
                {/* Left Content */}
                <div className="max-w-xl pb-2 md:pb-4">
                  <motion.h2 variants={itemVariants} className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-bold leading-[1.1] mb-3 md:mb-4 tracking-tight text-white uppercase drop-shadow-2xl">
                    <span
                      className="bg-clip-text text-transparent"
                      style={{
                        backgroundImage:
                          "linear-gradient(90deg, #FFFFFF 0%, #2BDFC8 45%)",
                      }}
                    >
                      FIFA TOURNAMENT
                    </span>
                  </motion.h2>
                  <motion.p variants={itemVariants} className="text-white font-regular text-sm md:text-base lg:text-[16px] mb-3 md:mb-4 leading-relaxed drop-shadow-lg opacity-90 max-w-lg">
                    Play in high-end gaming rooms equipped with pro setups,
                    ergonomic chairs, and immersive lighting for the ultimate
                    gaming experience.
                  </motion.p>

                  <motion.div variants={itemVariants}>
                    <button className="w-full sm:w-[180px] md:w-[196px] h-[56px] md:h-[64px] flex items-center justify-center bg-gradient-to-r from-[#DD00B8] to-[#1CF3CA] rounded-full font-medium text-sm md:text-[14px] text-white tracking-wide shadow-[0_0_30px_rgba(221,0,184,0.3)] hover:scale-105 transition-all uppercase">
                      Tournament Details
                    </button>
                  </motion.div>
                </div>

                {/* Countdown Card */}
                <motion.div variants={itemVariants} className="bg-black/20 backdrop-blur-xl p-6 sm:p-8 rounded-[25px] md:rounded-[35px] w-full sm:w-auto min-w-0 sm:min-w-[320px] text-center mb-2 md:mb-3 border border-white/5">
                  <p className="text-white/60 text-[10px] md:text-[11px] font-medium uppercase tracking-[0.3em] mb-6">
                    Tournament Start in:
                  </p>
                  <div className="flex justify-center items-center gap-3 sm:gap-6 text-white pb-2 font-['Inter']">
                    <div className="flex flex-col items-center">
                      <span className="text-3xl sm:text-4xl md:text-5xl font-black">59</span>
                      <span className="text-[9px] md:text-[10px] uppercase tracking-widest mt-2 opacity-60">
                        Hours
                      </span>
                    </div>
                    <span className="text-2xl sm:text-3xl md:text-4xl font-light opacity-50 mb-6">
                      :
                    </span>
                    <div className="flex flex-col items-center">
                      <span className="text-3xl sm:text-4xl md:text-5xl font-black">59</span>
                      <span className="text-[9px] md:text-[10px] uppercase tracking-widest mt-2 opacity-60">
                        Minutes
                      </span>
                    </div>
                    <span className="text-2xl sm:text-3xl md:text-4xl font-light opacity-50 mb-6">
                      :
                    </span>
                    <div className="flex flex-col items-center">
                      <span className="text-3xl sm:text-4xl md:text-5xl font-black">59</span>
                      <span className="text-[9px] md:text-[10px] uppercase tracking-widest mt-2 opacity-60">
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
        className="relative pt-16 md:pt-20 pb-20 md:pb-24 z-10"
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          {/* Header */}
          <div className="mb-10 md:mb-12">
            <motion.h2 variants={itemVariants} className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-bold leading-[1] mb-4 md:mb-6 tracking-tight text-white uppercase">
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
            <motion.p variants={itemVariants} className="text-white font-regular text-base md:text-lg lg:text-20 max-w-2xl leading-relaxed opacity-80">
              Play in high-end gaming rooms equipped with pro setups, ergonomic
              chairs, and immersive lighting for the ultimate gaming experience.
            </motion.p>
          </div>

          {/* Simplified Rooms Asset */}
          <motion.div variants={itemVariants} className="relative w-full max-w-[1239px] mx-auto mb-24">
            <div className="flex flex-col md:flex-row gap-8 w-full">
              {/* Gaming Room Column */}
              <div className="flex flex-col gap-8 w-full md:w-1/2">
                <img
                  src={room_1}
                  alt="Gaming Room"
                  className="w-full h-auto"
                />
                <img
                  src={description_card_one}
                  alt="Gaming Room Details"
                  className="w-full h-auto"
                />
              </div>

              {/* VIP Room Column */}
              <div className="flex flex-col gap-8 w-full md:w-1/2">
                <img
                  src={room2}
                  alt="VIP Room"
                  className="w-full h-auto"
                />
                <img
                  src={description_card_two}
                  alt="VIP Room Details"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </motion.div>

          {/* Stats Row */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-10 max-w-[1239px] mx-auto text-white text-center mb-16 px-4">
            <div className="flex flex-col items-center">
              <span className="text-[20px] md:text-[25px] font-black leading-tight">
                240k+
              </span>
              <span className="text-[14px] md:text-[18px] text-white mt-1">
                Booking
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[20px] md:text-[25px] font-black leading-tight">
                100k+
              </span>
              <span className="text-[14px] md:text-[18px] text-white mt-1" >
                Tournament & Workshops
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[20px] md:text-[25px] font-black leading-tight">4.9</span>
              <span className="text-[14px] md:text-[18px] text-white mt-1">
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

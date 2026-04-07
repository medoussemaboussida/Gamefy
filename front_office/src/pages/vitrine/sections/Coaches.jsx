import React from "react";
import coaching_wallpaper from "../../../assets/images/vitrine_page_images/coaching_wallpaper.jpg";
import coach1 from "../../../assets/images/vitrine_page_images/coaches/coach_1.png";
import coach2 from "../../../assets/images/vitrine_page_images/coaches/coach_2.png";
import coach3 from "../../../assets/images/vitrine_page_images/coaches/coach_3.png";
import coach4 from "../../../assets/images/vitrine_page_images/coaches/coach_4.png";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

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

const Coaches = () => {
    const coachData = [
        { name: 'Haithem "Dean" Attaia', game: "League Of Legends", tag: "TFT", img: coach1 },
        { name: 'Foulen "Juggernaut" Foulen', game: "League Of Legends", tag: "TFT", img: coach2 },
        { name: 'Foulen "Skream" Foulen', game: "League Of Legends", tag: "TFT", img: coach3 },
        { name: 'Foulen "Heisen" Foulen', game: "League Of Legends", tag: "TFT", img: coach4 },
    ];
const navigate = useNavigate();
    return (
        <section id="coaches" className="relative py-24 min-h-[1200px] flex flex-col items-center overflow-hidden font-['Inter']">
            {/* Background Image & Overlay */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
                style={{ backgroundImage: `url(${coaching_wallpaper})` }}
            >
                <div className="absolute inset-0 bg-[#24003E]/40"></div>
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, amount: 0.3 }}
                className="max-w-7xl mx-auto px-4 md:px-6 relative z-10 text-center pt-16 md:pt-20 mb-16 md:mb-20"
            >
                <motion.h2 variants={itemVariants} className="text-4xl sm:text-5xl md:text-6xl lg:text-[62px] font-bold leading-[1.1] mb-6 md:mb-8 tracking-tight uppercase drop-shadow-2xl flex flex-col items-center">
                    <span
                        className="bg-clip-text text-transparent"
                        style={{ backgroundImage: "linear-gradient(90deg, #FFFFFF 0%, #2BDFC8 45%)" }}
                    >
                        RANK UP WITH
                    </span>
                    <span
                        className="bg-clip-text text-transparent"
                        style={{ backgroundImage: "linear-gradient(90deg, #FFFFFF 0%, #2BDFC8 45%)" }}
                    >
                        PROFESSIONAL COACHES
                    </span>
                </motion.h2>

                <motion.p variants={itemVariants} className="text-white font-normal text-base md:text-lg lg:text-[20px] max-w-3xl mx-auto leading-relaxed opacity-90 drop-shadow-lg">
                    Train faster with certified esports coaches. Get personalized feedback, strategy improvement, and mindset coaching for competitive games.
                </motion.p>
            </motion.div>

            {/* Coaches Grid */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, amount: 0.3 }}
                className="flex flex-wrap justify-center gap-3 md:gap-4 lg:gap-2 relative z-10 px-4"
            >
                {coachData.map((coach, index) => (
                    <motion.div
                        key={index}
                        variants={itemVariants}
                        className="w-full sm:w-[280px] md:w-[290px] lg:w-[297px] h-auto min-h-[400px] md:min-h-[403px] glass-card rounded-[9px] border border-white/10 backdrop-blur-md bg-white/5 p-4 flex flex-col group hover:border-[#2BDFC8]/30 transition-all duration-500"
                    >
                        {/* Coach Photo */}
                        <div className="relative w-full h-[280px] rounded-[9px] overflow-hidden mb-5">
                            <img
                                src={coach.img}
                                alt={coach.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute top-4 right-4 bg-[#06F0F6]/10 backdrop-blur-md w-[68px] h-[29px] rounded-full border border-[#06F0F6] flex items-center justify-center gap-1">
                                <svg className="w-[15px] h-[15px] text-[#06F0F6]" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                </svg>
                                <span className="text-white text-[19px] font-bold leading-none">4.9</span>
                            </div>
                        </div>

                        {/* Coach Info */}
                        <div className="px-2">
                            <h3 className="text-white font-normal text-[19px] mb-3 leading-tight tracking-tight">
                                {coach.name}
                            </h3>
                            <div className="flex items-center gap-2">
                                <span className="px-3 py-1 bg-[#2BDFC8]/10 border border-[#2BDFC8]/30 rounded-full text-[#2BDFC8] text-[12px] font-normal uppercase tracking-wider">
                                    {coach.game}
                                </span>
                                <span className="px-3 py-1 bg-[#2BDFC8]/10 border border-[#2BDFC8]/30 rounded-full text-[#2BDFC8] text-[12px] font-normal uppercase tracking-wider">
                                    {coach.tag}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Footer Actions */}
            <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-10 relative z-10">
                <a
                    href="#how"
                    className="text-[#06F0F6] font-medium text-[16px] tracking-wide underline underline-offset-[12px] decoration-2 hover:text-white transition-all drop-shadow-md"
                >
                    How Coaching Works?
                </a>
                <button className="bg-gradient-to-r from-[#DD00B8] to-[#1CF3CA] text-white px-12 py-5 rounded-full font-medium text-[16px] tracking-wide shadow-[0_0_30px_rgba(221,0,184,0.3)] hover:scale-105 transition-all uppercase group flex items-center gap-3">
                    Login to See All Coaches
                </button>
            </div>

            {/* Become a Coach CTA */}
            <div className="mt-24 w-full max-w-[1239px] relative z-10 px-4">
                <div className="glass-card rounded-[20px] border border-white/10 backdrop-blur-xl bg-white/5 p-12 flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="max-w-3xl">
                        
                        <h2 className="text-[62px] font-bold leading-tight mb-4 uppercase">
                            <span
                                className="bg-clip-text text-transparent"
                                style={{ backgroundImage: "linear-gradient(90deg, #FFFFFF 0%, #2BDFC8 45%)" }}
                            >
                                BECOME A COACH
                            </span>
                        </h2>
                        <p className="text-white text-[20px] font-normal leading-relaxed">
                            Share your experience, grow your reputation, and earn by coaching competitive players at Gamefy Academy.
                        </p>
                    </div>
                    <button className="bg-gradient-to-r from-[#DD00B8] to-[#1CF3CA] text-white px-12 py-5 rounded-full font-medium text-[16px] tracking-wide shadow-[0_0_30px_rgba(221,0,184,0.3)] hover:scale-105 transition-all uppercase whitespace-nowrap" onClick={() => navigate("/become-coach")}>
                        Login To Apply
                    </button>
                </div>
            </div>
        </section>
    );
};

export default Coaches;

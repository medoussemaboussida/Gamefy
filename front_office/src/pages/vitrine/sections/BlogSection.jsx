import blogs_img from "../../../assets/images/vitrine_page_images/blogs.png";
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

const BlogSection = () => {
    return (
        <section id="blog" className="relative py-24 bg-[#24003E] overflow-hidden font-['Inter']">
            {/* Background Glows */}
            <div className="absolute top-[-300px] -left-20 w-[700px] h-[700px] bg-[#DD00B8] rounded-full blur-[180px] opacity-25 z-0"></div>
            <div className="absolute bottom-1/4 -right-24 w-[600px] h-[600px] bg-[#06F0F6] rounded-full blur-[150px] opacity-15 z-0"></div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, amount: 0.3 }}
                className="max-w-7xl mx-auto px-4 md:px-6 relative z-10 text-center"
            >
                {/* Header */}
                <div className="mb-12 md:mb-16">
                    <motion.h2 variants={itemVariants} className="text-4xl sm:text-5xl md:text-6xl lg:text-[62px] font-bold leading-[1.1] mb-4 md:mb-6 tracking-tight uppercase">
                        <span
                            className="bg-clip-text text-transparent"
                            style={{ backgroundImage: "linear-gradient(90deg, #FFFFFF 0%, #2BDFC8 45%)" }}
                        >
                            BLOGS & NEWS
                        </span>
                    </motion.h2>
                    <motion.p variants={itemVariants} className="text-white font-normal text-base md:text-lg lg:text-[20px] max-w-3xl mx-auto leading-relaxed opacity-80">
                        Stay up to date with Gamefy events, community news, and esports content.
                    </motion.p>
                </div>

                {/* Featured Blog Card */}
                <motion.div variants={itemVariants} className="relative w-full max-w-[1239px] mx-auto rounded-[5px] overflow-hidden group border border-white/5 shadow-2xl">
                    <img
                        src={blogs_img}
                        alt="Gamefy x Pathe"
                        className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-1000"
                    />

                    {/* Content Overlay */}
                    <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10 lg:p-16">
                        {/* Partnership Badge */}
                        <div className="absolute top-6 left-6 md:top-8 md:left-8">
                            <span className="px-4 py-1.5 border border-[#06F0F6] rounded-full text-[#06F0F6] text-[12px] font-bold uppercase tracking-widest bg-[#06F0F6]/10 backdrop-blur-md">
                                PARTNERSHIP
                            </span>
                        </div>

                        <div className="flex flex-col md:flex-row items-end justify-between gap-6 md:gap-10">
                            <div className="max-w-3xl text-left">
                                <h3 className="text-3xl sm:text-4xl md:text-5xl lg:text-[60px] font-bold leading-[1.1] mb-3 md:mb-5 tracking-tight text-[#24003E] uppercase">
                                    GAMEFY X PATHE
                                </h3>
                                <p className="text-[#24003E] font-normal text-sm md:text-base lg:text-[16px] leading-relaxed max-w-2xl">
                                    Gamefy collaborated with Pathé to organize a large-scale esports and gaming event, uniting the local gaming community in a premium venue designed for entertainment and competition.
                                </p>
                            </div>

                            <div className="flex flex-col items-center gap-6">
                                <button className="bg-[#24003E] text-[#06F0F6] px-10 py-5 rounded-full font-medium text-[18px] tracking-wide hover:scale-105 transition-all uppercase shadow-lg">
                                    See Event Recap
                                </button>
                                <a href="#updates" className="text-[#24003E] text-[14px] font-bold underline underline-offset-4 hover:opacity-80 transition-all uppercase tracking-widest">
                                    Explore Updates
                                </a>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Carousel Indicators */}
                {/* <div className="flex justify-center gap-3 mt-12">
                    <div className="h-2 w-8 rounded-full bg-gradient-to-r from-[#DD00B8] to-[#2BDFC8]"></div>
                    <div className="h-2 w-8 rounded-full bg-white/20"></div>
                </div> */}

                {/* Newsletter Section */}
                <motion.div variants={itemVariants} className="mt-24 md:mt-32 w-full max-w-[1239px] mx-auto relative z-10 px-4 flex justify-center">
                    <div
                        className="glass-card rounded-[20px] border border-white/10 backdrop-blur-3xl bg-white/5 px-6 md:px-10 lg:px-12 py-10 md:py-0 flex flex-col lg:flex-row items-center justify-between gap-8 md:gap-12 w-full"
                        style={{ minHeight: '196px' }}
                    >
                        <div className="text-left w-full lg:w-auto">
                            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-bold leading-tight mb-3 md:mb-4 uppercase">
                                <span
                                    className="bg-clip-text text-transparent"
                                    style={{ backgroundImage: "linear-gradient(90deg, #FFFFFF 0%, #2BDFC8 45%)" }}
                                >
                                    SUBSCRIBE TO NEWSLETTER
                                </span>
                            </h2>
                            <p className="text-white text-sm md:text-base lg:text-[16px] font-normal leading-relaxed max-w-xl">
                                Share your experience, grow your reputation, and earn by coaching competitive players at Gamefy Academy.
                            </p>
                        </div>

                        {/* Subscription Form */}
                        <div className="w-full lg:max-w-md relative flex items-center">
                            <input
                                type="email"
                                placeholder="Enter your email address"
                                className="w-full bg-[#1b002e]/60 border border-white/20 rounded-full py-5 px-10 text-white placeholder:text-white/40 focus:outline-none focus:border-[#06F0F6]/50 transition-all text-lg"
                            />
                            <button className="absolute right-2 px-10 py-4 bg-gradient-to-r from-[#DD00B8] to-[#1CF3CA] rounded-full font-medium text-white text-[16px] hover:scale-105 transition-all shadow-lg">
                                Subscribe
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </section>
    );
};

export default BlogSection;

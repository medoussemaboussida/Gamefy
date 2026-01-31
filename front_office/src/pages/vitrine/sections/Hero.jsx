const Hero = () => {
    return (
        <section className="relative pt-64 pb-32 overflow-hidden">
            {/* Background Mesh/Glow for Header area */}
            <div className="absolute top-0 left-0 right-0 h-[600px] bg-gradient-to-b from-[#4b0082]/30 via-[#030014] to-transparent pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
                <h1 className="text-6xl md:text-[90px] font-black leading-[1] mb-12 tracking-tight">
                    <span className="text-white drop-shadow-md">JOIN</span>{" "}
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-cyan-400 to-teal-400">
                        GAMEFY ACADEMY
                    </span>
                    <br />
                    <span className="text-white">&</span>{" "}
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-cyan-400 to-teal-400">
                        UNLOCK YOUR FREE GIFT
                    </span>
                </h1>

                <p className="text-white font-medium text-lg md:text-xl max-w-4xl mx-auto mb-20 leading-tight opacity-70">
                    Play in premium gaming rooms, train with pro coaches, and earn exclusive in-game rewards.
                </p>

                <div className="flex flex-col sm:flex-row justify-center items-center gap-16">
                    <a href="#" className="text-cyan-400 font-bold text-xl tracking-wide underline underline-offset-[12px] decoration-2 hover:opacity-80 transition-opacity cursor-pointer">
                        Book a Room!
                    </a>

                    <button className="px-14 py-6 bg-gradient-to-r from-[#ec008c] via-[#8a2be2] to-cyan-400 rounded-full font-black text-white text-xl tracking-wide shadow-2xl shadow-purple-900/40 hover:scale-105 transition-transform">
                        Unlock Your Gift
                    </button>
                </div>
            </div>
        </section>
    );
};

export default Hero;

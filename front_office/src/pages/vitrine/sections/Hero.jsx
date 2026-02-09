import React from "react";
import vitrine_wallpaper from "../../../assets/images/vitrine_page_images/vitrine_wallpaper.jpg";
import partners_img from "../../../assets/images/vitrine_page_images/partners.png";

const Hero = () => {
    return (
        <section className="relative min-h-[950px] flex flex-col items-center justify-between overflow-hidden font-['Inter'] font-bold">
            {/* Background Image & Overlay */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
                style={{ backgroundImage: `url(${vitrine_wallpaper})` }}
            >
                <div className="absolute inset-0 bg-black/20"></div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 text-center relative z-10 pt-[250px] flex flex-col items-center">
                <h1 className="text-[63px] leading-[1.1] mb-8 tracking-tight text-white uppercase drop-shadow-2xl">
                    <span
                        className="bg-clip-text text-transparent"
                        style={{ backgroundImage: "linear-gradient(90deg, #FFFFFF 0%, #2BDFC8 45%)" }}
                    >
                        JOIN GAMEFY ACADEMY
                    </span>
                    <br />
                    <span className="text-white">&</span>{" "}
                    <span
                        className="bg-clip-text text-transparent"
                        style={{ backgroundImage: "linear-gradient(90deg, #FFFFFF 0%, #2BDFC8 45%)" }}
                    >
                        UNLOCK YOUR FREE GIFT
                    </span>
                </h1>

                <p className="text-white font-['Lato'] font-normal text-[21px] max-w-4xl mx-auto mb-16 leading-relaxed drop-shadow-lg opacity-90">
                    Play in premium gaming rooms, train with pro coaches, and earn exclusive in-game rewards on your first login.
                </p>

                <div className="flex flex-col sm:flex-row justify-center items-center gap-12">
                    <a
                        href="#"
                        className="text-[#06F0F6] font-medium text-[16px] tracking-wide underline underline-offset-[12px] decoration-2 hover:text-white transition-all drop-shadow-md"
                    >
                        Book a Room!
                    </a>

                    <button className="w-[196px] h-[64px] flex items-center justify-center bg-gradient-to-r from-[#DD00B8] to-[#1CF3CA] rounded-full font-medium text-[16px] text-white tracking-wide shadow-[0_0_30px_rgba(221,0,184,0.3)] hover:scale-105 transition-all uppercase">
                        Unlock Your Gift
                    </button>
                </div>
            </div>

            {/* Partners section at the bottom */}
            <div className="w-full pb-20 relative z-10 mt-auto overflow-hidden">
                <div className="animate-marquee">
                    <div className="flex shrink-0">
                        <img
                            src={partners_img}
                            alt="Partners"
                            className="h-12 md:h-16 px-20 object-contain brightness-0 invert opacity-70"
                        />
                        <img
                            src={partners_img}
                            alt="Partners"
                            className="h-12 md:h-16 px-20 object-contain brightness-0 invert opacity-70"
                        />
                    </div>
                    {/* Duplicate for infinite loop */}
                    <div className="flex shrink-0">
                        <img
                            src={partners_img}
                            alt="Partners"
                            className="h-12 md:h-16 px-20 object-contain brightness-0 invert opacity-70"
                        />
                        <img
                            src={partners_img}
                            alt="Partners"
                            className="h-12 md:h-16 px-20 object-contain brightness-0 invert opacity-70"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;

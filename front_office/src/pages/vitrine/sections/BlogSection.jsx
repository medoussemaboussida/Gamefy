const BlogSection = () => {
    return (
        <section className="py-20">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-black mb-4 uppercase text-[#333]">
                        BLOGS & <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-green-400">NEWS</span>
                    </h2>
                    <p className="text-black/50 font-medium max-w-xl mx-auto">
                        Stay updated with the latest trends, tournament results, and gaming news from our community.
                    </p>
                </div>

                {/* Featured Blog Card */}
                <div className="relative rounded-[2.5rem] overflow-hidden group border border-black/5 mb-8 aspect-[21/9] text-white">
                    <img
                        src="https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        alt="Gaming Community"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent"></div>

                    <div className="absolute bottom-10 left-10 right-10 flex flex-col md:flex-row justify-between items-end gap-6 text-left">
                        <div className="max-w-2xl">
                            <h3 className="text-2xl md:text-4xl font-black mb-3 tracking-tight">GAMEFY X PATHE: THE ULTIMATE PARTNERSHIP</h3>
                            <p className="text-white/70 text-sm md:text-base font-medium">We are proud to announce our partnership with Pathé Cinemas to bring you the biggest e-sports events on the big screen.</p>
                        </div>
                        <button className="px-10 py-4 bg-cyan-400 text-black rounded-full font-black tracking-widest text-sm hover:bg-white transition-all whitespace-nowrap">
                            READ FULL STORY
                        </button>
                    </div>
                </div>

                <div className="flex justify-center mt-12">
                    <button className="text-black/30 hover:text-cyan-400 font-black tracking-widest text-sm transition-all flex items-center gap-2">
                        VIEW ALL NEWS
                        <span className="text-xl">→</span>
                    </button>
                </div>
            </div>
        </section>
    );
};

export default BlogSection;

const Newsletter = () => {
    return (
        <section className="py-20 relative">
            <div className="max-w-7xl mx-auto px-4">
                <div className="bg-gradient-to-r from-purple-900/40 via-blue-900/40 to-black p-1 rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl">
                    <div className="bg-[#030014] rounded-[2.4rem] p-10 md:p-20 flex flex-col lg:flex-row justify-between items-center gap-12 text-white">
                        <div className="max-w-lg text-center lg:text-left">
                            <h2 className="text-4xl md:text-5xl font-black mb-4 uppercase tracking-tight">SUBSCRIBE TO <span className="text-cyan-400 italic underline decoration-white/20">NEWSLETTER</span></h2>
                            <p className="text-white/50 italic leading-snug font-medium">Don't miss any update! Join our list to stay in the loop about new tournaments and coaching availability.</p>
                        </div>

                        <div className="w-full max-w-md relative flex group">
                            <input
                                type="email"
                                placeholder="YOUR EMAIL ADDRESS"
                                className="w-full bg-white/[0.05] border border-white/10 rounded-full px-10 py-6 text-white placeholder:text-white/20 focus:outline-none focus:border-cyan-400/50 transition-all font-black text-sm tracking-widest"
                            />
                            <button className="absolute right-2.5 top-2.5 bottom-2.5 px-8 bg-gradient-to-r from-cyan-500 to-green-400 text-black rounded-full font-black text-xs tracking-widest hover:opacity-90 transition-opacity">
                                SUBSCRIBE
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Newsletter;

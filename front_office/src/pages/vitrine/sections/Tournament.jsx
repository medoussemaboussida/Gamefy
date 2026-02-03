const Tournament = () => {
    return (
        <section className="py-20 text-white">
            <div className="max-w-7xl mx-auto px-4">
                <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-purple-900/40 to-black border border-white/10 group">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-30 group-hover:scale-105 transition-transform duration-700"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>

                    <div className="relative z-10 p-8 md:p-16 flex flex-col md:flex-row justify-between items-center gap-12">
                        <div className="max-w-xl text-center md:text-left">
                            <h2 className="text-4xl md:text-5xl font-black mb-4 text-cyan-400">TOURNAMENT <span className="text-white">NAME</span></h2>
                            <p className="text-white/60 text-lg mb-8">
                                Join the ultimate battle and prove your skills. Compete with the best players and win amazing prizes.
                            </p>
                            <button className="px-8 py-3 bg-white text-black rounded-full font-bold hover:bg-cyan-400 transition-colors">
                                JOIN TOURNAMENT
                            </button>
                        </div>

                        <div className="bg-black/40 backdrop-blur-xl p-8 rounded-2xl border border-white/10 flex gap-6 md:gap-10">
                            {[
                                { label: "Days", value: "59" },
                                { label: "Hours", value: "59" },
                                { label: "Minutes", value: "59" }
                            ].map((item) => (
                                <div key={item.label} className="text-center">
                                    <div className="text-4xl md:text-5xl font-black text-white mb-1">{item.value}</div>
                                    <div className="text-xs uppercase tracking-widest text-white/50">{item.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Tournament;

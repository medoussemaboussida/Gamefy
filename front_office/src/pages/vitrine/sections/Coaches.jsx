const Coaches = () => {
    const coaches = [
        { name: "Coach X", role: "FPS Pro", img: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&q=80" },
        { name: "Coach Y", role: "MOBA Specialist", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80" },
        { name: "Coach Z", role: "Strategy Guru", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80" },
        { name: "Coach K", role: "E-sports Mental", img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80" }
    ];

    return (
        <section className="py-20 relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-1 bg-gradient-to-r from-transparent via-purple-600/20 to-transparent rotate-12"></div>

            <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
                <h2 className="text-4xl md:text-6xl font-[900] mb-4 uppercase text-[#333]">
                    RANK UP WITH <br />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#ff00ff] via-purple-600 to-cyan-400 italic">PROFESSIONAL COACHES</span>
                </h2>

                <p className="text-black/40 font-medium max-w-2xl mx-auto mb-16">
                    Learn from elite players who have dominated the professional scene and are ready to share their secrets with you.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 text-white">
                    {coaches.map((coach) => (
                        <div key={coach.name} className="group relative rounded-2xl overflow-hidden border border-black/5 bg-white shadow-xl transition-all hover:border-cyan-400/50">
                            <div className="h-72 overflow-hidden">
                                <img src={coach.img} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={coach.name} />
                            </div>
                            <div className="p-6 text-left">
                                <h3 className="text-xl font-black mb-1 group-hover:text-cyan-400 transition-colors uppercase italic text-black">{coach.name}</h3>
                                <p className="text-black/40 text-xs font-black tracking-widest uppercase">{coach.role}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA Card */}
                <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] p-8 md:p-12 rounded-[2rem] border border-white/10 flex flex-col md:flex-row justify-between items-center gap-8 text-left text-white">
                    <div>
                        <h3 className="text-3xl md:text-4xl font-black uppercase mb-2">BECOME A COACH</h3>
                        <p className="text-white/50 max-w-lg font-medium">Are you a professional player looking to share your passion and expertise with new generations of gamers?</p>
                    </div>
                    <button className="whitespace-nowrap px-10 py-5 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full font-black text-white shadow-xl hover:shadow-pink-500/20 transition-all transform hover:scale-105 tracking-widest text-sm">
                        APPLY TODAY
                    </button>
                </div>
            </div>
        </section>
    );
};

export default Coaches;

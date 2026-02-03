const Rooms = () => {
    const rooms = [
        { name: "Gaming Room", icon: "🎮", count: "20+", image: "https://images.unsplash.com/photo-1598550476439-6847785fce66?auto=format&fit=crop&q=80" },
        { name: "VIP Room", icon: "👑", count: "10+", image: "https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&q=80" }
    ];

    return (
        <section className="py-20 bg-black/5 text-white">
            <div className="max-w-7xl mx-auto px-4">
                <div className="mb-16">
                    <h2 className="text-4xl md:text-5xl font-black mb-4 uppercase text-black">
                        DISCOVER <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-green-400">OUR ROOMS</span>
                    </h2>
                    <p className="text-black/50 max-w-xl font-medium">
                        Choose the perfect environment for your gaming sessions, from common areas to exclusive VIP suites.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    {rooms.map((room) => (
                        <div key={room.name} className="group relative h-80 rounded-3xl overflow-hidden border border-white/10">
                            <img src={room.image} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={room.name} />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>

                            <div className="absolute bottom-6 left-6 flex justify-between items-center w-[calc(100%-48px)]">
                                <div>
                                    <h3 className="text-2xl font-bold mb-1">{room.name}</h3>
                                    <div className="flex gap-4 text-xs text-white/50">
                                        <span className="flex items-center gap-1 uppercase">PC HIGH-END</span>
                                        <span className="flex items-center gap-1 uppercase">PRO CHAIRS</span>
                                    </div>
                                </div>
                                <div className="bg-white text-black font-bold px-4 py-2 rounded-xl text-sm italic">
                                    {room.count}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-center">
                    <button className="px-10 py-4 border border-cyan-400 text-cyan-400 rounded-full font-black tracking-widest text-sm hover:bg-cyan-400 hover:text-white transition-all">
                        BOOK YOUR ROOM
                    </button>
                </div>
            </div>
        </section>
    );
};

export default Rooms;

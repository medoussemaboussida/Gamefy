const Partners = () => {
    const partners = ["Spotify", "NETFLIX", "Notion", "Brex", "deel.", "COMPASS"];

    return (
        <section className="py-24">
            <div className="max-w-[1400px] mx-auto px-8">
                <div className="flex flex-wrap justify-between items-center gap-12 opacity-40">
                    {partners.map((partner) => (
                        <div key={partner} className="text-3xl md:text-6xl font-black tracking-tighter text-black grayscale">
                            {partner}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Partners;

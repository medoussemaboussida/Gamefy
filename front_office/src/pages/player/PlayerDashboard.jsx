import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { Search, CircleDot, ArrowRight } from 'lucide-react';
import NotificationBell from '../../components/NotificationBell';
import roomImg from '../../assets/images/room.png';
import eventImg from '../../assets/images/vitrine_page_images/blogs.png';
import packsImg from '../../assets/images/packs.png';
import { getUserId } from '../../utils/jwt';
import { profileApi } from '../../api/profile';

const PlayerDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            const userId = getUserId();
            if (userId) {
                try {
                    const data = await profileApi.getProfile(userId);
                    setUser(data);
                } catch (error) {
                    console.error("Dashboard user fetch failed", error);
                }
            }
        };
        fetchUser();
    }, []);

    const roomFeatures = [
        "High-End PCs",
        "Pro Headsets",
        "Premium Chairs",
        "RGB Lighting"
    ];

    const eventFeatures = [
        "Major Tournaments",
        "Community Events",
        "Live Streaming",
        "Win Prizes"
    ];

    const packFeatures = [
        "Bulk Hours Discount",
        "Snacks included",
        "Special Offers",
        "Member Benefits"
    ];

    const DashboardCard = ({ image, title, features, borderRadius = "50px", onClick }) => (
        <div 
            onClick={onClick}
            className="group flex flex-col w-full max-w-[424px] transform transition-all duration-500 hover:scale-[1.03] cursor-pointer relative"
        >
            <div className="relative overflow-hidden" style={{ borderRadius }}>
                {/* Top Shadow Overlay */}
                <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
                
                <img
                    src={image}
                    alt={title}
                    className="w-full aspect-[540/592] object-cover shadow-2xl transition-transform duration-700 group-hover:scale-110"
                />
            </div>
            
            <div className="mt-4 md:mt-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] p-6 md:p-8 space-y-3 md:space-y-4 flex flex-col transition-all duration-500 group-hover:bg-white/10 group-hover:border-[#1CF3CA]/30">
                <div className="flex items-center justify-between">
                    <h3 className="text-white text-[24px] md:text-[39.41px] font-medium font-['Inter'] transition-colors duration-300 group-hover:text-white">
                        {title}
                    </h3>
                    <ArrowRight 
                        size={32} 
                        className="text-[#1CF3CA] opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 ease-out"
                    />
                </div>
                <div className="grid grid-cols-2 gap-y-2 md:gap-y-3 gap-x-4 md:gap-x-6">
                    {features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                            <CircleDot size={14} className="md:size-[18px] text-[#1CF3CA]" />
                            <span className="text-white/70 text-[10px] md:text-[12px] font-normal font-['Inter']">
                                {feature}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="h-screen bg-[#24003E] flex overflow-hidden">
            <Sidebar />
            <main className="flex-1 px-4 md:px-12 pt-6 pb-12 transition-all duration-300 overflow-y-auto">
                <div className="max-w-[1400px] mx-auto space-y-10 md:space-y-16 flex flex-col items-center">
                    <header className="flex items-center justify-between w-full h-10">
                        <h2 className="text-white text-[18px] font-bold font-['Inter'] pl-14 md:pl-0">
                            Player Dashboard
                        </h2>
                        <div className="flex items-center gap-4 md:gap-6">
                            <NotificationBell />
                        </div>
                    </header>

                    <div className="flex justify-center text-center w-full px-4">
                        <h1 className="text-[32px] md:text-[50px] font-black font-['Inter'] leading-tight md:leading-none tracking-tight">
                            <span className="bg-gradient-to-r from-white to-[#2BDFC8] bg-clip-text text-transparent uppercase">
                                WELCOME BACK , <br className="md:hidden" /> {user ? `${user.firstName} ${user.lastName}` : "..."} !
                            </span>
                        </h1>
                    </div>

                    {/* Cards Grid */}
                    <div className="flex flex-wrap justify-center gap-8 md:gap-12 w-full">
                        <DashboardCard
                            image={roomImg}
                            title="Discover Our Rooms"
                            features={roomFeatures}
                            borderRadius="50px"
                            onClick={() => navigate('/player/rooms')}
                        />
                        <DashboardCard
                            image={eventImg}
                            title="Upcoming Events"
                            features={eventFeatures}
                            borderRadius="36px"
                            onClick={() => navigate('/events')}
                        />
                        <DashboardCard
                            image={packsImg}
                            title="Gaming & Coaching Packs"
                            features={packFeatures}
                            borderRadius="50px"
                            onClick={() => navigate('/player/packs')}
                        />
                    </div>

                    {/* Stats Section */}
                    <div className="w-full max-w-[800px] border-t border-white/5 mt-1 pt-8 pb-12">
                        <div className="flex flex-wrap justify-around items-center gap-4 md:gap-10 px-4 text-center">
                            <div className="flex flex-col items-center">
                                <span className="text-white text-[24px] md:text-[32px] font-black tracking-tight leading-none">240k+</span>
                                <span className="text-white/30 text-[9px] md:text-[10px] font-medium uppercase tracking-[0.2em] mt-1.5">Booking</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="text-white text-[24px] md:text-[32px] font-black tracking-tight leading-none">100k+</span>
                                <span className="text-white/30 text-[9px] md:text-[10px] font-medium uppercase tracking-[0.2em] mt-1.5 text-center max-w-[120px] md:max-w-none">Tournament & Workshops</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="text-white text-[24px] md:text-[32px] font-black tracking-tight leading-none">4.9</span>
                                <span className="text-white/30 text-[9px] md:text-[10px] font-medium uppercase tracking-[0.2em] mt-1.5">Rating</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PlayerDashboard;

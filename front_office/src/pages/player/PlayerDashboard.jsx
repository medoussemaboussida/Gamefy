import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { Search, CircleDot } from 'lucide-react';
import NotificationBell from '../../components/NotificationBell';
import roomImg from '../../assets/images/room.png';
import eventImg from '../../assets/images/event.png';
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

    const features = [
        "High-End PCs",
        "Pro Headsets",
        "Premium Chairs",
        "RGB Lighting"
    ];

    const DashboardCard = ({ image, title, features, borderRadius = "50px", onClick }) => (
        <div 
            onClick={onClick}
            className="flex flex-col w-full max-w-[540px] transform transition-all duration-300 hover:scale-[1.02] cursor-pointer"
        >
            <img
                src={image}
                alt={title}
                className="w-full aspect-[540/592] object-cover shadow-2xl"
                style={{ borderRadius }}
            />
            <div className="mt-4 md:mt-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] p-6 md:p-8 space-y-3 md:space-y-4">
                <h3 className="text-white text-[24px] md:text-[39.41px] font-medium font-['Inter']">
                    {title}
                </h3>
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
                    <div className="flex flex-wrap justify-center gap-8 md:gap-12 pb-12 w-full">
                        <DashboardCard
                            image={roomImg}
                            title="Discover Our Rooms !"
                            features={features}
                            borderRadius="50px"
                            onClick={() => navigate('/player/rooms')}
                        />
                        <DashboardCard
                            image={eventImg}
                            title="Upcoming Events"
                            features={features}
                            borderRadius="36px"
                            onClick={() => navigate('/events')}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PlayerDashboard;

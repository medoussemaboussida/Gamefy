import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { Search, Bell, CircleDot } from 'lucide-react';
import roomImg from '../../assets/images/room.png';
import eventImg from '../../assets/images/event.png';
import { getUserId } from '../../utils/jwt';
import { profileApi } from '../../api/profile';

const PlayerDashboard = () => {
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

    const DashboardCard = ({ image, title, features, borderRadius = "50px" }) => (
        <div className="flex flex-col w-full max-w-[540px] transform transition-all duration-300 hover:scale-[1.02]">
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
        <div className="min-h-screen bg-[#24003E] flex overflow-hidden">
            <Sidebar />
            <main className="flex-1 px-10 md:px-12 pt-8 pb-12 transition-all duration-300 overflow-y-auto">
                <div className="max-w-[1400px] mx-auto space-y-10 md:space-y-16 flex flex-col items-center">
                    {/* Header Section */}
                    <header className="flex flex-col md:flex-row items-center justify-between w-full gap-6 md:gap-0">
                        <h2 className="text-white text-[18px] font-bold font-['Inter'] self-start md:self-auto pl-14 md:pl-0">
                            Player Dashboard
                        </h2>

                        <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto">
                            {/* Search Bar */}
                            <div className="relative group flex-1 md:flex-none">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                    <Search size={18} className="text-[#1CF3CA]" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search"
                                    className="w-full md:w-[380px] h-[40px] bg-transparent border border-[#1CF3CA]/40 rounded-full pl-11 pr-4 text-white text-[14px] font-medium font-['Inter'] placeholder:text-white/40 focus:outline-none focus:border-[#1CF3CA] transition-all"
                                />
                            </div>

                            {/* Notification Icon */}
                            <button className="relative p-2 text-[#1CF3CA] hover:bg-white/5 rounded-full transition-all flex-shrink-0">
                                <Bell size={24} />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-[#FF89EB] rounded-full"></span>
                            </button>
                        </div>
                    </header>

                    <div className="flex justify-center text-center w-full px-4">
                        <h1 className="text-[32px] md:text-[64px] font-black font-['Inter'] leading-tight md:leading-none tracking-tight">
                            <span className="bg-gradient-to-r from-white to-[#2BDFC8] bg-clip-text text-transparent uppercase">
                                WELCOME BACK , <br className="md:hidden" /> {user ? user.firstName : "..."} !
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
                        />
                        <DashboardCard
                            image={eventImg}
                            title="Upcoming Events"
                            features={features}
                            borderRadius="36px"
                        />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PlayerDashboard;

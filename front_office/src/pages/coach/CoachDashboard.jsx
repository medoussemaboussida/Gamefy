import React from "react";
import Sidebar from "../../components/Sidebar";
import { Search, Bell, MoreHorizontal, ChevronDown } from "lucide-react";

const CoachDashboard = () => {
  const sessions = [
    {
      id: 1,
      user: "Dahmax",
      time: "3PM To 5PM",
      price: "80TND",
      status: "PENDING",
      statusColor: "bg-[#7B6600] text-[#CEB22D]",
    },
    {
      id: 2,
      user: "LOUJEY",
      time: "3PM To 5PM",
      price: "80TND",
      status: "CONFIRMED",
      statusColor: "bg-[#242C11] text-[#48CE2F]",
    },
    {
      id: 3,
      user: "D0wn",
      time: "3PM To 5PM",
      price: "80TND",
      status: "REJECTED",
      statusColor: "bg-[#360200] text-[#DE3D3D]",
    },
  ];

  return (
    <div className="min-h-screen bg-[#24003E] flex overflow-hidden">
      <Sidebar />
      <main className="flex-1 md:ml-[88px] px-10 md:px-12 pt-8 pb-12 transition-all duration-300 overflow-y-auto">
        <div className="max-w-[1400px] mx-auto space-y-10 md:space-y-16">
          {/* Header Section */}
          <header className="flex flex-col md:flex-row items-center justify-between w-full gap-6 md:gap-0">
            <h2 className="text-white text-[18px] font-bold font-['Inter'] self-start md:self-auto pl-14 md:pl-0">
              Coach Dashboard
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

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full">
            {/* Sessions Card */}
            <div className="bg-[#582167] border border-white/5 rounded-[32px] p-8 relative h-[137px] flex flex-col justify-between group hover:border-[#1CF3CA]/30 transition-all">
              <div className="flex justify-between items-center">
                <span className="text-white/80 text-[16px] font-medium font-['Inter']">
                  Sessions
                </span>
                <MoreHorizontal className="text-white/40 cursor-pointer" />
              </div>
              <div className="text-white text-[32px] font-bold font-['Inter']">
                14
              </div>
            </div>

            {/* Booked Packs Card */}
            <div className="bg-[#582167] border border-white/5 rounded-[32px] p-8 relative h-[137px] flex flex-col justify-between group hover:border-[#1CF3CA]/30 transition-all">
              <div className="flex justify-between items-center">
                <span className="text-white/80 text-[16px] font-medium font-['Inter']">
                  Booked Packs
                </span>
                <MoreHorizontal className="text-white/40 cursor-pointer" />
              </div>
              <div className="text-white text-[32px] font-bold font-['Inter']">
                55
              </div>
            </div>
          </div>

          {/* Latest Coaching Sessions Section */}
          <div className="border border-[#1CF3CA]/30 rounded-[32px] p-8 md:p-12 bg-black/10 backdrop-blur-sm">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6">
              <h3 className="text-white text-[16px] font-bold font-['Inter']">
                Latest coaching sessions
              </h3>
              <button className="bg-gradient-to-r  from-[#DD00B8] to-[#2BDFC8] px-6 py-2 rounded-[18px] text-white font-medium flex items-center gap-2 hover:opacity-90 transition-all text-[15px]">
                Sort by newest <ChevronDown size={18} />
              </button>
            </div>

            <div className="overflow-x-auto w-full">
              <table className="w-full border-collapse">
                <thead>
                  {/* Optional: Add headers if needed, but screenshot shows a list style */}
                </thead>
                <tbody>
                  {sessions.map((session, index) => (
                    <tr
                      key={session.id}
                      className={`${index !== sessions.length - 1 ? "border-b border-[#1CF3CA]/30" : ""}`}
                    >
                      <td className="py-8">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                          <div className="text-white text-[14px] font-medium font-['Inter'] text-center md:text-left">
                            Reservation By{" "}
                            <span className="text-[#1CF3CA] font-bold">
                              {session.user}
                            </span>{" "}
                            From {session.time} - {session.price}
                          </div>
                          <button
                            className={`${session.statusColor} px-6 py-2 rounded-[18px] text-[14px] font-medium flex items-center gap-2 w-[150px] justify-center hover:opacity-80 transition-all`}
                          >
                            {session.status} <ChevronDown size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CoachDashboard;

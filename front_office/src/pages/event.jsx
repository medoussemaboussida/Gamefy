import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { Search, Bell, Calendar, MapPin, ExternalLink, Loader2, ChevronDown, Filter } from "lucide-react";
import { eventApi } from "../api/event";
import toast from "react-hot-toast";

const EventsPage = () => {
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("ALL");
    const [isStatusOpen, setIsStatusOpen] = useState(false);
    const [userParticipations, setUserParticipations] = useState([]);

    const statusOptions = [
        { value: "ALL", label: "All Statuses" },
        { value: "SCHEDULED", label: "Scheduled" },
        { value: "ONGOING", label: "Ongoing" },
        { value: "COMPLETED", label: "Completed" },
        { value: "CANCELLED", label: "Cancelled" },
    ];

    const fetchEvents = async () => {
        try {
            setIsLoading(true);
            const [eventsData, participationsData] = await Promise.all([
                eventApi.getAllEvents(),
                eventApi.getMyParticipations()
            ]);
            setEvents(eventsData);
            setUserParticipations(participationsData.map(p => p.eventId));
        } catch (error) {
            toast.error("Failed to load events", {
                style: {
                    border: '1px solid #DE3D3D',
                    padding: '16px',
                    color: '#DE3D3D',
                    background: '#360200',
                },
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const filteredEvents = events.filter(event => {
        const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.place.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = selectedStatus === "ALL" || event.eventStatus === selectedStatus;
        return matchesSearch && matchesStatus;
    });

    const formatDate = (dateString) => {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case "SCHEDULED": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
            case "ONGOING": return "bg-green-500/20 text-green-400 border-green-500/30";
            case "COMPLETED": return "bg-gray-500/20 text-gray-400 border-gray-500/30";
            case "CANCELLED": return "bg-red-500/20 text-red-400 border-red-500/30";
            default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
        }
    };

    const handleParticipate = async (eventId) => {
        try {
            await eventApi.participateInEvent(eventId);
            setUserParticipations([...userParticipations, eventId]);
            toast.success("Successfully registered for the event", {
                style: {
                    border: '1px solid #1CF3CA',
                    padding: '16px',
                    color: '#1CF3CA',
                    background: '#24003E',
                    boxShadow: '0 0 15px rgba(28, 243, 202, 0.4)',
                },
            });
        } catch (error) {
            toast.error(error.response?.data || "Failed to register", {
                style: {
                    border: '1px solid #DE3D3D',
                    padding: '16px',
                    color: '#DE3D3D',
                    background: '#360200',
                },
            });
        }
    };

    const handleCancel = async (eventId) => {
        try {
            await eventApi.cancelParticipation(eventId);
            setUserParticipations(userParticipations.filter(id => id !== eventId));
            toast.success("Successfully cancelled participation", {
                style: {
                    border: '1px solid #1CF3CA',
                    padding: '16px',
                    color: '#1CF3CA',
                    background: '#24003E',
                    boxShadow: '0 0 15px rgba(28, 243, 202, 0.4)',
                },
            });
        } catch (error) {
            toast.error(error.message || "Failed to cancel", {
                style: {
                    border: '1px solid #DE3D3D',
                    padding: '16px',
                    color: '#DE3D3D',
                    background: '#360200',
                },
            });
        }
    };


    if (isLoading) {
        return (
            <div className="h-screen bg-[#24003E] flex overflow-hidden">
                <Sidebar />
                <main className="flex-1 md:ml-[88px] flex items-center justify-center">
                    <Loader2 size={48} className="text-[#1CF3CA] animate-spin" />
                </main>
            </div>
        );
    }

    return (
        <div className="h-screen bg-[#24003E] flex overflow-hidden font-sans">
            <Sidebar />

            <main className="flex-1 px-10 md:px-12 pt-8 pb-12 transition-all duration-300 overflow-y-auto">
                <div className="max-w-[1400px] mx-auto space-y-12">

                    {/* Header Section */}
                    <header className="flex flex-col md:flex-row items-center justify-between w-full gap-6 md:gap-0">
                        <h2 className="text-white text-[18px] font-bold font-['Inter'] self-start md:self-auto pl-14 md:pl-0">
                            Upcoming Events
                        </h2>

                        <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto">
                            {/* Search Bar */}
                            <div className="relative group flex-1 md:flex-none">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                    <Search size={18} className="text-[#1CF3CA]" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search events..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full md:w-[380px] h-[40px] bg-transparent border border-[#1CF3CA]/40 rounded-full pl-11 pr-4 text-white text-[14px] font-medium font-['Inter'] placeholder:text-white/40 focus:outline-none focus:border-[#1CF3CA] transition-all"
                                />
                            </div>

                            {/* Status Filter Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsStatusOpen(!isStatusOpen)}
                                    className="bg-gradient-to-r from-[#DD00B8] to-[#2BDFC8] px-6 h-[40px] rounded-[18px] text-white font-medium flex items-center gap-2 hover:opacity-90 transition-all text-[15px]"
                                >
                                    <Filter size={18} />
                                    <span>{statusOptions.find(opt => opt.value === selectedStatus)?.label}</span>
                                    <ChevronDown size={18} className={`transition-transform duration-300 ${isStatusOpen ? "rotate-180" : ""}`} />
                                </button>

                                {isStatusOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-10"
                                            onClick={() => setIsStatusOpen(false)}
                                        ></div>
                                        <div className="absolute right-0 mt-3 w-56 bg-[#320141]/95 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-2 z-20 animate-in fade-in zoom-in duration-200">
                                            {statusOptions.map((option) => (
                                                <button
                                                    key={option.value}
                                                    onClick={() => {
                                                        setSelectedStatus(option.value);
                                                        setIsStatusOpen(false);
                                                    }}
                                                    className={`w-full flex items-center px-5 py-3 rounded-2xl text-[14px] font-medium transition-all ${selectedStatus === option.value
                                                        ? "bg-[#1CF3CA] text-black"
                                                        : "text-white/70 hover:bg-white/5 hover:text-white"
                                                        }`}
                                                >
                                                    {option.label}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Notification Icon */}
                            <button className="relative p-2 text-[#1CF3CA] hover:bg-white/5 rounded-full transition-all flex-shrink-0">
                                <Bell size={24} />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-[#FF89EB] rounded-full"></span>
                            </button>
                        </div>
                    </header>

                    {/* Events Horizontal Scroll Section */}
                    <div className="space-y-8">
                        <div className="flex flex-col gap-2">
                            <h1 className="text-[32px] md:text-[54px] font-black font-['Inter'] leading-tight tracking-tight uppercase">
                                <span className="bg-gradient-to-r from-white to-[#2BDFC8] bg-clip-text text-transparent">
                                    Discover platform events
                                </span>
                            </h1>
                            <p className="text-white/60 text-lg font-medium">Join our gaming community in epic tournaments and meetups.</p>
                        </div>

                        {filteredEvents.length === 0 ? (
                            <div className="bg-[#320141] border border-white/5 rounded-[50px] p-20 flex flex-col items-center justify-center text-center space-y-4">
                                <div className="p-6 bg-white/5 rounded-full text-[#1CF3CA]">
                                    <Calendar size={48} />
                                </div>
                                <h3 className="text-2xl font-bold text-white uppercase italic tracking-wider">No Events Found</h3>
                                <p className="text-white/40">Try searching for something else or check back later!</p>
                            </div>
                        ) : (
                            <div className="flex overflow-x-auto gap-8 pb-12 snap-x no-scrollbar custom-scrollbar-h">
                                {filteredEvents.map((event) => (
                                    <div
                                        key={event.id}
                                        className="flex-shrink-0 w-full max-w-[450px] snap-center transform transition-all duration-500 hover:translate-y-[-10px]"
                                    >
                                        <div className="relative group h-full">
                                            {/* Glow Effect */}
                                            <div className="absolute -inset-1 bg-gradient-to-r from-[#DD00B8] to-[#1CF3CA] rounded-[50px] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>

                                            <div className="relative bg-[#320141] border border-white/5 rounded-[50px] overflow-hidden h-full flex flex-col shadow-2xl">
                                                {/* Image Section */}
                                                <div className="relative h-[250px] overflow-hidden">
                                                    {event.photo ? (
                                                        <img
                                                            src={`http://localhost:8080/api/uploads/event_photos/${event.photo}`}
                                                            alt={event.title}
                                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-[#24003E] flex items-center justify-center">
                                                            <Calendar size={64} className="text-white/10" />
                                                        </div>
                                                    )}
                                                    <div className="absolute top-6 right-6">
                                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border backdrop-blur-md ${getStatusStyle(event.eventStatus)}`}>
                                                            {event.eventStatus}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Content Section */}
                                                <div className="p-8 flex flex-col flex-grow bg-gradient-to-b from-transparent to-black/30">
                                                    <div className="flex-grow space-y-4">
                                                        <h3 className="text-xl md:text-xl font-black text-white italic truncate uppercase tracking-tight">
                                                            {event.title}
                                                        </h3>

                                                        <div className="space-y-3">
                                                            <div className="flex items-center gap-3 text-white/70 font-medium">
                                                                <Calendar size={18} className="text-[#1CF3CA]" />
                                                                <span className="text-sm">{formatDate(event.startTime)}</span>
                                                            </div>
                                                            <div className="flex items-center gap-3 text-white/70 font-medium">
                                                                <MapPin size={18} className="text-[#FF89EB]" />
                                                                <span className="text-sm">{event.place}</span>
                                                            </div>
                                                        </div>

                                                        <p className="text-white/40 text-sm line-clamp-3 leading-relaxed pt-2">
                                                            {event.description}
                                                        </p>
                                                    </div>

                                                    {/* Participation Logic */}
                                                    <div className="pt-8 w-full">
                                                        {new Date(event.endTime) < new Date() ? (
                                                            <div className="w-full px-8 py-4 bg-white/5 text-white/40 font-black uppercase tracking-widest rounded-full text-center border border-white/5">
                                                                This event has passed
                                                            </div>
                                                        ) : userParticipations.includes(event.id) ? (
                                                            <button
                                                                onClick={() => handleCancel(event.id)}
                                                                className="w-full px-8 py-4 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-black uppercase tracking-widest rounded-full transition-all active:scale-95 border border-red-500/30"
                                                            >
                                                                Cancel Participation
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleParticipate(event.id)}
                                                                className="w-full px-8 py-4 bg-[#1CF3CA] hover:bg-[#19d4b0] text-black font-black uppercase tracking-widest rounded-full transition-all active:scale-95 shadow-[0_0_20px_rgba(28,243,202,0.3)] hover:shadow-[0_0_30px_rgba(28,243,202,0.5)]"
                                                            >
                                                                Participate Now
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <style jsx>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .custom-scrollbar-h::-webkit-scrollbar {
                    height: 8px;
                }
                .custom-scrollbar-h::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.02);
                    border-radius: 10px;
                    margin: 0 40px;
                }
                .custom-scrollbar-h::-webkit-scrollbar-thumb {
                    background: rgba(28, 243, 202, 0.2);
                    border-radius: 10px;
                    border: 2px solid #24003E;
                }
                .custom-scrollbar-h::-webkit-scrollbar-thumb:hover {
                    background: rgba(28, 243, 202, 0.4);
                }
            `}</style>
        </div>
    );
};

export default EventsPage;

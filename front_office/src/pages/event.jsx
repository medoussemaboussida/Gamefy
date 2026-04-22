import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { Search, Bell, Calendar, MapPin, ExternalLink, Loader2, ChevronDown, Filter, FileText } from "lucide-react";
import { eventApi } from "../api/event";
import toast from "react-hot-toast";
import EventDescriptionModal from "../modals/EventDescriptionModal";
import NotificationBell from "../components/NotificationBell";

const EventsPage = () => {
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("ALL");
    const [isStatusOpen, setIsStatusOpen] = useState(false);
    const [userParticipations, setUserParticipations] = useState([]);
    const [descriptionModal, setDescriptionModal] = useState({ open: false, title: "", description: "" });

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
                eventApi.getActiveEvents(),
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
        // Backend returns LocalDateTime without timezone - append 'Z' so JS treats it as UTC
        const utcString = dateString.endsWith("Z") || dateString.includes("+") ? dateString : dateString + "Z";
        return new Date(utcString).toLocaleDateString(undefined, options);
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

            <main className="flex-1 px-4 md:px-12 pt-6 pb-12 transition-all duration-300 overflow-y-auto">
                <div className="max-w-[1400px] mx-auto space-y-12">

                    {/* Header Section */}
                    <header className="flex items-center justify-between w-full mb-6">
                        <div className="pl-14 md:pl-0">
                            <h1 className="text-2xl md:text-3xl font-black uppercase font-['Inter'] tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-[#2BDFC8]">
                                E-sport events
                            </h1>
                            <p className="text-gray-400 hidden md:block text-sm">Tournaments and community gatherings</p>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Desktop Filter */}
                            <div className="hidden md:flex items-center gap-3 mr-2">
                                <div className="relative">
                                    <button
                                        onClick={() => setIsStatusOpen(!isStatusOpen)}
                                        className="bg-gradient-to-r from-[#DD00B8] to-[#2BDFC8] px-6 h-[40px] rounded-[18px] text-white font-medium flex items-center gap-2 hover:opacity-90 transition-all text-[15px] whitespace-nowrap"
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
                            </div>

                            <NotificationBell />
                        </div>
                    </header>

                    {/* Mobile Filter Row (Visible ONLY on mobile) */}
                    <div className="flex md:hidden flex-row items-center justify-start gap-4 w-full pl-13 mb-8">
                        <div className="relative">
                            <button
                                onClick={() => setIsStatusOpen(!isStatusOpen)}
                                className="bg-gradient-to-r from-[#DD00B8] to-[#2BDFC8] px-4 h-[36px] rounded-full text-white font-medium flex items-center gap-2 hover:opacity-90 transition-all text-[13px] whitespace-nowrap shadow-lg shadow-black/20"
                            >
                                <Filter size={16} />
                                <span>{statusOptions.find(opt => opt.value === selectedStatus)?.label}</span>
                                <ChevronDown size={16} className={`transition-transform duration-300 ${isStatusOpen ? "rotate-180" : ""}`} />
                            </button>

                            {isStatusOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-10"
                                        onClick={() => setIsStatusOpen(false)}
                                    ></div>
                                    <div className="absolute left-0 mt-3 w-56 bg-[#320141]/95 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-2 z-20 animate-in fade-in zoom-in duration-200">
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
                    </div>

                    {/* Events Horizontal Scroll Section */}
                    <div className="space-y-8">

                        {filteredEvents.length === 0 ? (
                            <div className="bg-[#320141] border border-white/5 rounded-[50px] p-20 flex flex-col items-center justify-center text-center space-y-4">
                                <div className="p-6 bg-white/5 rounded-full text-[#1CF3CA]">
                                    <Calendar size={48} />
                                </div>
                                <h3 className="text-2xl font-bold text-white uppercase italic tracking-wider">No Events Found</h3>
                                <p className="text-white/40">Try searching for something else or check back later!</p>
                            </div>
                        ) : (
                        <div className="flex overflow-x-auto gap-8 py-6 px-4 pb-16 snap-x no-scrollbar custom-scrollbar-h -mx-4">

                                {filteredEvents.map((event) => (
                                    <div
                                        key={event.id}
                                        className="flex-shrink-0 w-full max-w-[450px] snap-center relative group bg-[#320141]/40 border border-white/5 rounded-[50px] overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:bg-[#320141]/60 hover:border-[#1CF3CA]/30 flex flex-col h-full shadow-2xl backdrop-blur-xl"
                                    >
                                        {/* Hover Light Effect */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-[#1CF3CA]/0 via-[#1CF3CA]/5 to-[#FF89EB]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                                                {/* Image Section */}
                                                <div className="relative h-[250px] overflow-hidden">
                                                    {event.photo ? (
                                                        <img
                                                            src={`http://localhost:8080/api/uploads/event_photos/${event.photo}`}
                                                            alt={event.title}
                                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                        />
                                                    ) : (
                                                        <img
                                                            src="src/assets/images/vitrine_page_images/blogs.png"
                                                            alt={event.title}
                                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60"
                                                        />
                                                    )}
                                                    <div className="absolute top-6 right-6">
                                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black font-[inter] uppercase tracking-widest border backdrop-blur-md ${getStatusStyle(event.eventStatus)}`}>
                                                            {event.eventStatus}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Content Section */}
                                                <div className="p-8 flex flex-col flex-grow bg-gradient-to-b from-transparent to-black/30">
                                                    <div className="flex-grow space-y-4">
                                                        <h3 className="text-xl md:text-xl font-black font-[inter] uppercase tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-[#2BDFC8]">
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

                                                        <button
                                                            onClick={() => setDescriptionModal({ open: true, title: event.title, description: event.description })}
                                                            className="flex items-center gap-2 text-[#1CF3CA] hover:text-[#19d4b0] text-sm font-semibold transition-all mt-2"
                                                        >
                                                            <FileText size={16} />
                                                            Show Description
                                                        </button>
                                                    </div>

                                                    {/* Participation Logic */}
                                                    <div className="pt-8 w-full">
                                                        {event.registerLink ? (
                                                            <div className="w-full text-center">
                                                                <a
                                                                    href={event.registerLink}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-blue-500 font-bold font-['Inter'] uppercase text-lg hover:underline"
                                                                >
                                                                    Participation Link
                                                                </a>
                                                            </div>
                                                        ) : userParticipations.includes(event.id) ? (
                                                            <button
                                                                onClick={() => handleCancel(event.id)}
                                                                className="w-full px-8 py-4 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-black uppercase tracking-widest rounded-full transition-all active:scale-95 border border-red-500/30"
                                                            >
                                                                Cancel Participation
                                                            </button>
                                                        ) : (event.eventStatus === "COMPLETED" || new Date(event.endTime.endsWith("Z") ? event.endTime : event.endTime + "Z") < new Date()) ? (
                                                            <div className="w-full px-8 py-4 bg-white/5 text-white/40 font-black uppercase tracking-widest rounded-full text-center border border-white/5">
                                                                the event inscription is closed
                                                            </div>
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

                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <EventDescriptionModal
                open={descriptionModal.open}
                title={descriptionModal.title}
                description={descriptionModal.description}
                onClose={() => setDescriptionModal({ open: false, title: "", description: "" })}
            />

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

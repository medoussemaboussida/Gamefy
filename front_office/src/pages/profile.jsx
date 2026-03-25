import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { User, Mail, Shield, Camera, Edit2, Loader2, ChevronRight, LogOut, Search, Bell, Calendar, MapPin, X, FileText } from "lucide-react";
import toast from "react-hot-toast";
import { profileApi } from "../api/profile";
import { authApi } from "../api/auth";
import { eventApi } from "../api/event";
import { getUserId } from "../utils/jwt";
import ProfileForm from "../modals/ProfileForm";
import EventDescriptionModal from "../modals/EventDescriptionModal";

const ProfilePage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [participatedEvents, setParticipatedEvents] = useState([]);
    const [descriptionModal, setDescriptionModal] = useState({ open: false, title: "", description: "" });
    const fileInputRef = useRef(null);

    const fetchProfile = async () => {
        const userId = getUserId();
        if (!userId) {
            setIsLoading(false);
            return;
        }

        try {
            const data = await profileApi.getProfile(userId);
            setUser(data);

            // Fetch participated events
            const [participations, allEvents] = await Promise.all([
                eventApi.getMyParticipations(),
                eventApi.getActiveEvents()
            ]);
            const participatedEventIds = participations.map(p => p.eventId);
            const userEvents = allEvents.filter(e => participatedEventIds.includes(e.id));
            setParticipatedEvents(userEvents);
        } catch (error) {
            toast.error("Failed to load profile", {
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
        fetchProfile();
    }, []);

    const handleLogout = async () => {
        try {
            await authApi.logout();
        } catch (error) {
            console.error("Logout failed", error);
        } finally {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("userRole");
            localStorage.removeItem("userId");
            navigate("/");
            toast.success("Signed out successfully", {
                style: {
                    border: '1px solid #1CF3CA',
                    padding: '16px',
                    color: '#1CF3CA',
                    background: '#24003E',
                    boxShadow: '0 0 15px rgba(28, 243, 202, 0.4)',
                },
            });
        }
    };

    const handlePhotoClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
        if (!allowedTypes.includes(file.type)) {
            toast.error("Please upload a PNG or JPG image", {
                style: {
                    border: '1px solid #DE3D3D',
                    padding: '16px',
                    color: '#DE3D3D',
                    background: '#360200',
                },
            });
            return;
        }

        const loadingToast = toast.loading("Uploading photo...", {
            style: {
                background: '#24003E',
                color: '#1CF3CA',
                border: '1px solid rgba(28, 243, 202, 0.3)',
            }
        });

        try {
            const updatedUser = await profileApi.uploadPhoto(file);
            setUser(updatedUser);
            toast.success("Photo updated successfully!", {
                id: loadingToast,
                style: {
                    border: '1px solid #1CF3CA',
                    padding: '16px',
                    color: '#1CF3CA',
                    background: '#24003E',
                    boxShadow: '0 0 15px rgba(28, 243, 202, 0.4)',
                },
            });
        } catch (error) {
            toast.error(error.message || "Upload failed", {
                id: loadingToast,
                style: {
                    border: '1px solid #DE3D3D',
                    padding: '16px',
                    color: '#DE3D3D',
                    background: '#360200',
                },
            });
        }
    };

    const handleCancelParticipation = async (eventId) => {
        try {
            await eventApi.cancelParticipation(eventId);
            setParticipatedEvents(participatedEvents.filter(e => e.id !== eventId));
            toast.success("Participation cancelled", {
                style: {
                    border: '1px solid #1CF3CA',
                    padding: '16px',
                    color: '#1CF3CA',
                    background: '#24003E',
                    boxShadow: '0 0 15px rgba(28, 243, 202, 0.4)',
                },
            });
        } catch (error) {
            toast.error(error.message || "Failed to cancel participation", {
                style: {
                    border: '1px solid #DE3D3D',
                    padding: '16px',
                    color: '#DE3D3D',
                    background: '#360200',
                },
            });
        }
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#24003E] flex items-center justify-center">
                <Loader2 size={48} className="text-[#1CF3CA] animate-spin" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-[#24003E] flex items-center justify-center text-white">
                <p>Please sign in to view your profile.</p>
            </div>
        );
    }

    const profilePhotoUrl = user.profilePhoto
        ? (user.profilePhoto.startsWith("http") ? user.profilePhoto : `http://localhost:8080/api${user.profilePhoto.startsWith("/") ? "" : "/"}${user.profilePhoto}`)
        : null;

    return (
        <div className="h-screen bg-[#24003E] flex overflow-hidden font-sans">
            <Sidebar />

            <main className="flex-1 px-10 md:px-12 pt-8 pb-12 transition-all duration-300 overflow-y-auto">
                <div className="max-w-[1400px] mx-auto space-y-12">

                    {/* Dashboard Style Header */}
                    <header className="flex flex-col md:flex-row items-center justify-between w-full gap-6 md:gap-0">
                        <h2 className="text-white text-[18px] font-bold font-['Inter'] self-start md:self-auto pl-14 md:pl-0">
                            User Profile
                        </h2>
                    </header>

                    {/* Profile Banner Section */}
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-[#DD00B8] to-[#1CF3CA] rounded-[50px] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                        <div className="relative bg-[#320141] border border-white/5 rounded-[50px] p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 md:gap-12 overflow-hidden shadow-2xl">
                            {/* Photo Section */}
                            <div className="relative">
                                <div className="w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-[#1CF3CA] overflow-hidden bg-gray-950 shadow-2xl">
                                    {profilePhotoUrl ? (
                                        <img src={profilePhotoUrl} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-white/20">
                                            <User size={64} />
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={handlePhotoClick}
                                    className="absolute bottom-2 right-2 p-3 bg-[#1CF3CA] hover:bg-[#19d4b0] text-black rounded-full shadow-xl transition-all active:scale-90"
                                >
                                    <Camera size={20} />
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    hidden
                                    accept="image/*"
                                />
                            </div>

                            {/* Info Section */}
                            <div className="flex-grow text-center md:text-left space-y-4">
                                <h1 className="text-[32px] md:text-[54px] font-black font-['Inter'] leading-tight md:leading-none tracking-tight uppercase">
                                    <span className="bg-gradient-to-r from-white to-[#2BDFC8] bg-clip-text text-transparent">
                                        {user.firstName} <br className="md:hidden" /> {user.lastName}
                                    </span>
                                </h1>
                                <p className="text-white text-lg flex items-center justify-center md:justify-start text-[16px] gap-2 font-['Inter']">
                                    <Mail size={18} className="text-[#2BDFC8]" />
                                    {user.email}
                                </p>

                                <div className="pt-4 flex flex-wrap justify-center md:justify-start gap-4">
                                    <button
                                        onClick={() => setIsModalOpen(true)}
                                        className="inline-flex items-center gap-2 px-8 py-3 bg-[#1CF3CA]/10 hover:bg-[#1CF3CA]/20 border border-[#1CF3CA]/30 text-[#1CF3CA] rounded-full font-medium transition-all"
                                    >
                                        <Edit2 size={18} />
                                        Edit Details
                                    </button>
                                    <button
                                        onClick={handleLogout}
                                        className="inline-flex items-center gap-2 px-8 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 rounded-full font-medium transition-all"
                                    >
                                        <LogOut size={18} />
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats / Detailed Info Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Security Card */}
                        <div className="bg-[#582167] border border-white/5 rounded-[32px] p-8 space-y-6 group hover:border-[#1CF3CA]/30 transition-all">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-white/5 rounded-2xl">
                                        <Shield className="text-[#1CF3CA]" size={24} />
                                    </div>
                                    <h3 className="text-xl font-bold text-white font-['Inter']">Account Safety</h3>
                                </div>
                                <span className="text-xs text-[#1CF3CA] uppercase font-black tracking-widest font-['Inter'] opacity-70">Secure</span>
                            </div>

                            <div className="space-y-4 pt-2">
                                <div className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-white/5">
                                    <span className="text-white/60 font-medium">Account Role</span>
                                    <span className="text-[#FF89EB] font-bold text-sm uppercase">{user.role}</span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-white/5">
                                    <div className="flex flex-col">
                                        <span className="text-white/60 font-medium">Two-Factor Authentication</span>
                                        <span className="text-white/30 text-xs mt-1">Extra security for your account</span>
                                    </div>
                                    <button
                                        onClick={async () => {
                                            const newVal = !user.twoFaActivated;
                                            try {
                                                await authApi.toggle2FA({ enabled: newVal });
                                                setUser(prev => ({ ...prev, twoFaActivated: newVal }));
                                                toast.success(newVal ? "2FA enabled" : "2FA disabled", {
                                                    style: {
                                                        border: '1px solid #1CF3CA',
                                                        padding: '16px',
                                                        color: '#1CF3CA',
                                                        background: '#24003E',
                                                        boxShadow: '0 0 15px rgba(28, 243, 202, 0.4)',
                                                    },
                                                });
                                            } catch (error) {
                                                toast.error(error.message || "Failed to update 2FA", {
                                                    style: {
                                                        border: '1px solid #DE3D3D',
                                                        padding: '16px',
                                                        color: '#DE3D3D',
                                                        background: '#360200',
                                                    },
                                                });
                                            }
                                        }}
                                        className={`relative w-14 h-7 rounded-full transition-all duration-300 ${user.twoFaActivated ? 'bg-[#1CF3CA]' : 'bg-white/10'}`}
                                    >
                                        <span className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 ${user.twoFaActivated ? 'translate-x-7' : 'translate-x-0'}`} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Activity Overview */}
                        <div className="bg-[#582167] border border-white/5 rounded-[32px] p-8 space-y-6 group hover:border-[#1CF3CA]/30 transition-all">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-white/5 rounded-2xl">
                                        <ChevronRight className="text-[#DD00B8]" size={24} />
                                    </div>
                                    <h3 className="text-xl font-bold text-white font-['Inter']">Gaming Status</h3>
                                </div>
                                <span className="text-[#DD00B8] font-black text-xs uppercase tracking-widest font-['Inter']">Active</span>
                            </div>

                            <div className="space-y-4 pt-2">
                                <div className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-white/5">
                                    <span className="text-white/60 font-medium">Member Since</span>
                                    <span className="text-white/40 text-sm">
                                        {user.createdAt
                                            ? new Date(user.createdAt + "Z").toLocaleDateString(undefined, { year: 'numeric', month: 'short' })
                                            : "N/A"}
                                    </span>
                                </div>
                                {user.role === "PLAYER" && (
                                    <div className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-white/5">
                                        <span className="text-white/60 font-medium">Total Hours</span>
                                        <span className="text-[#1CF3CA] font-bold text-sm">
                                            {user.totalHours ?? 0} h
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Participated Events Section */}
                    <div className="space-y-6">
                        <h2 className="text-white text-[18px] font-bold font-['Inter']">
                            My Participated Events
                        </h2>

                        {participatedEvents.length === 0 ? (
                            <div className="bg-[#582167] border border-white/5 rounded-[32px] p-12 flex flex-col items-center justify-center text-center space-y-3">
                                <Calendar size={40} className="text-white/10" />
                                <p className="text-white/40 font-medium">You haven't joined any events yet.</p>
                            </div>
                        ) : (
                            <div className="flex overflow-x-auto gap-8 py-6 px-4 pb-12 snap-x no-scrollbar -mx-4">
                                {participatedEvents.map((event) => (
                                    <div
                                        key={event.id}
                                        className="flex-shrink-0 w-full max-w-[400px] snap-center relative group bg-[#320141]/40 border border-white/5 rounded-[50px] overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:bg-[#320141]/60 hover:border-[#1CF3CA]/30 flex flex-col h-full shadow-2xl backdrop-blur-xl"
                                    >
                                        {/* Hover Light Effect */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-[#1CF3CA]/0 via-[#1CF3CA]/5 to-[#FF89EB]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                                        {/* Image Section */}
                                        <div className="relative h-[200px] overflow-hidden">
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
                                        </div>

                                        {/* Content Section */}
                                        <div className="p-8 flex flex-col flex-grow bg-gradient-to-b from-transparent to-black/30">
                                            <div className="flex-grow space-y-4">
                                                <h3 className="text-xl font-black font-[inter] uppercase tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-[#2BDFC8]">
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

                                            {/* Action Section */}
                                            <div className="pt-8 w-full flex flex-col gap-4">
                                                {event.registerLink && (
                                                    <div className="w-full text-center">
                                                        <a
                                                            href={event.registerLink}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-500 font-bold font-['Inter'] uppercase text-sm hover:underline"
                                                        >
                                                            Event Link
                                                        </a>
                                                    </div>
                                                )}
                                                <button
                                                    onClick={() => handleCancelParticipation(event.id)}
                                                    className="w-full px-6 py-3 bg-red-500/15 hover:bg-red-500/25 text-red-400 font-bold uppercase tracking-widest text-[10px] rounded-full transition-all active:scale-95 border border-red-500/20"
                                                >
                                                    Cancel Participation
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Description Modal */}
            <EventDescriptionModal
                open={descriptionModal.open}
                title={descriptionModal.title}
                description={descriptionModal.description}
                onClose={() => setDescriptionModal({ open: false, title: "", description: "" })}
            />

            {/* Edit Modal */}
            {isModalOpen && (
                <ProfileForm
                    user={user}
                    onClose={() => setIsModalOpen(false)}
                    onUpdate={(updatedUser) => setUser(updatedUser)}
                />
            )}
        </div>
    );
};

export default ProfilePage;

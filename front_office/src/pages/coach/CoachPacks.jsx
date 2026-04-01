import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import { 
    Package, 
    Plus, 
    Search, 
    Filter, 
    ChevronDown, 
    Edit2, 
    Trash2, 
    Clock, 
    DollarSign,
    Loader2,
    FileText
} from "lucide-react";
import { packCoachingApi } from "../../api/packCoaching";
import toast from "react-hot-toast";
import AddEditPackCoachingModal from "../../modals/AddEditPackCoachingModal";
import DeleteConfirmationModal from "../../modals/DeleteConfirmationModal";
import PackDescriptionModal from "../../modals/PackDescriptionModal";

const CoachPacks = () => {
    const [packs, setPacks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("NEWEST");
    const [isSortOpen, setIsSortOpen] = useState(false);
    
    // Modal states
    const [isAddEditOpen, setIsAddEditOpen] = useState(false);
    const [selectedPack, setSelectedPack] = useState(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [packToDelete, setPackToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
    const [viewingPack, setViewingPack] = useState(null);

    const fetchPacks = async () => {
        try {
            setIsLoading(true);
            const data = await packCoachingApi.getMyPacks();
            setPacks(data);
        } catch (error) {
            toast.error("Failed to load your coaching packs");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPacks();
    }, []);

    const filteredAndSortedPacks = packs
        .filter(pack => pack.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .sort((a, b) => {
            if (sortBy === "NEWEST") return b.id - a.id;
            return a.id - b.id;
        });

    const handleEdit = (pack) => {
        setSelectedPack(pack);
        setIsAddEditOpen(true);
    };

    const handleDeleteClick = (pack) => {
        setPackToDelete(pack);
        setIsDeleteOpen(true);
    };

    const confirmDelete = async () => {
        if (!packToDelete) return;
        setIsDeleting(true);
        try {
            await packCoachingApi.deletePack(packToDelete.id);
            toast.success("Pack deleted successfully");
            fetchPacks();
            setIsDeleteOpen(false);
        } catch (error) {
            toast.error("Failed to delete pack");
        } finally {
            setIsDeleting(false);
            setPackToDelete(null);
        }
    };

    return (
        <div className="h-screen bg-[#24003E] flex overflow-hidden font-sans">
            <Sidebar />

            <main className="flex-1 px-10 md:px-12 pt-8 pb-12 transition-all duration-300 overflow-y-auto">
                <div className="max-w-[1400px] mx-auto space-y-10">
                    
                    {/* Header Section */}
                    <header className="flex flex-col md:flex-row items-center justify-between w-full gap-6">
                        <div className="pl-16 md:pl-0 self-start md:self-auto">
                            <h1 className="text-3xl font-black uppercase tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-[#2BDFC8]">
                                My Coaching Packs
                            </h1>
                            <p className="text-gray-400">Create and manage your specialized coaching offers</p>
                        </div>

                        <div className="flex items-center gap-4 w-full md:w-auto">
                            {/* Search bar */}
                            <div className="relative flex-1 md:w-64 group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-hover:text-[#1CF3CA] transition-colors" size={18} />
                                <input 
                                    type="text" 
                                    placeholder="Search packs..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full h-[40px] bg-white/5 border border-white/10 rounded-[18px] pl-11 pr-4 text-white text-sm focus:outline-none focus:border-[#1CF3CA]/50 focus:bg-white/10 transition-all"
                                />
                            </div>

                            {/* Sort Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsSortOpen(!isSortOpen)}
                                    className="bg-white/5 border border-white/10 text-white px-5 h-[40px] rounded-[18px] text-[15px] font-medium flex items-center gap-2 hover:bg-white/10 transition-all"
                                >
                                    <Filter size={18} className="text-[#FF89EB]" />
                                    <span>{sortBy === "NEWEST" ? "Newest" : "Oldest"}</span>
                                    <ChevronDown size={18} className={`transition-transform duration-300 ${isSortOpen ? "rotate-180" : ""}`} />
                                </button>

                                {isSortOpen && (
                                    <>
                                        <div className="fixed inset-0 z-10" onClick={() => setIsSortOpen(false)}></div>
                                        <div className="absolute right-0 mt-3 w-48 bg-[#320141]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-2 z-20 animate-in fade-in zoom-in duration-200">
                                            {["NEWEST", "OLDEST"].map((option) => (
                                                <button
                                                    key={option}
                                                    onClick={() => {
                                                        setSortBy(option);
                                                        setIsSortOpen(false);
                                                    }}
                                                    className={`w-full flex items-center px-4 py-3 rounded-xl text-[14px] font-medium transition-all ${sortBy === option
                                                        ? "bg-[#1CF3CA] text-black"
                                                        : "text-white/70 hover:bg-white/5 hover:text-white"
                                                    }`}
                                                >
                                                    {option === "NEWEST" ? "Newest First" : "Oldest First"}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Add Button */}
                            <button
                                onClick={() => {
                                    setSelectedPack(null);
                                    setIsAddEditOpen(true);
                                }}
                                className="bg-[#1CF3CA] hover:bg-[#19d4b0] text-black px-6 h-[40px] rounded-[18px] font-bold flex items-center gap-2 transition-all active:scale-95 shadow-[0_0_20px_rgba(28,243,202,0.3)]"
                            >
                                <Plus size={20} />
                                <span>Add Pack</span>
                            </button>
                        </div>
                    </header>

                    {/* Packs Grid / Scroll Area */}
                    <div className="relative">
                        {isLoading ? (
                            <div className="h-64 flex items-center justify-center">
                                <Loader2 size={48} className="text-[#1CF3CA] animate-spin" />
                            </div>
                        ) : filteredAndSortedPacks.length === 0 ? (
                            <div className="bg-[#320141]/40 border border-white/5 rounded-[40px] p-20 flex flex-col items-center justify-center text-center space-y-4 backdrop-blur-xl">
                                <div className="p-6 bg-white/5 rounded-full text-[#1CF3CA]">
                                    <Package size={48} />
                                </div>
                                <h3 className="text-2xl font-bold text-white uppercase italic tracking-wider">No Packs Found</h3>
                                <p className="text-white/40 max-w-sm">
                                    {searchQuery ? "Try adjusting your search query." : "Start by creating your first coaching pack to offer to players!"}
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 py-4 px-4 -mx-4 overflow-y-auto no-scrollbar custom-scrollbar pb-10">
                                {filteredAndSortedPacks.map((pack) => (
                                    <div
                                        key={pack.id}
                                        className="group relative bg-[#320141]/40 border border-white/5 rounded-[40px] overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:bg-[#320141]/60 hover:border-[#1CF3CA]/30 flex flex-col h-full shadow-2xl backdrop-blur-xl"
                                    >
                                        {/* Glow Effect */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-[#1CF3CA]/0 via-[#1CF3CA]/5 to-[#FF89EB]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                                        <div className="p-8 flex flex-col h-full space-y-6">
                                            {/* Top info */}
                                            <div className="flex justify-between items-start">
                                                <div className="p-4 rounded-2xl bg-[#1CF3CA]/10 text-[#1CF3CA] group-hover:bg-[#1CF3CA] group-hover:text-black transition-all duration-500">
                                                    <Package size={28} />
                                                </div>
                                                <div className="text-right">
                                                    <span className="block text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Price</span>
                                                    <span className="text-2xl font-black text-[#1CF3CA]">{Number(pack.price).toFixed(3)} DT</span>
                                                </div>
                                            </div>

                                            {/* Details */}
                                            <div className="space-y-4 flex-grow">
                                                <h3 className="text-2xl font-black uppercase font-['Inter'] tracking-tight text-white group-hover:text-[#FF89EB] transition-colors leading-tight">
                                                    {pack.name}
                                                </h3>
                                                
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-2 text-white/70 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                                                        <Clock size={16} className="text-[#FF89EB]" />
                                                        <span className="text-sm font-semibold">
                                                            {pack.hours.split(":")[0].replace(/^0+/, '') || '0'}h {pack.hours.split(":")[1].replace(/^0+/, '') || '0'}m
                                                        </span>
                                                    </div>
                                                    {pack.description && (
                                                        <button 
                                                            onClick={() => {
                                                                setViewingPack(pack);
                                                                setIsDescriptionOpen(true);
                                                            }}
                                                            className="flex items-center gap-2 text-[#FF89EB] hover:text-white transition-colors group/desc"
                                                        >
                                                            <FileText size={16} />
                                                            <span className="text-xs font-bold uppercase tracking-wider border-b border-transparent group-hover/desc:border-[#FF89EB]">View Desc</span>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex gap-3 pt-6 border-t border-white/5">
                                                <button
                                                    onClick={() => handleEdit(pack)}
                                                    className="flex-1 h-12 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center gap-2 text-white font-bold transition-all active:scale-95"
                                                >
                                                    <Edit2 size={16} className="text-[#1CF3CA]" />
                                                    <span>Edit</span>
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(pack)}
                                                    className="w-12 h-12 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-2xl flex items-center justify-center text-red-500 transition-all active:scale-95"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={20} />
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

            {/* Modals */}
            <AddEditPackCoachingModal 
                isOpen={isAddEditOpen} 
                onClose={() => setIsAddEditOpen(false)} 
                onRefresh={fetchPacks}
                pack={selectedPack}
            />

            {isDeleteOpen && (
                <DeleteConfirmationModal 
                    title="Delete Coaching Pack"
                    message={`Are you sure you want to delete "${packToDelete?.name}"? This action cannot be undone.`}
                    onConfirm={confirmDelete}
                    onCancel={() => setIsDeleteOpen(false)}
                    isLoading={isDeleting}
                />
            )}

            <PackDescriptionModal 
                isOpen={isDescriptionOpen}
                onClose={() => {
                    setIsDescriptionOpen(false);
                    setViewingPack(null);
                }}
                description={viewingPack?.description}
                packName={viewingPack?.name}
            />

            <style jsx>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.02);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(28, 243, 202, 0.2);
                    border-radius: 10px;
                    border: 2px solid #24003E;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(28, 243, 202, 0.4);
                }
            `}</style>
        </div>
    );
};

export default CoachPacks;

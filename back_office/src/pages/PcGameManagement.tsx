import { useEffect, useState } from "react";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import ComponentCard from "../components/common/ComponentCard";
import PageMeta from "../components/common/PageMeta";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { pcApi, PcGame } from "../api/pc";
import { getUserRole } from "../utils/jwt";
import toast from "react-hot-toast";
import Button from "../components/ui/button/Button";
import { TrashBinIcon, PencilIcon } from "../icons";
import { Modal } from "../components/ui/modal";
import Input from "../components/form/input/InputField";
import Label from "../components/form/Label";
import DeleteConfirmationModal from "../components/modals/deleteConfirmation";
import Pagination from "../components/ui/pagination/Pagination";

export default function PcGameManagement() {
  const [games, setGames] = useState<PcGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<PcGame | null>(null);
  const [gameName, setGameName] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState("");
  const itemsPerPage = 3;

  const currentUserRole = getUserRole();
  const isAdmin = currentUserRole === "ADMIN";

  const fetchGames = async () => {
    try {
      setLoading(true);
      const data = await pcApi.getAllPcGamesEntities();
      setGames(data);
      setCurrentPage(1);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch PC games");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  const openAddModal = () => {
    setSelectedGame(null);
    setGameName("");
    setIsModalOpen(true);
  };

  const openEditModal = (game: PcGame) => {
    setSelectedGame(game);
    setGameName(game.gameName);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameName.trim()) {
      toast.error("Game name is required");
      return;
    }

    setSaving(true);
    try {
      if (selectedGame) {
        await pcApi.updatePcGame(selectedGame.id, { gameName });
        toast.success("PC game updated successfully!");
      } else {
        await pcApi.createPcGame({ gameName });
        toast.success("PC game created successfully!");
      }
      fetchGames();
      setIsModalOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to save PC game");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedGame) return;
    setDeleting(true);
    try {
      await pcApi.deletePcGame(selectedGame.id);
      toast.success("PC game deleted successfully!");
      fetchGames();
      setIsDeleteModalOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete PC game");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <PageMeta
        title="PC Games Management | Gamefy Admin"
        description="Manage the list of available PC games"
      />
      <PageBreadcrumb pageTitle="PC Games Management" />
      <div className="space-y-6">
        <ComponentCard title="PC Games List">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name..."
                value={searchKeyword}
                onChange={(e) => { setSearchKeyword(e.target.value); setCurrentPage(1); }}
                className="h-[38px] w-64 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-800 placeholder-gray-400 shadow-sm outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-white/10 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500 dark:focus:border-brand-500"
              />
              {searchKeyword && (
                <button
                  onClick={() => { setSearchKeyword(""); setCurrentPage(1); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              )}
            </div>
            {isAdmin && (
              <Button variant="primary" size="sm" onClick={openAddModal}>
                Add PC Game
              </Button>
            )}
          </div>

          <div className="overflow-auto rounded-lg border border-gray-200 dark:border-white/10">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-white/5">
                  <TableCell className="px-5 py-3 text-sm font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Game Name
                  </TableCell>
                  {isAdmin && (
                    <TableCell className="px-5 py-3 text-sm font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400 text-right">
                      Actions
                    </TableCell>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={isAdmin ? 2 : 1}
                      className="px-5 py-10 text-center text-gray-500"
                    >
                      Loading games...
                    </TableCell>
                  </TableRow>
                ) : games.filter(g => g.gameName.toLowerCase().includes(searchKeyword.toLowerCase())).length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={isAdmin ? 2 : 1}
                      className="px-5 py-10 text-center text-gray-500"
                    >
                      No PC games found
                    </TableCell>
                  </TableRow>
                ) : (
                  games.filter(g => g.gameName.toLowerCase().includes(searchKeyword.toLowerCase())).slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((game) => (
                    <TableRow key={game.id}>
                      <TableCell className="px-5 py-4 text-start text-gray-600 dark:text-gray-400">
                        {game.gameName}
                      </TableCell>
                      {isAdmin && (
                        <TableCell className="px-5 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openEditModal(game)}
                              className="text-gray-500 hover:text-brand-500 transition-colors"
                              title="Edit Game"
                            >
                              <PencilIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedGame(game);
                                setIsDeleteModalOpen(true);
                              }}
                              className="text-gray-500 hover:text-error-500 transition-colors"
                              title="Delete Game"
                            >
                              <TrashBinIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <Pagination
            currentPage={currentPage}
            totalItems={games.filter(g => g.gameName.toLowerCase().includes(searchKeyword.toLowerCase())).length}
            itemsPerPage={itemsPerPage}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </ComponentCard>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} className="max-w-[400px] p-6">
        <div className="flex flex-col gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              {selectedGame ? "Edit PC Game" : "Add New PC Game"}
            </h3>
          </div>

          <form onSubmit={handleSave} className="flex flex-col gap-5">
            <div>
              <Label>Game Name *</Label>
              <Input
                type="text"
                placeholder="e.g. League of Legends"
                value={gameName}
                onChange={(e) => setGameName(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={saving}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" loading={saving}>
                {selectedGame ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        userName={selectedGame?.gameName || ""}
        loading={deleting}
      />
    </>
  );
}

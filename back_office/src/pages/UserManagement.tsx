import { useEffect, useState, useRef } from "react";
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
import Badge from "../components/ui/badge/Badge";
import { userApi } from "../api/user";
import { packGamefyApi } from "../api/packGamefy";
import { getUserId, getUserRole } from "../utils/jwt";
import toast from "react-hot-toast";
import Button from "../components/ui/button/Button";
import { Dropdown } from "../components/ui/dropdown/Dropdown";
import { DropdownItem } from "../components/ui/dropdown/DropdownItem";
import { ChevronDownIcon, TrashBinIcon, BoxIcon } from "../icons";
import AddUserModal from "../components/modals/addUser";
import DeleteConfirmationModal from "../components/modals/deleteConfirmation";
import CoachProfileModal from "../components/modals/CoachProfileModal";
import AssignPackModal from "../components/modals/AssignPackModal";
import AssignCoachingPackModal from "../components/modals/AssignCoachingPackModal";
import Pagination from "../components/ui/pagination/Pagination";
import { packCoachingApi } from "../api/packCoaching";

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
  packGamefyId?: number;
  packGamefyName?: string | null;
  packCoachingId?: number;
  packCoachingName?: string | null;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState<number | null>(
    null,
  );
  const [isCoachModalOpen, setIsCoachModalOpen] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState<User | null>(null);
  const [isAssignPackModalOpen, setIsAssignPackModalOpen] = useState(false);
  const [userForPack, setUserForPack] = useState<User | null>(null);
  const [isRemovePackModalOpen, setIsRemovePackModalOpen] = useState(false);
  const [userToRemovePack, setUserToRemovePack] = useState<User | null>(null);
  const [removePackLoading, setRemovePackLoading] = useState(false);
  const [renewPackLoading, setRenewPackLoading] = useState<number | null>(null);
  const [renewCoachingPackLoading, setRenewCoachingPackLoading] = useState<number | null>(null);
  const [isAssignCoachingPackModalOpen, setIsAssignCoachingPackModalOpen] = useState(false);
  const [userForCoachingPack, setUserForCoachingPack] = useState<User | null>(null);
  const [isRemoveCoachingPackModalOpen, setIsRemoveCoachingPackModalOpen] = useState(false);
  const [userToRemoveCoachingPack, setUserToRemoveCoachingPack] = useState<User | null>(null);
  const [removeCoachingPackLoading, setRemoveCoachingPackLoading] = useState(false);

  const currentUserRole = getUserRole();
  const currentUserId = getUserId();
  const isAdmin = currentUserRole === "ADMIN";

  const roleOptions = [
    { value: "ALL", label: "All Roles" },
    { value: "PLAYER", label: "Player" },
    { value: "COACH", label: "Coach" },
    { value: "WEB_MASTER", label: "Web Master" },
    { value: "ADMIN", label: "Admin" },
  ];

  const statusOptions = [
    { value: "ALL", label: "All Statuses" },
    { value: "ACTIVE", label: "Active" },
    { value: "INACTIVE", label: "Inactive" },
  ];

  const fetchUsers = async () => {
    try {
      const data = (await userApi.getAllUsers()) as any;
      setUsers(data as User[]);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Debounced search effect
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      setLoading(true);
      try {
        if (searchKeyword.trim()) {
          const data = (await userApi.searchUsers(searchKeyword.trim())) as any;
          setUsers(data as User[]);
        } else {
          const data = (await userApi.getAllUsers()) as any;
          setUsers(data as User[]);
        }
      } catch (error: any) {
        toast.error(error.message || "Search failed");
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [searchKeyword]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedRole, selectedStatus, searchKeyword]);

  const filteredUsers = users.filter((user) => {
    const roleMatch = selectedRole === "ALL" || user.role === selectedRole;
    const statusMatch =
      selectedStatus === "ALL" || user.status === selectedStatus;
    return roleMatch && statusMatch;
  });

  const totalItems = filteredUsers.length;
  const currentUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const getRoleLabel = (value: string) =>
    roleOptions.find((opt) => opt.value === value)?.label || value;
  const getStatusLabel = (value: string) =>
    statusOptions.find((opt) => opt.value === value)?.label || value;

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    setDeleteLoading(true);
    try {
      await userApi.deleteUser(userToDelete.id);
      toast.success("User deleted successfully!");
      fetchUsers();
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete user");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleConfirmRemovePack = async () => {
    if (!userToRemovePack) return;
    setRemovePackLoading(true);
    try {
      await packGamefyApi.removePackFromPlayer(userToRemovePack.id);
      toast.success("Pack assignment removed.");
      await fetchUsers();
      setIsRemovePackModalOpen(false);
      setUserToRemovePack(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to remove pack assignment");
    } finally {
      setRemovePackLoading(false);
    }
  };

  const handleRenewPack = async (user: User) => {
    if (!user.packGamefyId) return;
    setRenewPackLoading(user.id);
    try {
      await packGamefyApi.renewPackForPlayer({ userId: user.id, packId: user.packGamefyId });
      toast.success(`Pack renewed for ${user.firstName} ${user.lastName}!`);
      await fetchUsers();
    } catch (error: any) {
      toast.error(error.message || "Failed to renew pack");
    } finally {
      setRenewPackLoading(null);
    }
  };

  const handleRenewCoachingPack = async (user: User) => {
    if (!user.packCoachingId) return;
    setRenewCoachingPackLoading(user.id);
    try {
      await packCoachingApi.renewPackForPlayer({ userId: user.id, packId: user.packCoachingId });
      toast.success(`Coaching pack renewed for ${user.firstName} ${user.lastName}!`);
      await fetchUsers();
    } catch (error: any) {
      toast.error(error.message || "Failed to renew coaching pack");
    } finally {
      setRenewCoachingPackLoading(null);
    }
  };

  const handleConfirmRemoveCoachingPack = async () => {
    if (!userToRemoveCoachingPack) return;
    setRemoveCoachingPackLoading(true);
    try {
      await packCoachingApi.removePackFromPlayer(userToRemoveCoachingPack.id);
      toast.success("Coaching pack assignment removed.");
      await fetchUsers();
      setIsRemoveCoachingPackModalOpen(false);
      setUserToRemoveCoachingPack(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to remove coaching pack assignment");
    } finally {
      setRemoveCoachingPackLoading(false);
    }
  };

  const handleStatusChange = async (userId: number, newStatus: string) => {
    const previousUsers = [...users];
    setUsers(
      users.map((u) => (u.id === userId ? { ...u, status: newStatus } : u)),
    );
    setStatusDropdownOpen(null);

    const promise = (async () => {
      const enabled = newStatus === "ACTIVE";
      await userApi.updateUserStatus(userId, enabled);
    })();

    toast.promise(promise, {
      loading: "Updating status and sending email notification...",
      success: "Status updated and email sent successfully!",
      error: (err) => {
        setUsers(previousUsers);
        return err.message || "Failed to update user status";
      },
    });

    try {
      await promise;
    } catch (error) {
    }
  };

  const getRoleBadgeColor = (role: string): any => {
    switch (role) {
      case "ADMIN":
        return "error";
      case "COACH":
        return "warning";
      case "WEB_MASTER":
        return "info";
      case "PLAYER":
        return "primary";
      default:
        return "light";
    }
  };

  return (
    <>
      <PageMeta
        title="User Management | Gamefy Admin"
        description="Manage your platform users"
      />
      <PageBreadcrumb pageTitle="User Management" />
      <div className="space-y-6">
        <ComponentCard title="Platform Users">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {/* Search Input */}
            <div className="relative">
              <input
                id="user-search-input"
                type="text"
                placeholder="Search by name..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="h-[38px] w-64 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-800 placeholder-gray-400 shadow-sm outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-white/10 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500 dark:focus:border-brand-500"
              />
              {searchKeyword && (
                <button
                  onClick={() => setSearchKeyword("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="relative">
              <Button
                onClick={() => setIsRoleOpen(!isRoleOpen)}
                variant="primary"
                size="sm"
                className="w-40 dropdown-toggle"
                endIcon={
                  <ChevronDownIcon
                    className={`w-5 h-5 transition-transform duration-200 ${isRoleOpen ? "rotate-180" : ""
                      }`}
                  />
                }
              >
                {getRoleLabel(selectedRole)}
              </Button>
              <Dropdown
                isOpen={isRoleOpen}
                onClose={() => setIsRoleOpen(false)}
                className="w-40 mt-2 overflow-hidden bg-white border border-gray-200 rounded-lg shadow-lg dark:bg-gray-900 dark:border-gray-800"
              >
                {roleOptions.map((option) => (
                  <DropdownItem
                    key={option.value}
                    onClick={() => {
                      setSelectedRole(option.value);
                      setIsRoleOpen(false);
                    }}
                    className={`flex items-center w-full px-4 py-2 text-sm text-left ${selectedRole === option.value
                      ? "bg-brand-50 text-brand-500 dark:bg-brand-500/10"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5"
                      }`}
                  >
                    {option.label}
                  </DropdownItem>
                ))}
              </Dropdown>
            </div>

            <div className="relative">
              <Button
                onClick={() => setIsStatusOpen(!isStatusOpen)}
                variant="primary"
                size="sm"
                className="w-40 dropdown-toggle"
                endIcon={
                  <ChevronDownIcon
                    className={`w-5 h-5 transition-transform duration-200 ${isStatusOpen ? "rotate-180" : ""
                      }`}
                  />
                }
              >
                {getStatusLabel(selectedStatus)}
              </Button>
              <Dropdown
                isOpen={isStatusOpen}
                onClose={() => setIsStatusOpen(false)}
                className="w-40 mt-2 overflow-hidden bg-white border border-gray-200 rounded-lg shadow-lg dark:bg-gray-900 dark:border-gray-800"
              >
                {statusOptions.map((option) => (
                  <DropdownItem
                    key={option.value}
                    onClick={() => {
                      setSelectedStatus(option.value);
                      setIsStatusOpen(false);
                    }}
                    className={`flex items-center w-full px-4 py-2 text-sm text-left ${selectedStatus === option.value
                      ? "bg-brand-50 text-brand-500 dark:bg-brand-500/10"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5"
                      }`}
                  >
                    {option.label}
                  </DropdownItem>
                ))}
              </Dropdown>
            </div>
            <div className="relative">
              <Button
                onClick={() => setIsAddModalOpen(true)}
                variant="primary"
                size="sm"
                className="ml-auto"
              >
                Create Accounts
              </Button>
            </div>
          </div>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Name
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Email
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Role
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Status
                    </TableCell>
                    {(isAdmin || currentUserRole === "WEB_MASTER") && (
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Profile & Gamefy Pack
                      </TableCell>
                    )}
                    {(isAdmin || currentUserRole === "WEB_MASTER") && (
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Coaching Pack
                      </TableCell>
                    )}
                    {isAdmin && (
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Actions
                      </TableCell>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="px-5 py-10 text-center text-gray-500">
                        Loading users...
                      </TableCell>
                    </TableRow>
                  ) : currentUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="px-5 py-10 text-center text-gray-500">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="px-5 py-4 sm:px-6 text-start">
                          <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {user.firstName} {user.lastName}
                          </span>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {user.email}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          <Badge size="sm" color={getRoleBadgeColor(user.role)}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-gray-900 text-start text-theme-sm dark:text-gray-400">
                          {(isAdmin || currentUserRole === "WEB_MASTER") &&
                            currentUserId !== user.id ? (
                            <div className="relative">
                              <button
                                onClick={() =>
                                  setStatusDropdownOpen(
                                    statusDropdownOpen === user.id
                                      ? null
                                      : user.id,
                                  )
                                }
                                className="dropdown-toggle flex items-center gap-1 px-3 py-1.5 rounded-md border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                              >
                                <Badge
                                  size="sm"
                                  color={
                                    user.status === "ACTIVE"
                                      ? "success"
                                      : "error"
                                  }
                                >
                                  {user.status}
                                </Badge>
                                <ChevronDownIcon
                                  className={`w-3 h-3 text-gray-400 transition-transform duration-200 ease-in-out ${statusDropdownOpen === user.id ? "rotate-180" : ""}`}
                                />
                              </button>

                              <Dropdown
                                isOpen={statusDropdownOpen === user.id}
                                onClose={() => setStatusDropdownOpen(null)}
                              >
                                <DropdownItem
                                  className="text-white"
                                  onClick={() =>
                                    handleStatusChange(user.id, "ACTIVE")
                                  }
                                >
                                  Active
                                </DropdownItem>
                                <DropdownItem
                                  className="text-white"
                                  onClick={() =>
                                    handleStatusChange(user.id, "INACTIVE")
                                  }
                                >
                                  Inactive
                                </DropdownItem>
                              </Dropdown>
                            </div>
                          ) : (
                            <Badge
                              size="sm"
                              color={
                                user.status === "ACTIVE" ? "success" : "error"
                              }
                            >
                              {user.status}
                            </Badge>
                          )}
                        </TableCell>
                        {(isAdmin || currentUserRole === "WEB_MASTER") && (
                          <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                            <div className="flex items-center gap-2">
                              {user.role === "COACH" && (
                                <button
                                  onClick={() => {
                                    setSelectedCoach(user);
                                    setIsCoachModalOpen(true);
                                  }}
                                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand-500/10 text-brand-500 hover:bg-brand-500 hover:text-white transition-all group"
                                  title="View Coaching Profile"
                                >
                                  <span>Coaching Profile</span>
                                </button>
                              )}
                              {user.role === "PLAYER" &&
                                (user.packGamefyId != null ? (
                                  <div className="flex flex-col items-start gap-1">
                                    <div className="flex items-center gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setUserToRemovePack(user);
                                          setIsRemovePackModalOpen(true);
                                        }}
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-error-500/10 text-error-600 dark:text-error-400 hover:bg-error-500 hover:text-white transition-all group"
                                        title="Remove Gamefy pack assignment"
                                      >
                                        <TrashBinIcon className="w-4 h-4" />
                                        <span>Remove</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleRenewPack(user)}
                                        disabled={renewPackLoading === user.id}
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-success-500/10 text-success-600 dark:text-success-400 hover:bg-success-500 hover:text-white transition-all group disabled:opacity-50"
                                        title="Renew Gamefy pack (restore all benefits)"
                                      >
                                        {renewPackLoading === user.id ? (
                                          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin inline-block"></span>
                                        ) : (
                                          <span>⟳</span>
                                        )}
                                        <span>Renew</span>
                                      </button>
                                    </div>
                                    <span
                                      className="inline-block max-w-[10rem]"
                                      title={
                                        user.packGamefyName?.trim() ||
                                        `Pack #${user.packGamefyId}`
                                      }
                                    >
                                      <Badge size="sm" variant="light" color="primary">
                                        <span className="truncate inline-block max-w-[10rem] align-bottom">
                                          {user.packGamefyName?.trim() ||
                                            `Pack #${user.packGamefyId}`}
                                        </span>
                                      </Badge>
                                    </span>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setUserForPack(user);
                                      setIsAssignPackModalOpen(true);
                                    }}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand-500/10 text-brand-500 hover:bg-brand-500 hover:text-white transition-all group"
                                    title="Assign a Gamefy pack"
                                  >
                                    <BoxIcon width="16" height="16" />
                                    <span>Assign pack</span>
                                  </button>
                                ))}
                              {user.role !== "COACH" && user.role !== "PLAYER" && (
                                <span className="text-gray-400 italic text-xs">N/A</span>
                              )}
                            </div>
                          </TableCell>
                        )}
                        {(isAdmin || currentUserRole === "WEB_MASTER") && (
                          <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                            <div className="flex items-center gap-2">
                              {user.role === "PLAYER" &&
                                (user.packCoachingId != null ? (
                                  <div className="flex flex-col items-start gap-1">
                                    <div className="flex items-center gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setUserToRemoveCoachingPack(user);
                                          setIsRemoveCoachingPackModalOpen(true);
                                        }}
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-error-500/10 text-error-600 dark:text-error-400 hover:bg-error-500 hover:text-white transition-all group"
                                        title="Remove Coaching pack assignment"
                                      >
                                        <TrashBinIcon className="w-4 h-4" />
                                        <span>Remove</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleRenewCoachingPack(user)}
                                        disabled={renewCoachingPackLoading === user.id}
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-success-500/10 text-success-600 dark:text-success-400 hover:bg-success-500 hover:text-white transition-all group disabled:opacity-50"
                                        title="Renew Coaching pack (restore all benefits)"
                                      >
                                        {renewCoachingPackLoading === user.id ? (
                                          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin inline-block"></span>
                                        ) : (
                                          <span>⟳</span>
                                        )}
                                        <span>Renew</span>
                                      </button>
                                    </div>
                                    <span
                                      className="inline-block max-w-[10rem]"
                                      title={
                                        user.packCoachingName?.trim() ||
                                        `Pack #${user.packCoachingId}`
                                      }
                                    >
                                      <Badge size="sm" variant="light" color="warning">
                                        <span className="truncate inline-block max-w-[10rem] align-bottom">
                                          {user.packCoachingName?.trim() ||
                                            `Pack #${user.packCoachingId}`}
                                        </span>
                                      </Badge>
                                    </span>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setUserForCoachingPack(user);
                                      setIsAssignCoachingPackModalOpen(true);
                                    }}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand-500/10 text-brand-500 hover:bg-brand-500 hover:text-white transition-all group"
                                    title="Assign a Coaching pack"
                                  >
                                    <BoxIcon width="16" height="16" />
                                    <span>Assign pack</span>
                                  </button>
                                ))}
                              {user.role !== "PLAYER" && (
                                <span className="text-gray-400 italic text-xs">N/A</span>
                              )}
                            </div>
                          </TableCell>
                        )}
                        {isAdmin && (
                          <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                            {currentUserId !== null &&
                              user.id !== currentUserId && (
                                <button
                                  onClick={() => {
                                    setUserToDelete(user);
                                    setIsDeleteModalOpen(true);
                                  }}
                                  className="text-gray-500 hover:text-error-500 transition-colors"
                                  title="Delete User"
                                >
                                  <TrashBinIcon className="w-5 h-5" />
                                </button>
                              )}
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
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        </ComponentCard>
      </div>

      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchUsers}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setUserToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        userName={
          userToDelete
            ? `${userToDelete.firstName} ${userToDelete.lastName}`
            : ""
        }
        loading={deleteLoading}
      />

      <DeleteConfirmationModal
        isOpen={isRemovePackModalOpen}
        onClose={() => {
          setIsRemovePackModalOpen(false);
          setUserToRemovePack(null);
        }}
        onConfirm={handleConfirmRemovePack}
        userName={
          userToRemovePack
            ? `${userToRemovePack.firstName} ${userToRemovePack.lastName}`
            : ""
        }
        loading={removePackLoading}
        title="Remove pack assignment"
        description={
          userToRemovePack
            ? `Remove the Gamefy pack from ${userToRemovePack.firstName} ${userToRemovePack.lastName}? They will no longer have pack benefits until a new pack is assigned.`
            : undefined
        }
        confirmLabel="Remove"
      />

      {selectedCoach && (
        <CoachProfileModal
          isOpen={isCoachModalOpen}
          onClose={() => {
            setIsCoachModalOpen(false);
            setSelectedCoach(null);
          }}
          userId={selectedCoach.id}
          userName={`${selectedCoach.firstName} ${selectedCoach.lastName}`}
          isAdmin={isAdmin}
        />
      )}

      {userForPack && (
        <AssignPackModal
          isOpen={isAssignPackModalOpen}
          onClose={() => {
            setIsAssignPackModalOpen(false);
            setUserForPack(null);
          }}
          userId={userForPack.id}
          userName={`${userForPack.firstName} ${userForPack.lastName}`}
          onSuccess={fetchUsers}
        />
      )}

      {userForCoachingPack && (
        <AssignCoachingPackModal
          isOpen={isAssignCoachingPackModalOpen}
          onClose={() => {
            setIsAssignCoachingPackModalOpen(false);
            setUserForCoachingPack(null);
          }}
          userId={userForCoachingPack.id}
          userName={`${userForCoachingPack.firstName} ${userForCoachingPack.lastName}`}
          onSuccess={fetchUsers}
        />
      )}

      <DeleteConfirmationModal
        isOpen={isRemoveCoachingPackModalOpen}
        onClose={() => {
          setIsRemoveCoachingPackModalOpen(false);
          setUserToRemoveCoachingPack(null);
        }}
        onConfirm={handleConfirmRemoveCoachingPack}
        userName={
          userToRemoveCoachingPack
            ? `${userToRemoveCoachingPack.firstName} ${userToRemoveCoachingPack.lastName}`
            : ""
        }
        loading={removeCoachingPackLoading}
        title="Remove coaching pack assignment"
        description={
          userToRemoveCoachingPack
            ? `Remove the Coaching pack from ${userToRemoveCoachingPack.firstName} ${userToRemoveCoachingPack.lastName}? They will no longer have pack benefits until a new pack is assigned.`
            : undefined
        }
        confirmLabel="Remove"
      />
    </>
  );
}

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
import Badge from "../components/ui/badge/Badge";
import { userApi } from "../api/user";
import { getUserId, getUserRole } from "../utils/jwt";
import toast from "react-hot-toast";
import Button from "../components/ui/button/Button";
import { Dropdown } from "../components/ui/dropdown/Dropdown";
import { DropdownItem } from "../components/ui/dropdown/DropdownItem";
import { ChevronDownIcon, PlusIcon, TrashBinIcon } from "../icons";
import AddUserModal from "../components/modals/addUser";
import DeleteConfirmationModal from "../components/modals/deleteConfirmation";

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState<number | null>(
    null,
  );

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

  const filteredUsers = users.filter((user) => {
    const roleMatch = selectedRole === "ALL" || user.role === selectedRole;
    const statusMatch =
      selectedStatus === "ALL" || user.status === selectedStatus;
    return roleMatch && statusMatch;
  });

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

  const handleStatusChange = async (userId: number, newStatus: string) => {
    // 1. Optimistic Update
    const previousUsers = [...users];
    setUsers(
      users.map((u) => (u.id === userId ? { ...u, status: newStatus } : u)),
    );
    setStatusDropdownOpen(null);

    // 2. Loading Notification
    const promise = (async () => {
      const enabled = newStatus === "ACTIVE";
      await userApi.updateUserStatus(userId, enabled);
    })();

    toast.promise(promise, {
      loading: "Updating status and sending email notification...",
      success: "Status updated and email sent successfully!",
      error: (err) => {
        // Revert optimistic update on error
        setUsers(previousUsers);
        return err.message || "Failed to update user status";
      },
    });

    try {
      await promise;
      // Optional: fetchUsers() to ensure consistency with server
      // fetchUsers();
    } catch (error) {
      // Error handled by toast.promise
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
            {/* Role Filter Dropdown */}
            <div className="relative">
              <Button
                onClick={() => setIsRoleOpen(!isRoleOpen)}
                variant="primary"
                size="sm"
                className="w-40 dropdown-toggle"
                endIcon={
                  <ChevronDownIcon
                    className={`w-5 h-5 transition-transform duration-200 ${
                      isRoleOpen ? "rotate-180" : ""
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
                    className={`flex items-center w-full px-4 py-2 text-sm text-left ${
                      selectedRole === option.value
                        ? "bg-brand-50 text-brand-500 dark:bg-brand-500/10"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5"
                    }`}
                  >
                    {option.label}
                  </DropdownItem>
                ))}
              </Dropdown>
            </div>

            {/* Status Filter Dropdown */}
            <div className="relative">
              <Button
                onClick={() => setIsStatusOpen(!isStatusOpen)}
                variant="primary"
                size="sm"
                className="w-40 dropdown-toggle"
                endIcon={
                  <ChevronDownIcon
                    className={`w-5 h-5 transition-transform duration-200 ${
                      isStatusOpen ? "rotate-180" : ""
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
                    className={`flex items-center w-full px-4 py-2 text-sm text-left ${
                      selectedStatus === option.value
                        ? "bg-brand-50 text-brand-500 dark:bg-brand-500/10"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5"
                    }`}
                  >
                    {option.label}
                  </DropdownItem>
                ))}
              </Dropdown>
            </div>

            {/* Add User Button */}
            <Button
              onClick={() => setIsAddModalOpen(true)}
              variant="primary"
              size="sm"
              className="ml-auto"
            >
              Create Accounts
            </Button>
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
                      <TableCell
                        colSpan={4}
                        className="px-5 py-10 text-center text-gray-500"
                      >
                        Loading users...
                      </TableCell>
                    </TableRow>
                  ) : filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="px-5 py-10 text-center text-gray-500"
                      >
                        No users match the selected filters
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
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
    </>
  );
}

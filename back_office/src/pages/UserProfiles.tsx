import { useState, useEffect } from "react";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import UserMetaCard from "../components/UserProfile/UserMetaCard";
import UserInfoCard from "../components/UserProfile/UserInfoCard";
import PageMeta from "../components/common/PageMeta";
import { getUserId } from "../utils/jwt";
import { userApi, UserResponseDto } from "../api/user";
import toast from "react-hot-toast";

export default function UserProfiles() {
  const [user, setUser] = useState<UserResponseDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const userId = getUserId();
      if (!userId) {
        toast.error("User not found");
        setLoading(false);
        return;
      }

      try {
        const userData = await userApi.getUserById(userId);
        setUser(userData);
      } catch (error: any) {
        toast.error(error.message || "Failed to fetch user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  return (
    <>
      <PageMeta
        title="Profile | Gamefy Registry"
        description="User profile page"
      />
      <PageBreadcrumb pageTitle="Profile" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          Profile
        </h3>
        <div className="space-y-6">
          {user && (
            <>
              <UserMetaCard user={user} onUserUpdate={setUser} />
              <UserInfoCard user={user} onUserUpdate={setUser} />
            </>
          )}
        </div>
      </div>
    </>
  );
}

import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import { userApi, UserResponseDto } from "../../api/user";
import {
  reservationApi,
  ReservationDto,
} from "../../api/reservation";

export default function Home() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserResponseDto[]>([]);
  const [reservations, setReservations] = useState<ReservationDto[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isLoadingReservations, setIsLoadingReservations] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await userApi.getAllUsers();
        setUsers(data);
      } catch (e) {
        console.error("Failed to fetch users", e);
      } finally {
        setIsLoadingUsers(false);
      }
    };

    const fetchReservations = async () => {
      try {
        const data = await reservationApi.getAllReservations();
        setReservations(data);
      } catch (e) {
        console.error("Failed to fetch reservations", e);
      } finally {
        setIsLoadingReservations(false);
      }
    };

    fetchUsers();
    fetchReservations();
  }, []);

  // Count users by role
  const playerCount = users.filter((u) => u.role === "PLAYER").length;
  const coachCount = users.filter((u) => u.role === "COACH").length;
  const adminCount = users.filter((u) => u.role === "ADMIN").length;
  const webMasterCount = users.filter((u) => u.role === "WEB_MASTER").length;

  // Latest 3 reservations sorted by newest
  const latestReservations = [...reservations]
    .sort((a, b) => {
      const dateA = new Date(
        a.createdAt?.includes("Z") ? a.createdAt : a.createdAt + "Z"
      );
      const dateB = new Date(
        b.createdAt?.includes("Z") ? b.createdAt : b.createdAt + "Z"
      );
      return dateB.getTime() - dateA.getTime();
    })
    .slice(0, 3);

  const statusColors: Record<string, string> = {
    CONFIRMED:
      "bg-green-500/10 text-green-400 border border-green-500/20",
    PENDING:
      "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
    CANCELLED:
      "bg-red-500/10 text-red-400 border border-red-500/20",
  };

  const formatDateTime = (isoString: string) => {
    if (!isoString) return "N/A";
    const date = new Date(
      isoString.includes("Z") ? isoString : isoString + "Z"
    );
    return date.toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const roleCards = [
    {
      label: "Players",
      count: playerCount,
      icon: (
        <svg className="fill-current" width="22" height="22" viewBox="0 0 24 24">
          <path d="M15 11h7v2h-7zm1 4h6v2h-6zm-2-8h8v2h-8zM4 19h10v-1c0-2.757-2.243-5-5-5H7c-2.757 0-5 2.243-5 5v1h2zm4-7c1.995 0 3.5-1.505 3.5-3.5S9.995 5 8 5 4.5 6.505 4.5 8.5 6.005 12 8 12z" />
        </svg>
      ),
      gradient: "from-blue-500/20 to-blue-600/5",
      textColor: "text-blue-400",
      borderColor: "border-blue-500/20 hover:border-blue-400/40",
    },
    {
      label: "Coaches",
      count: coachCount,
      icon: (
        <svg className="fill-current" width="22" height="22" viewBox="0 0 24 24">
          <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm1 17.931V17h-2v2.931A8.008 8.008 0 0 1 4.069 13H7v-2H4.069A8.008 8.008 0 0 1 11 4.069V7h2V4.069A8.008 8.008 0 0 1 19.931 11H17v2h2.931A8.008 8.008 0 0 1 13 19.931z" />
        </svg>
      ),
      gradient: "from-emerald-500/20 to-emerald-600/5",
      textColor: "text-emerald-400",
      borderColor: "border-emerald-500/20 hover:border-emerald-400/40",
    },
    {
      label: "Admins",
      count: adminCount,
      icon: (
        <svg className="fill-current" width="22" height="22" viewBox="0 0 24 24">
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
        </svg>
      ),
      gradient: "from-purple-500/20 to-purple-600/5",
      textColor: "text-purple-400",
      borderColor: "border-purple-500/20 hover:border-purple-400/40",
    },
    {
      label: "Web Masters",
      count: webMasterCount,
      icon: (
        <svg className="fill-current" width="22" height="22" viewBox="0 0 24 24">
          <path d="M20 3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H4V5h16v14zM6 7h5v2H6zm0 4h5v2H6zm0 4h12v2H6zm7-8h5v6h-5z" />
        </svg>
      ),
      gradient: "from-amber-500/20 to-amber-600/5",
      textColor: "text-amber-400",
      borderColor: "border-amber-500/20 hover:border-amber-400/40",
    },
  ];

  return (
    <>
      <PageMeta
        title="Dashboard | Gamefy Back-Office"
        description="Gamefy Back-Office Dashboard"
      />

      <div className="space-y-6">
        {/* Role Count Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 md:gap-6">
          {roleCards.map((card) => (
            <div
              key={card.label}
              className={`rounded-2xl border bg-gradient-to-br ${card.gradient} ${card.borderColor} p-5 dark:bg-gray-900 transition-all duration-200`}
            >
              <div className="flex items-center justify-between">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 ${card.textColor}`}
                >
                  {card.icon}
                </div>
              </div>

              <div className="mt-5">
                <h4 className="text-2xl font-bold text-gray-800 dark:text-white/90">
                  {isLoadingUsers ? (
                    <div className="h-8 w-12 animate-pulse rounded bg-white/10" />
                  ) : (
                    card.count
                  )}
                </h4>
                <span className="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                  {card.label}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Latest Reservations Table */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Latest Reservations
            </h3>
            <button
              onClick={() => navigate("/reservations")}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-500/10 px-4 py-2 text-sm font-medium text-brand-500 hover:bg-brand-500 hover:text-white transition-all duration-200 dark:bg-brand-500/10 dark:text-brand-400 dark:hover:bg-brand-500 dark:hover:text-white"
            >
              See All
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M6 12l4-4-4-4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          <div className="overflow-x-auto">
            {isLoadingReservations ? (
              <div className="flex items-center justify-center py-10">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500/20 border-t-brand-500" />
              </div>
            ) : latestReservations.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Player
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Date &amp; Time
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Payment
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {latestReservations.map((res) => (
                    <tr
                      key={res.id}
                      className="transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                    >
                      <td className="whitespace-nowrap px-4 py-4">
                        <span className="text-sm font-medium text-gray-800 dark:text-white/80">
                          {res.playerName || "Unknown"}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4">
                        <span className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 dark:bg-white/5 dark:text-gray-300">
                          {res.reservationType?.replace("_", " ")}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {formatDateTime(res.startTime)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4">
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {res.paymentType || "N/A"}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                            statusColors[res.status] ||
                            "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {res.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400 dark:text-gray-500">
                <svg
                  className="mb-3"
                  width="40"
                  height="40"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <p className="text-sm font-medium">No reservations yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

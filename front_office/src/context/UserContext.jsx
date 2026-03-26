import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { profileApi } from "../api/profile";
import { getUserId } from "../utils/jwt";

const UserContext = createContext(null);

/**
 * Provides the logged-in user profile to the entire app.
 * Fetches only once on mount (or when refreshUser() is called).
 */
export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoadingUser, setIsLoadingUser] = useState(true);

    const fetchUser = useCallback(async () => {
        const userId = getUserId();
        if (!userId) {
            setIsLoadingUser(false);
            return;
        }
        try {
            const data = await profileApi.getProfile(userId);
            setUser(data);
        } catch (error) {
            console.error("UserContext: failed to load user", error);
        } finally {
            setIsLoadingUser(false);
        }
    }, []);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    /** Call this after a profile update so all consumers get the new data */
    const refreshUser = useCallback(() => {
        setIsLoadingUser(true);
        fetchUser();
    }, [fetchUser]);

    return (
        <UserContext.Provider value={{ user, setUser, isLoadingUser, refreshUser }}>
            {children}
        </UserContext.Provider>
    );
};

/** Hook to consume the user context */
export const useUser = () => {
    const ctx = useContext(UserContext);
    if (!ctx) throw new Error("useUser must be used inside <UserProvider>");
    return ctx;
};

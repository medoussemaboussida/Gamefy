import { jwtDecode } from "jwt-decode";

export const decodeToken = (token) => {
    try {
        return jwtDecode(token);
    } catch (error) {
        console.error("Invalid token:", error);
        return null;
    }
};

export const getUser = () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return null;
    return decodeToken(token);
};

export const getUserId = () => {
    const user = getUser();
    return user ? user.userId : null;
};

export const getUserRole = () => {
    const user = getUser();
    return user ? user.role : null;
};

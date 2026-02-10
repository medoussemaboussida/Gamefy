import { jwtDecode } from "jwt-decode";

export interface DecodedToken {
    sub: string; // email
    role: string;
    userId: number;
    exp: number;
    iat: number;
}

export const decodeToken = (token: string): DecodedToken | null => {
    try {
        return jwtDecode<DecodedToken>(token);
    } catch (error) {
        console.error("Invalid token:", error);
        return null;
    }
};

export const getUser = (): DecodedToken | null => {
    const token = localStorage.getItem("accessToken");
    if (!token) return null;
    return decodeToken(token);
};


export const getUserId = (): number | null => {
    const user = getUser();
    return user ? user.userId : null;
};

export const getUserRole = (): string | null => {
    const user = getUser();
    return user ? user.role : null;
};

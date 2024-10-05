import axios, { AxiosError } from "axios";
import dayjs from "dayjs";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import * as WebBrowser from "expo-web-browser";
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";
import { UserProfile } from "~/lib/types";

interface AuthContextType {
    user: UserProfile | null;
    accessToken?: string;
    isSignedIn: boolean;
    isLoaded: boolean;
    signIn: () => Promise<void>;
    signOut: () => Promise<void>;
    refreshAccessToken: () => Promise<boolean>;
    loadAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const ACCESS_TOKEN_EXPIRY_KEY = "access_token_expiry";
const REFRESH_TOKEN_EXPIRY_KEY = "refresh_token_expiry";

const API_ENDPOINT = process.env.EXPO_PUBLIC_API_ENDPOINT;
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const router = useRouter();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isSignedIn, setIsSignedIn] = useState<boolean>(false);
    const [isLoaded, setIsLoaded] = useState<boolean>(false);
    const [accessToken, setAccessToken] = useState<string | null>(null);

    const resetState = () => {
        setAccessToken(null);
        setUser(null);
        setIsSignedIn(false);
    };

    const deleteStoredTokens = async () => {
        await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
        await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
        await SecureStore.deleteItemAsync(ACCESS_TOKEN_EXPIRY_KEY);
        await SecureStore.deleteItemAsync(REFRESH_TOKEN_EXPIRY_KEY);
    };

    const signIn = useCallback(async () => {
        try {
            const endpoint = new URL(
                API_ENDPOINT + "/auth/signin?provider=google"
            );
            const result = await WebBrowser.openAuthSessionAsync(
                endpoint.toString()
            );

            if (result.type === "success") {
                const parsedUrl = new URL(result.url);

                const access_token = parsedUrl.searchParams.get("access_token");
                const refresh_token =
                    parsedUrl.searchParams.get("refresh_token");

                if (access_token && refresh_token) {
                    // TODO: Get expiry from actual API response
                    const accessTokenExpiry = dayjs().add(15, "minutes");
                    const refreshTokenExpiry = dayjs().add(30, "days");

                    await SecureStore.setItemAsync(
                        ACCESS_TOKEN_KEY,
                        access_token
                    );
                    await SecureStore.setItemAsync(
                        REFRESH_TOKEN_KEY,
                        refresh_token
                    );
                    await SecureStore.setItemAsync(
                        ACCESS_TOKEN_EXPIRY_KEY,
                        accessTokenExpiry.toString()
                    );
                    await SecureStore.setItemAsync(
                        REFRESH_TOKEN_EXPIRY_KEY,
                        refreshTokenExpiry.toString()
                    );

                    setAccessToken(access_token);

                    console.log("Auth Tokens saved");

                    const user = await getUserProfile();

                    setUser(user);
                    setIsSignedIn(true);

                    router.replace("/(authenticated)/(tabs)/home");
                }
            } else if (result.type === "cancel") {
                console.log("User canceled the sign-in flow.");
            }
            return;
        } catch (error) {
            console.error("Failed to sign in:", error);
            return;
        }
    }, [router]);

    const signOut = useCallback(async () => {
        try {
            const accessToken =
                await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);

            const accessTokenExpiry = await SecureStore.getItemAsync(
                ACCESS_TOKEN_EXPIRY_KEY
            );

            if (!accessToken) {
                await deleteStoredTokens();
                resetState();
                router.replace("/");
                console.log("No access token found. Already signed out.");
                return;
            }

            if (!accessTokenExpiry) {
                console.log(
                    "Access/Refresh token expiry not found. Signing out..."
                );
                await signOut();
                return;
            }

            if (dayjs().isAfter(dayjs(parseInt(accessTokenExpiry)))) {
                console.log("Access token expired. Signing out...");
                await deleteStoredTokens();
                resetState();
                return;
            }

            const res = await axios.get<{ message: string }>(
                API_ENDPOINT + "/auth/signout",
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            if (res.status !== 200) {
                console.error("Failed to sign out:", res.data);
                return;
            }

            await deleteStoredTokens();
            resetState();
            router.replace("/");
            console.log("Signed out successfully");
        } catch (error) {
            const err = error as AxiosError;
            console.error("Failed to sign out:", error, err);
        }
    }, [router]);

    const refreshAccessToken = useCallback(async () => {
        try {
            const refreshToken = await SecureStore.getItemAsync(
                REFRESH_TOKEN_EXPIRY_KEY
            );

            if (!refreshToken) {
                console.log("No refresh token found. Signing out...");
                await deleteStoredTokens();
                resetState();
                router.replace("/");
                return false;
            }

            const accessTokenExpiry = await SecureStore.getItemAsync(
                ACCESS_TOKEN_EXPIRY_KEY
            );
            const refreshTokenExpiry = await SecureStore.getItemAsync(
                REFRESH_TOKEN_EXPIRY_KEY
            );

            if (!accessTokenExpiry || !refreshTokenExpiry) {
                console.log(
                    "Access/Refresh token expiry not found. Signing out..."
                );
                await signOut();
                return false;
            }

            if (dayjs().isAfter(dayjs(parseInt(refreshTokenExpiry)))) {
                console.log("Refresh token expired. Signing out...");
                await signOut();
                return false;
            }

            if (dayjs().isAfter(dayjs(parseInt(accessTokenExpiry)))) {
                const refreshToken =
                    await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
                if (!refreshToken) {
                    await signOut();
                    return false;
                }

                console.log("Access token expired. Refreshing...");

                const res = await axios.get<{ access_token: string }>(
                    API_ENDPOINT + "/auth/refresh",
                    {
                        headers: {
                            Authorization: `Bearer ${refreshToken}`,
                        },
                    }
                );
                const newAccessToken = res.data.access_token;
                const newAccessTokenExpiry = dayjs().add(15, "minutes"); // 15 minutes

                await SecureStore.setItemAsync(
                    ACCESS_TOKEN_KEY,
                    newAccessToken
                );
                await SecureStore.setItemAsync(
                    ACCESS_TOKEN_EXPIRY_KEY,
                    newAccessTokenExpiry.toString()
                );

                return true;
            } else {
                console.log("Access token is still valid");
                console.log(accessTokenExpiry);
                return true;
            }
        } catch (error) {
            const err = error as AxiosError;
            console.error(
                "Failed to refresh access token:",
                JSON.stringify(err)
            );
            await deleteStoredTokens();
            resetState();
            return false;
        }
    }, [signOut]);

    const loadAuth = useCallback(async () => {
        try {
            const refreshed = await refreshAccessToken();
            if (refreshed) {
                const accessToken =
                    await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);

                if (accessToken) {
                    const user = await getUserProfile();
                    setAccessToken(accessToken);
                    setUser(user);
                    setIsSignedIn(true);
                }
            }
        } catch (error) {
            console.error("Failed to load tokens", (error as any).message);
        } finally {
            setIsLoaded(true);
        }
    }, [router]);

    const getUserProfile = useCallback(async () => {
        try {
            const accessToken =
                await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);

            const user = await axios.get<UserProfile>(
                API_ENDPOINT + "/v1/users/profile",
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );
            return user.data;
        } catch (error) {
            console.error("Failed to fetch user profile: ", error);
            return null;
        }
    }, [router]);

    useEffect(() => {
        loadAuth();
    }, [loadAuth]);

    return (
        <AuthContext.Provider
            value={{
                user,
                signIn,
                signOut,
                isSignedIn,
                isLoaded,
                refreshAccessToken,
                accessToken: accessToken || undefined,
                loadAuth,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

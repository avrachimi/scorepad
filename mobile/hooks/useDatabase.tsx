import {
    QueryClientProvider,
    QueryClientProviderProps,
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { CreateMatchParams, Match, Stats, User } from "~/lib/types";
import { useAuth } from "./useAuth";

const apiClient = axios.create({
    baseURL: process.env.EXPO_PUBLIC_API_ENDPOINT + "/v1",
});

function get<T>(url: string, accessToken: string) {
    return apiClient.get<T>(url, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
}

export const DatabaseProvider = ({
    children,
    client,
}: QueryClientProviderProps) => {
    return (
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
};

export const useDatabase = () => {
    const { accessToken, loadAuth } = useAuth();

    const handleAxiosError = async (error: unknown) => {
        const err = error as AxiosError;
        if (err.response?.status === 403) {
            await loadAuth(queryClient);
        } else {
            console.error(err);
        }
    };

    // Users
    const getUsersQuery = useQuery({
        queryKey: ["users"],
        queryFn: async () => {
            try {
                const response = await get<User[]>("/users", accessToken!);
                // console.warn("getUsersQuery");
                return response.data;
            } catch (error) {
                await handleAxiosError(error);
                return null;
            }
        },
        refetchOnWindowFocus: "always",
    });

    // Matches
    const createMatchQuery = useMutation({
        mutationFn: async (match: CreateMatchParams) => {
            try {
                const createdMatch = await apiClient.post<Match>(
                    "/matches",
                    match,
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                        },
                    }
                );
                return createdMatch.data;
            } catch (error) {
                handleAxiosError(error);
                return null;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries();
        },
        onError: (e) => {
            console.log("Failed to create match: ", e);
        },
    });

    const singleMatchQuery = (id: string) =>
        useQuery({
            queryKey: ["singleMatch", id],
            queryFn: async () => {
                try {
                    const response = await get<Match>(
                        "/matches/" + id,
                        accessToken!
                    );
                    return response.data;
                } catch (error) {
                    handleAxiosError(error);
                    return null;
                }
            },
            refetchOnWindowFocus: "always",
        });

    const allMatchesQuery = useQuery({
        queryKey: ["allMatches"],
        queryFn: async () => {
            try {
                const response = await get<Match[]>("/matches", accessToken!);
                return response.data;
            } catch (error) {
                handleAxiosError(error);
                return null;
            }
        },
        refetchOnWindowFocus: "always",
    });

    const recentMatchesQuery = useQuery({
        queryKey: ["recentMatches"],
        queryFn: async () => {
            try {
                const response = await get<Match[]>(
                    "/matches/recent",
                    accessToken!
                );
                // console.warn("recentMatchesQuery");
                return response.data;
            } catch (error) {
                handleAxiosError(error);
                return null;
            }
        },
        refetchOnWindowFocus: "always",
    });

    // Stats
    const statsMatchesQuery = useQuery({
        queryKey: ["statsMatches"],
        queryFn: async () => {
            try {
                const response = await get<Stats>(
                    "/stats?type=matches",
                    accessToken!
                );
                // console.warn("statsMatchesQuery");
                return response.data;
            } catch (error) {
                handleAxiosError(error);
                return null;
            }
        },
        refetchOnWindowFocus: "always",
    });

    const statsLeaderboardQuery = useQuery({
        queryKey: ["statsLeaderboard"],
        queryFn: async () => {
            try {
                const response = await get<Stats>(
                    "/stats?type=leaderboard",
                    accessToken!
                );
                return response.data;
            } catch (error) {
                handleAxiosError(error);
                return null;
            }
        },
        refetchOnWindowFocus: "always",
    });

    // Invalidations
    const queryClient = useQueryClient();
    const invalidateQueries = async (queries: string[]) => {
        for (const key of queries) {
            await queryClient.invalidateQueries({
                queryKey: [key],
                refetchType: "active",
            });
            // await queryClient.refetchQueries();
        }
    };

    return {
        createMatchQuery,
        getUsersQuery,
        allMatchesQuery,
        recentMatchesQuery,
        statsMatchesQuery,
        singleMatchQuery,
        statsLeaderboardQuery,
        invalidateQueries,
    };
};

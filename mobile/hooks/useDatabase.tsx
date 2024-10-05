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
    const { accessToken } = useAuth();

    // Users
    const getUsersQuery = useQuery({
        queryKey: ["users"],
        queryFn: async () => {
            const response = await get<User[]>("/users", accessToken!);
            // console.warn("getUsersQuery");
            return response.data;
        },
    });

    // Matches
    const createMatchQuery = useMutation({
        mutationFn: async (match: CreateMatchParams) => {
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
            queryKey: ["singleMatches"],
            queryFn: async () => {
                const response = await get<Match>(
                    "/matches/" + id,
                    accessToken!
                );
                return response.data;
            },
        });

    const allMatchesQuery = useQuery({
        queryKey: ["allMatches"],
        queryFn: async () => {
            const response = await get<Match[]>("/matches", accessToken!);
            return response.data;
        },
    });

    const recentMatchesQuery = useQuery({
        queryKey: ["recentMatches"],
        queryFn: async () => {
            const response = await get<Match[]>(
                "/matches/recent",
                accessToken!
            );
            // console.warn("recentMatchesQuery");
            return response.data;
        },
    });

    // Stats
    const statsMatchesQuery = useQuery({
        queryKey: ["statsMatches"],
        queryFn: async () => {
            const response = await get<Stats>(
                "/stats?type=matches",
                accessToken!
            );
            // console.warn("statsMatchesQuery");
            return response.data;
        },
    });

    const statsLeaderboardQuery = useQuery({
        queryKey: ["statsLeaderboard"],
        queryFn: async () => {
            try {
                const response = await get<Stats>(
                    "/stats?type=leaderboard",
                    accessToken!
                );
                console.log("statsLeaderboardQuery", response.data);
                return response.data;
            } catch (error) {
                const err = error as AxiosError;
                console.error("Failed to get leaderboard stats:", err.message);
                return null;
            }
        },
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

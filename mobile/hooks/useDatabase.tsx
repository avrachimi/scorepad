import {
    QueryClientProvider,
    QueryClientProviderProps,
    useQueryClient,
} from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { CreateMatchParams, Match, Stats } from "~/lib/types";
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

    // Matches
    const createMatchQuery = async (match: CreateMatchParams) => {
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
    };

    const singleMatchQuery = async (id: string) => {
        try {
            const match = await apiClient.get<Match>(`/matches/${id}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            return match.data;
        } catch (error) {
            handleAxiosError(error);
            return null;
        }
    };

    const allMatchesQuery = async () => {
        try {
            const matches = await apiClient.get<Match[]>("/matches", {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            return matches.data;
        } catch (error) {
            handleAxiosError(error);
            return null;
        }
    };

    const recentMatchesQuery = async () => {
        try {
            const response = await apiClient.get<Match[]>("/matches/recent", {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            return response.data;
        } catch (error) {
            handleAxiosError(error);
            return null;
        }
    };

    // Stats
    const statsMatchesQuery = async () => {
        try {
            const response = await get<Stats>(
                "/stats?type=matches",
                accessToken!
            );
            return response.data;
        } catch (error) {
            handleAxiosError(error);
            return null;
        }
    };

    const statsLeaderboardQuery = async () => {
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
    };

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
        allMatchesQuery,
        recentMatchesQuery,
        statsMatchesQuery,
        singleMatchQuery,
        statsLeaderboardQuery,
        invalidateQueries,
    };
};

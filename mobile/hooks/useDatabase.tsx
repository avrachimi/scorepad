import {
    QueryClientProvider,
    QueryClientProviderProps,
    useQuery,
} from "@tanstack/react-query";
import axios from "axios";
import { Match, Stats, User } from "~/lib/types";
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
            console.log(response.data);
            return response.data;
        },
    });

    // Matches
    const recentMatchesQuery = useQuery({
        queryKey: ["recentMatches"],
        queryFn: async () => {
            const response = await get<Match[]>(
                "/matches/recent",
                accessToken!
            );
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
            return response.data;
        },
    });

    return {
        getUsersQuery,
        recentMatchesQuery,
        statsMatchesQuery,
    };
};

import {
    QueryClientProvider,
    QueryClientProviderProps,
    useQuery,
} from "@tanstack/react-query";
import axios from "axios";
import { User } from "~/lib/types";

const apiClient = axios.create({
    baseURL: process.env.EXPO_PUBLIC_API_ENDPOINT + "/v1",
});

export const DatabaseProvider = ({
    children,
    client,
}: QueryClientProviderProps) => {
    return (
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
};

export const useDatabase = () => {
    const getUsersQuery = useQuery({
        queryKey: ["users"],
        queryFn: async () => {
            const response = await apiClient.get<User[]>("/users");
            console.log(response.data);
            return response.data;
        },
    });

    const recentMatchesQuery = useQuery({
        queryKey: ["recentMatches"],
        queryFn: async () => {
            const response = await apiClient.get("/matches/recent");
            return response.data;
        },
    });

    return {
        getUsersQuery,
        recentMatchesQuery,
    };
};

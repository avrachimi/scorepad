import axios from "axios";
import { User } from "~/lib/types";
import { useAuth } from "./useAuth";

const apiClient = axios.create({
    baseURL: process.env.EXPO_PUBLIC_API_ENDPOINT + "/v1",
});

const getUsers = async () => {
    try {
        const response = await apiClient.get<User[]>("/users");
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error(error);
        return null;
    }
};

export const useAPI = () => {
    const { accessToken } = useAuth();

    if (accessToken) {
        apiClient.defaults.headers.common["Authorization"] =
            `Bearer ${accessToken}`;
    }

    return {
        getUsers,
    };
};

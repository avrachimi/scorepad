import { Ionicons } from "@expo/vector-icons";
import { DefaultTheme } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useAuth } from "~/hooks/useAuth";
import { Colors } from "~/lib/theme";
import { Friend } from "~/lib/types";

type SelectedPlayer = {
    id: string;
    name: string;
    image_url?: string;
};

interface SelectPlayerProps {
    handleToggleView: (playerSelection?: {
        playerNum: number;
        player?: SelectedPlayer;
    }) => void;
    selectedUserIds: string[];
    selectedPlayer: {
        id?: string;
        name?: string;
        num: number;
    };
}

function SelectPlayerPage({
    handleToggleView,
    selectedUserIds,
    selectedPlayer,
}: SelectPlayerProps) {
    const [searchQuery, setSearchQuery] = useState<string>();
    const { accessToken } = useAuth();

    const { data: players, isLoading: loadingPlayers } = useQuery({
        queryKey: ["getSearchFriendsList", searchQuery],
        queryFn: async () => {
            try {
                console.log("searchQuery", searchQuery);
                console.log("selectedUserIds", selectedUserIds);
                const friends = await axios.get<Friend[]>(
                    process.env.EXPO_PUBLIC_API_ENDPOINT + "/v1/friends",
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                        },
                        params: {
                            exclude: selectedUserIds,
                            search: searchQuery,
                        },
                    }
                );
                console.log(friends.request);
                return friends.data;
            } catch (error) {
                const err = error as AxiosError;
                console.error(err);
                return [];
            }
        },
    });

    return (
        <View>
            <View
                style={{
                    flexDirection: "row",
                    width: "100%",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingHorizontal: 21,
                    paddingVertical: 15,
                    shadowColor: "#000",
                    shadowOpacity: 0.1,
                    shadowRadius: 3,
                    shadowOffset: {
                        width: 0,
                        height: 1,
                    },
                }}
            >
                <TouchableOpacity
                    onPress={() => handleToggleView()}
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 2,
                        width: 70,
                    }}
                >
                    <Ionicons
                        name="chevron-back"
                        size={20}
                        color={DefaultTheme.colors.primary}
                    />
                    <Text
                        style={{
                            color: DefaultTheme.colors.primary,
                            fontSize: 17,
                        }}
                    >
                        Back
                    </Text>
                </TouchableOpacity>
                <Text
                    style={{
                        fontSize: 17,
                        fontWeight: "600",
                        flex: 1,
                        textAlign: "center",
                    }}
                >
                    Select Player
                </Text>
                {selectedPlayer.id ? (
                    <TouchableOpacity
                        onPress={() =>
                            handleToggleView({ playerNum: selectedPlayer.num })
                        }
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 2,
                            width: 70,
                        }}
                    >
                        <Text
                            style={{
                                color: DefaultTheme.colors.primary,
                                fontSize: 17,
                            }}
                        >
                            Remove
                        </Text>
                    </TouchableOpacity>
                ) : (
                    <View style={{ width: 70 }}></View>
                )}
            </View>
            <TextInput
                style={styles.searchBar}
                returnKeyType="search"
                placeholder="Search"
                placeholderTextColor={"#A0A0A0"}
                value={searchQuery}
                onChangeText={(text) => setSearchQuery(text)}
            />
            {loadingPlayers ? (
                <View
                    style={{
                        width: "100%",
                        height: "50%",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <ActivityIndicator />
                </View>
            ) : players && players.length > 0 ? (
                <FlatList
                    data={players}
                    keyExtractor={(item) => item.id}
                    style={{
                        marginTop: 10,
                    }}
                    contentContainerStyle={{
                        height: "100%",
                        gap: 10,
                    }}
                    renderItem={({ item }) => {
                        return (
                            <TouchableOpacity
                                onPress={() => {
                                    handleToggleView({
                                        playerNum: selectedPlayer.num,
                                        player: {
                                            id: item.id,
                                            name: item.name,
                                            image_url: item.image_url,
                                        },
                                    });
                                }}
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    paddingHorizontal: 20,
                                }}
                            >
                                <View
                                    style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        gap: 10,
                                    }}
                                >
                                    {item.image_url ? (
                                        <Image
                                            style={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: 100,
                                                borderWidth: 1,
                                                borderColor: Colors.primary,
                                            }}
                                            source={{ uri: item.image_url }}
                                        />
                                    ) : (
                                        <Ionicons
                                            name="person-circle"
                                            size={40}
                                            color={Colors.primary}
                                        />
                                    )}
                                    <Text
                                        style={{
                                            fontSize: 17,
                                            fontWeight: "600",
                                        }}
                                    >
                                        {item.name}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        );
                    }}
                />
            ) : (
                <View
                    style={{
                        width: "100%",
                        height: "50%",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <Text
                        style={{
                            fontSize: 17,
                            fontWeight: "600",
                        }}
                    >
                        No players found
                    </Text>
                </View>
            )}
        </View>
    );
}

export default SelectPlayerPage;

const styles = StyleSheet.create({
    searchBar: {
        height: 40,
        borderRadius: 10,
        paddingHorizontal: 10,
        marginHorizontal: 16,
        backgroundColor: "#7878801F",
    },
});

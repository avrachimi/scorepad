import { Ionicons } from "@expo/vector-icons";
import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { forwardRef, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { useAuth } from "~/hooks/useAuth";
import { Colors } from "~/lib/theme";
import { User } from "~/lib/types";

const AddFriendsModal = forwardRef<BottomSheetModal, {}>((props, ref) => {
    const { accessToken } = useAuth();
    const queryClient = useQueryClient();

    const [searchQuery, setSearchQuery] = useState<string>();

    const snapPoints = useMemo(() => ["92%"], []);

    const { data: userList, isLoading: loadingUserList } = useQuery({
        queryKey: ["getSearchFriendsList", searchQuery],
        queryFn: async () => {
            try {
                console.log("searchQuery", searchQuery);
                const users = await axios.get<User[]>(
                    process.env.EXPO_PUBLIC_API_ENDPOINT + "/v1/users",
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                        },
                        params: {
                            search: searchQuery,
                        },
                    }
                );

                return users.data;
            } catch (error) {
                console.error(error);
                return [];
            }
        },
    });

    const {
        mutate: sendFriendRequest,
        isPending: sendingFriendRequest,
        variables: friendRequestVariables,
    } = useMutation({
        mutationKey: ["sendFriendRequest"],
        mutationFn: async (userId: string) => {
            const res = await axios.post(
                process.env.EXPO_PUBLIC_API_ENDPOINT + `/v1/friends`,
                {
                    user_id: userId,
                },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );
            console.log(res.status);
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries();
        },
    });

    const renderBackdrop = (props: any) => {
        return (
            <BottomSheetBackdrop
                appearsOnIndex={0}
                disappearsOnIndex={-1}
                {...props}
            />
        );
    };

    return (
        <BottomSheetModal
            ref={ref}
            snapPoints={snapPoints}
            backdropComponent={renderBackdrop}
            keyboardBehavior="extend"
        >
            <View
                style={{
                    width: "100%",
                    justifyContent: "flex-start",
                    alignItems: "flex-start",
                    gap: 20,
                }}
            >
                <View
                    style={{
                        width: "100%",
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "center",
                        paddingHorizontal: 21,
                    }}
                >
                    <Text
                        style={{
                            fontSize: 17,
                            fontWeight: "600",
                        }}
                    >
                        Add Friends
                    </Text>
                </View>
                <View
                    style={{
                        width: "100%",
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "center",
                        paddingHorizontal: 16,
                    }}
                >
                    <TextInput
                        style={{
                            width: "100%",
                            height: 36,
                            borderRadius: 10,
                            backgroundColor: "#F4F4F4",
                            paddingHorizontal: 10,
                        }}
                        placeholder="Search"
                        placeholderTextColor={"#A0A0A0"}
                        returnKeyType="search"
                        autoFocus
                        value={searchQuery}
                        onChangeText={(text) => setSearchQuery(text)}
                    />
                </View>
                {(!userList || userList.length === 0) && !loadingUserList && (
                    <View
                        style={{
                            width: "100%",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: 10,
                            marginTop: 60,
                        }}
                    >
                        <Text
                            style={{
                                fontSize: 17,
                                fontWeight: "600",
                            }}
                        >
                            No users found
                        </Text>
                        <Text
                            style={{
                                fontSize: 12,
                                opacity: 0.5,
                            }}
                        >
                            Try searching for a different name
                        </Text>
                    </View>
                )}
                <FlatList
                    data={userList}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{
                        width: "100%",
                        justifyContent: "flex-start",
                        alignItems: "center",
                        marginTop: 10,
                    }}
                    ItemSeparatorComponent={() => (
                        <View
                            style={{
                                justifyContent: "center",
                                alignItems: "center",
                                marginVertical: 6,
                            }}
                        >
                            <View
                                style={{
                                    width: "100%",
                                    height: 1,
                                    backgroundColor: Colors.primary,
                                    opacity: 0.3,
                                }}
                            />
                        </View>
                    )}
                    renderItem={({ item: user }) => (
                        <View
                            style={{
                                width: "100%",
                                flexDirection: "row",
                                justifyContent: "space-between",
                                alignItems: "center",
                                paddingHorizontal: 21,
                                gap: 10,
                            }}
                        >
                            <View
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "flex-start",
                                    gap: 10,
                                }}
                            >
                                {user.image_url ? (
                                    <View
                                        style={{
                                            padding: 4.5,
                                            width: 50,
                                            height: 50,
                                        }}
                                    >
                                        <Image
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                borderRadius: 100,
                                            }}
                                            src={user.image_url}
                                        />
                                    </View>
                                ) : (
                                    <Ionicons
                                        name="person-circle"
                                        size={50}
                                        color={Colors.secondary}
                                    />
                                )}
                                <Text
                                    style={{
                                        fontSize: 17,
                                    }}
                                >
                                    {user.name}
                                </Text>
                            </View>
                            <TouchableOpacity
                                style={{
                                    backgroundColor: Colors.primary,
                                    borderRadius: 8,
                                    paddingHorizontal: 15,
                                    paddingVertical: 6,
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                                onPress={() => sendFriendRequest(user.id)}
                            >
                                {sendingFriendRequest &&
                                friendRequestVariables === user.id ? (
                                    <ActivityIndicator />
                                ) : (
                                    <Text
                                        style={{
                                            fontSize: 14,
                                            color: "white",
                                            fontWeight: "600",
                                        }}
                                    >
                                        Add
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    )}
                />
            </View>
        </BottomSheetModal>
    );
});

export default AddFriendsModal;

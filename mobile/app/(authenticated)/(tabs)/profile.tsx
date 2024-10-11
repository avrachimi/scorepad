import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useFocusEffect } from "expo-router";
import { useCallback, useRef } from "react";
import { Alert, Image, Text, TouchableOpacity, View } from "react-native";
import AddFriendsModal from "~/components/modals/AddFriendsModal";
import FriendRequestsModal from "~/components/modals/FriendRequestsModal";
import FriendsListModal from "~/components/modals/FriendsListModal";
import { useAuth } from "~/hooks/useAuth";
import { Colors, globalStyles } from "~/lib/theme";
import { FriendRequest, User } from "~/lib/types";

function Page() {
    const queryClient = useQueryClient();

    const { signOut, user, accessToken, loadAuth } = useAuth();

    const { data: friendRequests, refetch } = useQuery({
        queryKey: ["getFriendRequests"],
        queryFn: async () => {
            const res = await axios.get<FriendRequest[]>(
                process.env.EXPO_PUBLIC_API_ENDPOINT + "/v1/friends/requests",
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            console.log(res.data);
            return res.data;
        },
    });

    const { mutate: updateUser } = useMutation({
        mutationKey: ["updateUser"],
        mutationFn: async (newName: string) => {
            const user = await axios.patch<User>(
                process.env.EXPO_PUBLIC_API_ENDPOINT + "/v1/users",
                {
                    name: newName,
                },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            return user.data;
        },
        onSuccess: async () => {
            await loadAuth();
            await queryClient.invalidateQueries();
        },
    });

    const addFriendsModalRef = useRef<BottomSheetModal>(null);
    const friendsListModalRef = useRef<BottomSheetModal>(null);
    const friendRequestsModalRef = useRef<BottomSheetModal>(null);

    useFocusEffect(
        useCallback(() => {
            refetch();
        }, [refetch])
    );

    return (
        <View
            style={{
                flex: 1,
                justifyContent: "space-between",
                alignItems: "center",
                padding: 20,
            }}
        >
            <View
                style={{
                    flex: 1,
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    marginTop: 200,
                    gap: 20,
                }}
            >
                <Image
                    style={{
                        width: 150,
                        height: 150,
                        borderRadius: 100,
                    }}
                    src={user?.image_url?.replace("=s96-c", "")}
                    resizeMode="cover"
                />
                <View
                    style={{
                        flexDirection: "column",
                        gap: 10,
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <TouchableOpacity
                        onPress={() => {
                            Alert.prompt(
                                "Edit Name",
                                "Enter your new name",
                                [
                                    {
                                        text: "Cancel",
                                        onPress: () => {},
                                        style: "cancel",
                                    },
                                    {
                                        text: "OK",
                                        onPress: async (newName) => {
                                            if (!newName) return;
                                            updateUser(newName);
                                        },
                                    },
                                ],
                                "plain-text",
                                user?.name
                            );
                        }}
                    >
                        <Text
                            style={{
                                fontSize: 32,
                                fontWeight: "bold",
                            }}
                        >
                            {user?.name}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => friendsListModalRef.current?.present()}
                    >
                        <Text
                            style={{
                                fontSize: 20,
                            }}
                        >
                            {user?.total_friends} friends
                        </Text>
                    </TouchableOpacity>
                </View>
                <View
                    style={{
                        marginTop: 30,
                        justifyContent: "center",
                        alignItems: "center",
                        gap: 30,
                    }}
                >
                    <TouchableOpacity
                        style={{
                            flexDirection: "row",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: 8,
                            backgroundColor: Colors.card_bg,
                            padding: 8,
                            paddingHorizontal: 18,
                            borderRadius: 8,
                            ...globalStyles.shadow,
                        }}
                        onPress={() => addFriendsModalRef.current?.present()}
                    >
                        <Ionicons
                            name="person-add"
                            size={18}
                            color={Colors.accent}
                        />
                        <Text style={globalStyles.btnSecondaryText}>
                            Add Friends
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={{
                            position: "relative",
                            flexDirection: "row",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: 8,
                            backgroundColor: Colors.card_bg,
                            padding: 8,
                            paddingHorizontal: 18,
                            borderRadius: 8,
                            ...globalStyles.shadow,
                        }}
                        onPress={() =>
                            friendRequestsModalRef.current?.present()
                        }
                    >
                        <Ionicons
                            name="people"
                            size={18}
                            color={Colors.accent}
                        />
                        <Text style={globalStyles.btnSecondaryText}>
                            Friend Requests
                        </Text>
                        {friendRequests && friendRequests.length > 0 && (
                            <View
                                style={{
                                    position: "absolute",
                                    top: -8,
                                    left: -8,
                                    borderRadius: 100,
                                    backgroundColor: Colors.error,
                                    width: 23,
                                    height: 23,
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                            >
                                <Text
                                    style={{
                                        color: "white",
                                        fontWeight: "bold",
                                        fontSize: 12,
                                    }}
                                >
                                    {friendRequests.length}
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
            <TouchableOpacity style={globalStyles.btnPrimary} onPress={signOut}>
                <Text style={globalStyles.btnPrimaryText}>Sign Out</Text>
            </TouchableOpacity>
            <AddFriendsModal ref={addFriendsModalRef} />
            <FriendsListModal ref={friendsListModalRef} />
            <FriendRequestsModal
                ref={friendRequestsModalRef}
                requests={friendRequests}
            />
        </View>
    );
}

export default Page;

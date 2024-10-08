import { Ionicons } from "@expo/vector-icons";
import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import dayjs from "dayjs";
import { forwardRef, useMemo } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Text,
    View,
} from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useAuth } from "~/hooks/useAuth";
import { Colors } from "~/lib/theme";
import { FriendRequest } from "~/lib/types";

const FriendRequestsModal = forwardRef<
    BottomSheetModal,
    { requests: FriendRequest[] | undefined }
>((props, ref) => {
    const queryClient = useQueryClient();

    const { user, accessToken } = useAuth();

    const snapPoints = useMemo(() => ["35%", "92%"], []);

    const {
        mutate: acceptFriendRequest,
        isPending: acceptingFriendRequest,
        variables: acceptFriendRequestVariables,
    } = useMutation({
        mutationKey: ["acceptFriendRequest"],
        mutationFn: async (friendRequestId: string) => {
            const res = await axios.patch(
                process.env.EXPO_PUBLIC_API_ENDPOINT +
                    `/v1/friends/${friendRequestId}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            return res.data;
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries();
        },
    });

    const {
        mutate: deleteFriend,
        isPending: deletingFriend,
        variables: deleteFriendVariables,
    } = useMutation({
        mutationKey: ["deleteFriend"],
        mutationFn: async (friendshipId: string) => {
            const res = await axios.delete(
                process.env.EXPO_PUBLIC_API_ENDPOINT +
                    `/v1/friends/${friendshipId}`,
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

    const createDeleteAlert = (friendshipId: string) =>
        Alert.alert(
            "Delete Friend Request",
            "Are you sure you want to delete this friend request?",
            [
                {
                    text: "Cancel",
                    onPress: () => console.log("Cancel Pressed"),
                    style: "cancel",
                    isPreferred: true,
                },
                {
                    text: "Delete",
                    onPress: () => deleteFriend(friendshipId),
                    style: "destructive",
                },
            ]
        );

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
            containerStyle={{
                width: "100%",
                justifyContent: "flex-start",
                alignItems: "center",
            }}
        >
            <View
                style={{
                    width: "100%",
                    flexDirection: "row",
                    justifyContent: "flex-start",
                    alignItems: "center",
                    paddingHorizontal: 21,
                    marginVertical: 10,
                }}
            >
                <Text
                    style={{
                        fontSize: 22,
                        fontWeight: "600",
                    }}
                >
                    Friends Requests
                </Text>
            </View>
            {!props.requests || props.requests?.length === 0 ? (
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
                        No friend requests
                    </Text>
                    <Text
                        style={{
                            fontSize: 12,
                            opacity: 0.5,
                        }}
                    >
                        You have no pending friend requests
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={props.requests.filter(
                        (r) => r.requested_by !== user?.id
                    )}
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
                                marginVertical: 10,
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
                    renderItem={({ item: userReq }) => (
                        <View
                            style={{
                                width: "100%",
                                flexDirection: "row",
                                justifyContent: "flex-start",
                                alignItems: "center",
                                paddingHorizontal: 21,
                                gap: 10,
                            }}
                        >
                            {userReq.image_url ? (
                                <Image
                                    style={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: 10,
                                    }}
                                    src={userReq.image_url}
                                />
                            ) : (
                                <Ionicons
                                    name="person-circle"
                                    size={32}
                                    color={Colors.primary}
                                />
                            )}
                            <View
                                style={{
                                    flex: 1,
                                    justifyContent: "center",
                                    alignItems: "flex-start",
                                    gap: 2,
                                }}
                            >
                                <Text
                                    style={{
                                        fontSize: 15,
                                        fontWeight: "600",
                                    }}
                                >
                                    {userReq.name}
                                </Text>
                                {userReq.requested_on && (
                                    <Text
                                        style={{
                                            fontSize: 12,
                                            opacity: 0.5,
                                        }}
                                    >
                                        requested on{" "}
                                        {dayjs(userReq.requested_on).format(
                                            "MMMM D, YYYY"
                                        )}
                                    </Text>
                                )}
                            </View>
                            <TouchableOpacity
                                style={{
                                    backgroundColor: Colors.card_bg,
                                    borderRadius: 8,
                                    padding: 2,
                                    paddingHorizontal: 2,
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                                onPress={() =>
                                    createDeleteAlert(userReq.friendship_id)
                                }
                            >
                                {deletingFriend &&
                                deleteFriendVariables ===
                                    userReq.friendship_id ? (
                                    <ActivityIndicator />
                                ) : (
                                    <Ionicons
                                        name="close"
                                        size={24}
                                        color={Colors.error}
                                    />
                                )}
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{
                                    backgroundColor: Colors.primary,
                                    borderRadius: 8,
                                    padding: 5,
                                    paddingHorizontal: 10,
                                    width: 70,
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                                onPress={() =>
                                    acceptFriendRequest(userReq.friendship_id)
                                }
                            >
                                {acceptingFriendRequest &&
                                acceptFriendRequestVariables ===
                                    userReq.friendship_id ? (
                                    <ActivityIndicator />
                                ) : (
                                    <Text
                                        style={{
                                            color: "white",
                                            fontSize: 14,
                                            fontWeight: "600",
                                        }}
                                    >
                                        Accept
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    )}
                />
            )}
        </BottomSheetModal>
    );
});

export default FriendRequestsModal;

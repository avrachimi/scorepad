import { Ionicons } from "@expo/vector-icons";
import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet";
import { DefaultTheme } from "@react-navigation/native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { Friend } from "~/lib/types";

const FriendsListModal = forwardRef<BottomSheetModal, {}>((props, ref) => {
    const queryClient = useQueryClient();
    const { accessToken, loadAuth } = useAuth();
    const snapPoints = useMemo(() => ["35%", "92%"], []);

    const { data: friends } = useQuery({
        queryKey: ["getFriends"],
        queryFn: async () => {
            const res = await axios.get<Friend[]>(
                process.env.EXPO_PUBLIC_API_ENDPOINT + "/v1/friends",
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
            await loadAuth();
        },
    });

    const createDeleteAlert = (friendshipId: string) =>
        Alert.alert(
            "Remove Friend",
            "Are you sure you want to remove this friend?",
            [
                {
                    text: "Cancel",
                    onPress: () => console.log("Cancel Pressed"),
                    style: "cancel",
                    isPreferred: true,
                },
                {
                    text: "Remove",
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
                    My Friends
                </Text>
            </View>
            <FlatList
                data={friends}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{
                    width: "100%",
                    justifyContent: "flex-start",
                    alignItems: "center",
                    gap: 10,
                    marginTop: 10,
                }}
                renderItem={({ item }) => (
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
                        {item.image_url ? (
                            <Image
                                style={{
                                    width: 50,
                                    height: 50,
                                    borderRadius: 10,
                                }}
                                src={item.image_url}
                            />
                        ) : (
                            <Ionicons
                                name="person-circle"
                                size={50}
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
                                    fontSize: 17,
                                    fontWeight: "600",
                                }}
                            >
                                {item.name}
                            </Text>
                            {item.friends_since && (
                                <Text
                                    style={{
                                        fontSize: 12,
                                        opacity: 0.5,
                                    }}
                                >
                                    friends since{" "}
                                    {dayjs(item.friends_since).format(
                                        "MMMM DD, YYYY"
                                    )}
                                </Text>
                            )}
                        </View>
                        <TouchableOpacity
                            style={{
                                backgroundColor: Colors.card_bg,
                                paddingHorizontal: 10,
                                paddingVertical: 6,
                                borderRadius: 6,
                                width: 80,
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                            onPress={() =>
                                createDeleteAlert(item.friendship_id)
                            }
                        >
                            {deletingFriend &&
                            deleteFriendVariables === item.friendship_id ? (
                                <ActivityIndicator />
                            ) : (
                                <Text
                                    style={{
                                        color: DefaultTheme.colors.notification,
                                        fontWeight: "600",
                                        fontSize: 14,
                                    }}
                                >
                                    Remove
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                )}
            />
        </BottomSheetModal>
    );
});

export default FriendsListModal;

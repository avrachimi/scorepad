import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useRef } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import AddFriendsModal from "~/components/modals/AddFriendsModal";
import FriendRequestsModal from "~/components/modals/FriendRequestsModal";
import FriendsListModal from "~/components/modals/FriendsListModal";
import { useAuth } from "~/hooks/useAuth";
import { Colors, globalStyles } from "~/lib/theme";
import { FriendRequest } from "~/lib/types";

function Page() {
    const { signOut, user, accessToken } = useAuth();

    const { data: friendRequests } = useQuery({
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

            return res.data;
        },
    });

    const addFriendsModalRef = useRef<BottomSheetModal>(null);
    const friendsListModalRef = useRef<BottomSheetModal>(null);
    const friendRequestsModalRef = useRef<BottomSheetModal>(null);

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
                    src={user?.image_url}
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
                    <Text
                        style={{
                            fontSize: 32,
                            fontWeight: "bold",
                        }}
                    >
                        {user?.name}
                    </Text>
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
                        gap: 20,
                    }}
                >
                    <TouchableOpacity
                        style={globalStyles.btnSecondary}
                        onPress={() => addFriendsModalRef.current?.present()}
                    >
                        <Text style={globalStyles.btnSecondaryText}>
                            Add Friends
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() =>
                            friendRequestsModalRef.current?.present()
                        }
                    >
                        <Text
                            style={{
                                textDecorationLine: "underline",
                                color: Colors.secondary,
                                fontSize: 17,
                                fontWeight: "600",
                            }}
                        >
                            {friendRequests?.length ?? 0} friend requests
                        </Text>
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

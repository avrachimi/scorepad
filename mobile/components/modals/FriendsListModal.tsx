import { Ionicons } from "@expo/vector-icons";
import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import dayjs from "dayjs";
import { forwardRef, useMemo } from "react";
import { FlatList, Image, Text, View } from "react-native";
import { useAuth } from "~/hooks/useAuth";
import { Colors } from "~/lib/theme";
import { Friend } from "~/lib/types";

const FriendsListModal = forwardRef<BottomSheetModal, {}>((props, ref) => {
    const { accessToken } = useAuth();
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
                            justifyContent: "flex-start",
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
                    </View>
                )}
            />
        </BottomSheetModal>
    );
});

export default FriendsListModal;

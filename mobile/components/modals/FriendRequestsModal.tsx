import { Ionicons } from "@expo/vector-icons";
import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet";
import dayjs from "dayjs";
import { forwardRef, useMemo } from "react";
import { FlatList, Image, Text, View } from "react-native";
import { Colors } from "~/lib/theme";
import { FriendRequest } from "~/lib/types";

const FriendRequestsModal = forwardRef<
    BottomSheetModal,
    { requests: FriendRequest[] | undefined }
>((props, ref) => {
    const snapPoints = useMemo(() => ["35%", "92%"], []);

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
                    data={props.requests}
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
                                {item.requested_on && (
                                    <Text
                                        style={{
                                            fontSize: 12,
                                            opacity: 0.5,
                                        }}
                                    >
                                        friends since{" "}
                                        {dayjs(item.requested_on).format(
                                            "MMMM DD, YYYY"
                                        )}
                                    </Text>
                                )}
                            </View>
                        </View>
                    )}
                />
            )}
        </BottomSheetModal>
    );
});

export default FriendRequestsModal;

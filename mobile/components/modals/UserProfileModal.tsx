import { Ionicons } from "@expo/vector-icons";
import {
    BottomSheetBackdrop,
    BottomSheetBackdropProps,
    BottomSheetModal,
} from "@gorhom/bottom-sheet";
import { DefaultTheme } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { forwardRef, useMemo } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { useAuth } from "~/hooks/useAuth";
import { Colors } from "~/lib/theme";
import { UserProfile } from "~/lib/types";

interface UserProfileModalProps {
    userId?: string;
}

const UserProfileModal = forwardRef<BottomSheetModal, UserProfileModalProps>(
    (props, ref) => {
        const { userId } = props;
        if (!userId) return null;

        const { accessToken } = useAuth();

        const snapPoints = useMemo(() => ["15%"], []);

        const { data: userProfile } = useQuery({
            queryKey: ["getUserProfile", userId],
            queryFn: async () => {
                const res = await axios.get<UserProfile>(
                    process.env.EXPO_PUBLIC_API_ENDPOINT +
                        `/v1/users/profile/${userId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                        },
                    }
                );

                return res.data;
            },
        });

        const renderBackdrop = (props: BottomSheetBackdropProps) => {
            return (
                <BottomSheetBackdrop
                    appearsOnIndex={0}
                    disappearsOnIndex={-1}
                    {...props}
                />
            );
        };

        if (!userProfile) return null;

        return (
            <BottomSheetModal
                ref={ref}
                snapPoints={snapPoints}
                backdropComponent={renderBackdrop}
            >
                <View style={styles.container}>
                    <View
                        style={{
                            flexDirection: "row",
                            justifyContent: "center",
                            alignItems: "flex-start",
                            paddingHorizontal: 21,
                            gap: 10,
                            width: "100%",
                        }}
                    >
                        {userProfile.image_url ? (
                            <Image
                                style={{
                                    width: 60,
                                    height: 60,
                                    borderRadius: 100,
                                    borderWidth: 1,
                                    borderColor: Colors.primary,
                                }}
                                src={userProfile.image_url}
                            />
                        ) : (
                            <Ionicons
                                name="person-circle"
                                size={60}
                                color={Colors.primary}
                            />
                        )}

                        <View
                            style={{
                                justifyContent: "space-around",
                                alignItems: "flex-start",
                                gap: 5,
                                width: "55%",
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: 22,
                                    fontWeight: "bold",
                                }}
                            >
                                {userProfile.name}
                            </Text>
                            <Text
                                style={{
                                    fontSize: 13,
                                    opacity: 0.5,
                                    paddingHorizontal: 5,
                                }}
                            >
                                {userProfile.total_friends} friend(s)
                            </Text>
                        </View>
                        <View
                            style={{
                                flex: 1,
                                justifyContent: "space-around",
                                alignItems: "flex-end",
                            }}
                        >
                            <View
                                style={{
                                    justifyContent: "space-around",
                                    alignItems: "center",
                                    gap: 2,
                                    backgroundColor:
                                        DefaultTheme.colors.background,
                                    padding: 10,
                                    borderRadius: 10,
                                }}
                            >
                                <Text
                                    style={{
                                        color: Colors.primary,
                                        fontSize: 20,
                                        opacity: 0.8,
                                        fontWeight: "bold",
                                    }}
                                >
                                    {userProfile.total_matches}
                                </Text>
                                <Text
                                    style={{
                                        color: Colors.accent,
                                        fontSize: 12,
                                        opacity: 0.8,
                                        paddingHorizontal: 5,
                                        fontWeight: "600",
                                    }}
                                >
                                    matches
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </BottomSheetModal>
        );
    }
);

export default UserProfileModal;

const styles = StyleSheet.create({
    container: {
        justifyContent: "flex-start",
        alignItems: "center",
        width: "100%",
        paddingVertical: 10,
        gap: 20,
    },
});

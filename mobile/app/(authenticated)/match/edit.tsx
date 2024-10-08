import { Ionicons } from "@expo/vector-icons";
import { DefaultTheme } from "@react-navigation/native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import dayjs from "dayjs";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
    Button,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import DatePicker from "react-native-date-picker";
import SelectPlayerPage from "~/components/SelectPlayer";
import { useAuth } from "~/hooks/useAuth";
import { useDatabase } from "~/hooks/useDatabase";
import { Colors } from "~/lib/theme";
import { UpdateMatchParams } from "~/lib/types";

type SelectedPlayer = {
    id: string;
    name: string;
    image_url?: string;
};

function Page() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { id } = useLocalSearchParams<{
        id?: string;
    }>();

    const { singleMatchQuery } = useDatabase();

    const existingMatch = singleMatchQuery(id!).data;

    const [team1Score, setTeam1Score] = useState(
        existingMatch?.team1_score || 0
    );
    const [team1Player1, setTeam1Player1] = useState<
        SelectedPlayer | undefined
    >(existingMatch?.team1_player1);
    const [team1Player2, setTeam1Player2] = useState<
        SelectedPlayer | undefined
    >(existingMatch?.team1_player2);
    const [team2Player1, setTeam2Player1] = useState<
        SelectedPlayer | undefined
    >(existingMatch?.team2_player1);
    const [team2Player2, setTeam2Player2] = useState<
        SelectedPlayer | undefined
    >(existingMatch?.team2_player2);

    const [team2Score, setTeam2Score] = useState(
        existingMatch?.team2_score || 0
    );
    const [duration, setDuration] = useState<number>(
        existingMatch?.duration_minutes || 30
    );
    const [openDatePicker, setOpenDatePicker] = useState(false);
    const [openTimePicker, setOpenTimePicker] = useState(false);
    const [date, setDate] = useState(
        existingMatch?.match_date
            ? dayjs(existingMatch.match_date).toDate()
            : dayjs().set("minute", 0).toDate()
    );

    const [selectedPlayer, setSelectedPlayer] = useState<{
        id?: string;
        name?: string;
        num: number;
    }>({
        num: 2,
    });

    const durationOptions = {
        "30 mins": 30,
        "1 hour": 60,
        "1.5 hours": 90,
        "2 hours": 120,
        "2.5 hours": 150,
        "3 hours": 180,
    };

    const [showPlayerSelector, setShowPlayerSelector] = useState(false);
    const handleToggleView = (playerSelection?: {
        playerNum: number;
        player?: SelectedPlayer;
    }) => {
        setShowPlayerSelector((p) => !p);

        if (playerSelection) {
            switch (playerSelection.playerNum) {
                case 1:
                    setTeam1Player1(playerSelection.player);
                    break;
                case 2:
                    setTeam1Player2(playerSelection.player);
                    break;
                case 3:
                    setTeam2Player1(playerSelection.player);
                    break;
                case 4:
                    setTeam2Player2(playerSelection.player);
                    break;
                default:
                    break;
            }
        }
    };

    const { user, accessToken } = useAuth();

    const { mutate: updateMatch } = useMutation({
        mutationKey: ["updateMatch", id],
        mutationFn: async (match: UpdateMatchParams) => {
            const res = await axios.put(
                process.env.EXPO_PUBLIC_API_ENDPOINT + `/v1/matches/${id}`,
                match,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );
            console.log(res.data);
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ["singleMatch", id],
            });
            await queryClient.invalidateQueries({
                queryKey: ["recentMatches"],
            });
            await queryClient.invalidateQueries({
                queryKey: ["allMatches"],
            });
        },
    });

    const { mutate: deleteMatch } = useMutation({
        mutationKey: ["deleteMatch", id],
        mutationFn: async () => {
            const res = await axios.delete(
                process.env.EXPO_PUBLIC_API_ENDPOINT + `/v1/matches/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );
            console.log(res.data);
        },
        onSuccess: async () => {
            router.dismissAll();
            // router.replace("/(authenticated)/(tabs)/home");
            await queryClient.invalidateQueries();
        },
    });

    const clearState = () => {
        setTeam1Score(0);
        if (!user) setTeam1Player1(undefined);
        setTeam1Player2(undefined);
        setTeam2Score(0);
        setTeam2Player1(undefined);
        setTeam2Player2(undefined);

        setDuration(30);
        setDate(dayjs().set("minute", 0).toDate());
    };

    const onSave = async () => {
        if (user && team1Player1) {
            if (team1Score > 0 || team2Score > 0) {
                updateMatch({
                    match_date: date,
                    duration_minutes: duration,
                    team1_score: team1Score,
                    team1_player1: team1Player1!.id,
                    team1_player2: team1Player2?.id,
                    team2_score: team2Score,
                    team2_player1: team2Player1?.id,
                    team2_player2: team2Player2?.id,
                });
                router.back();
                clearState();
            } else {
                alert("Please enter a score");
            }
        }
    };

    return (
        <View>
            <StatusBar style="dark" />
            <Stack.Screen
                options={{
                    headerShown: !showPlayerSelector,
                    contentStyle: {
                        marginTop: showPlayerSelector ? 50 : 0,
                    },
                    headerShadowVisible: false,
                    headerStyle: {
                        backgroundColor: DefaultTheme.colors.background,
                    },
                    headerBackTitle: "Cancel",
                    headerTitle: "Edit Match",
                    headerRight: () => (
                        <Text
                            style={{
                                color: DefaultTheme.colors.primary,
                                fontSize: 18,
                                fontWeight: "500",
                                marginRight: 20,
                            }}
                            onPress={onSave}
                        >
                            Save
                        </Text>
                    ),
                }}
            />
            {showPlayerSelector ? (
                <SelectPlayerPage
                    handleToggleView={handleToggleView}
                    selectedPlayer={selectedPlayer}
                    selectedUserIds={[
                        team1Player2?.id,
                        team2Player1?.id,
                        team2Player2?.id,
                    ].filter(
                        (item): item is NonNullable<typeof item> => item != null
                    )}
                />
            ) : (
                <>
                    <View style={styles.teamSection}>
                        <Text style={styles.sectionTitle}>Team 1</Text>
                        <View style={{ flexDirection: "column", gap: 12 }}>
                            <View>
                                <View style={styles.scoreContainer}>
                                    <Text style={styles.scoreLabel}>Score</Text>
                                    <TextInput
                                        style={styles.scoreInput}
                                        keyboardType="numeric"
                                        returnKeyType="done"
                                        value={team1Score.toString()}
                                        onChangeText={(text) =>
                                            setTeam1Score(Number(text))
                                        }
                                    />
                                </View>
                                <BottomLine />
                            </View>
                            <View>
                                {team1Player1 ? (
                                    <TouchableOpacity
                                        disabled={true}
                                        style={styles.playerSelector}
                                    >
                                        <View
                                            style={{
                                                flexDirection: "row",
                                                alignItems: "center",
                                                gap: 10,
                                            }}
                                        >
                                            {team1Player1.image_url ? (
                                                <Image
                                                    src={team1Player1.image_url}
                                                    style={{
                                                        width: 24,
                                                        height: 24,
                                                        borderRadius: 12,
                                                        borderWidth: 1,
                                                        borderColor:
                                                            Colors.primary,
                                                    }}
                                                />
                                            ) : (
                                                <Ionicons
                                                    name="person-circle"
                                                    size={24}
                                                    color={Colors.primary}
                                                />
                                            )}
                                            <Text
                                                style={
                                                    styles.playerSelectorText
                                                }
                                            >
                                                {team1Player1.name}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                ) : (
                                    <TouchableOpacity
                                        style={styles.playerSelector}
                                    >
                                        <Text
                                            style={
                                                styles.playerSelectorTextEmpty
                                            }
                                        >
                                            Select player
                                        </Text>
                                        <Ionicons
                                            name="chevron-forward"
                                            size={20}
                                            color={DefaultTheme.colors.primary}
                                        />
                                    </TouchableOpacity>
                                )}
                                <BottomLine />
                            </View>
                            <View>
                                {team1Player2 ? (
                                    <TouchableOpacity
                                        style={styles.playerSelector}
                                        onPress={() => {
                                            setSelectedPlayer({
                                                num: 2,
                                                id: team1Player2.id,
                                                name: team1Player2.name,
                                            });
                                            handleToggleView();
                                        }}
                                    >
                                        <View
                                            style={{
                                                flexDirection: "row",
                                                alignItems: "center",
                                                gap: 10,
                                            }}
                                        >
                                            {team1Player2.image_url ? (
                                                <Image
                                                    src={team1Player2.image_url}
                                                    style={{
                                                        width: 24,
                                                        height: 24,
                                                        borderRadius: 12,
                                                        borderWidth: 1,
                                                        borderColor:
                                                            Colors.primary,
                                                    }}
                                                />
                                            ) : (
                                                <Ionicons
                                                    name="person-circle"
                                                    size={24}
                                                    color={Colors.primary}
                                                />
                                            )}
                                            <Text
                                                style={
                                                    styles.playerSelectorText
                                                }
                                            >
                                                {team1Player2.name}
                                            </Text>
                                        </View>
                                        <Ionicons
                                            name="chevron-forward"
                                            size={20}
                                            color={DefaultTheme.colors.primary}
                                        />
                                    </TouchableOpacity>
                                ) : (
                                    <TouchableOpacity
                                        style={styles.playerSelector}
                                        onPress={() => {
                                            setSelectedPlayer({
                                                num: 2,
                                            });
                                            handleToggleView();
                                        }}
                                    >
                                        <Text
                                            style={
                                                styles.playerSelectorTextEmpty
                                            }
                                        >
                                            Select player
                                        </Text>
                                        <Ionicons
                                            name="chevron-forward"
                                            size={20}
                                            color={DefaultTheme.colors.primary}
                                        />
                                    </TouchableOpacity>
                                )}
                                <BottomLine />
                            </View>
                        </View>
                    </View>

                    <View style={styles.teamSection}>
                        <Text style={styles.sectionTitle}>Team 2</Text>
                        <View style={{ flexDirection: "column", gap: 12 }}>
                            <View>
                                <View style={styles.scoreContainer}>
                                    <Text style={styles.scoreLabel}>Score</Text>
                                    <TextInput
                                        style={styles.scoreInput}
                                        keyboardType="numeric"
                                        returnKeyType="done"
                                        value={team2Score.toString()}
                                        onChangeText={(text) =>
                                            setTeam2Score(Number(text))
                                        }
                                    />
                                </View>
                                <BottomLine />
                            </View>
                            <View>
                                {team2Player1 ? (
                                    <TouchableOpacity
                                        style={styles.playerSelector}
                                        onPress={() => {
                                            setSelectedPlayer({
                                                num: 3,
                                                id: team2Player1.id,
                                                name: team2Player1.name,
                                            });
                                            handleToggleView();
                                        }}
                                    >
                                        <View
                                            style={{
                                                flexDirection: "row",
                                                alignItems: "center",
                                                gap: 10,
                                            }}
                                        >
                                            {team2Player1.image_url ? (
                                                <Image
                                                    src={team2Player1.image_url}
                                                    style={{
                                                        width: 24,
                                                        height: 24,
                                                        borderRadius: 12,
                                                        borderWidth: 1,
                                                        borderColor:
                                                            Colors.primary,
                                                    }}
                                                />
                                            ) : (
                                                <Ionicons
                                                    name="person-circle"
                                                    size={24}
                                                    color={Colors.primary}
                                                />
                                            )}
                                            <Text
                                                style={
                                                    styles.playerSelectorText
                                                }
                                            >
                                                {team2Player1.name}
                                            </Text>
                                        </View>
                                        <Ionicons
                                            name="chevron-forward"
                                            size={20}
                                            color={DefaultTheme.colors.primary}
                                        />
                                    </TouchableOpacity>
                                ) : (
                                    <TouchableOpacity
                                        style={styles.playerSelector}
                                        onPress={() => {
                                            setSelectedPlayer({
                                                num: 3,
                                            });
                                            handleToggleView();
                                        }}
                                    >
                                        <Text
                                            style={
                                                styles.playerSelectorTextEmpty
                                            }
                                        >
                                            Select player
                                        </Text>
                                        <Ionicons
                                            name="chevron-forward"
                                            size={20}
                                            color={DefaultTheme.colors.primary}
                                        />
                                    </TouchableOpacity>
                                )}
                                <BottomLine />
                            </View>
                            <View>
                                {team2Player2 ? (
                                    <TouchableOpacity
                                        style={styles.playerSelector}
                                        onPress={() => {
                                            setSelectedPlayer({
                                                num: 4,
                                                id: team2Player2.id,
                                                name: team2Player2.name,
                                            });
                                            handleToggleView();
                                        }}
                                    >
                                        <View
                                            style={{
                                                flexDirection: "row",
                                                alignItems: "center",
                                                gap: 10,
                                            }}
                                        >
                                            {team2Player2.image_url ? (
                                                <Image
                                                    src={team2Player2.image_url}
                                                    style={{
                                                        width: 24,
                                                        height: 24,
                                                        borderRadius: 12,
                                                        borderWidth: 1,
                                                        borderColor:
                                                            Colors.primary,
                                                    }}
                                                />
                                            ) : (
                                                <Ionicons
                                                    name="person-circle"
                                                    size={24}
                                                    color={Colors.primary}
                                                />
                                            )}
                                            <Text
                                                style={
                                                    styles.playerSelectorText
                                                }
                                            >
                                                {team2Player2.name}
                                            </Text>
                                        </View>
                                        <Ionicons
                                            name="chevron-forward"
                                            size={20}
                                            color={DefaultTheme.colors.primary}
                                        />
                                    </TouchableOpacity>
                                ) : (
                                    <TouchableOpacity
                                        style={styles.playerSelector}
                                        onPress={() => {
                                            setSelectedPlayer({
                                                num: 4,
                                            });
                                            handleToggleView();
                                        }}
                                    >
                                        <Text
                                            style={
                                                styles.playerSelectorTextEmpty
                                            }
                                        >
                                            Select player
                                        </Text>
                                        <Ionicons
                                            name="chevron-forward"
                                            size={20}
                                            color={DefaultTheme.colors.primary}
                                        />
                                    </TouchableOpacity>
                                )}
                                <BottomLine />
                            </View>
                        </View>
                    </View>

                    <View style={styles.otherSection}>
                        <Text style={styles.sectionTitle}>Other</Text>

                        {/* Date & Time Section */}
                        <View style={styles.dateTimeRow}>
                            <Text>Date & Time</Text>
                            <View style={{ flexDirection: "row", gap: 10 }}>
                                <TouchableOpacity
                                    onPress={() => setOpenDatePicker(true)}
                                    style={styles.pickerButton}
                                >
                                    <Text style={styles.dateText}>
                                        {dayjs(date).format("MMM DD, YYYY")}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => setOpenTimePicker(true)}
                                    style={styles.pickerButton}
                                >
                                    <Text style={styles.dateText}>
                                        {date.toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <DatePicker
                            modal
                            mode="date"
                            open={openDatePicker}
                            date={date}
                            maximumDate={new Date()}
                            onConfirm={(selectedDate) => {
                                setOpenDatePicker(false);
                                const hour = dayjs(date).hour();
                                setDate(
                                    dayjs(selectedDate)
                                        .set("hour", hour)
                                        .toDate()
                                );
                            }}
                            onCancel={() => {
                                setOpenDatePicker(false);
                            }}
                        />

                        <DatePicker
                            modal
                            mode="time"
                            maximumDate={new Date()}
                            minuteInterval={15}
                            open={openTimePicker}
                            date={date}
                            onConfirm={(selectedTime) => {
                                setOpenTimePicker(false);
                                setDate(selectedTime);
                            }}
                            onCancel={() => {
                                setOpenTimePicker(false);
                            }}
                        />

                        {/* Duration Buttons */}
                        <View style={styles.durationContainer}>
                            <Text
                                style={{
                                    alignSelf: "center",
                                }}
                            >
                                Duration
                            </Text>
                            <View style={styles.durationTagContainer}>
                                {Object.entries(durationOptions).map(
                                    ([str, mins]) => (
                                        <TouchableOpacity
                                            key={str}
                                            style={[
                                                styles.durationButton,
                                                duration === mins &&
                                                    styles.selectedDurationButton,
                                            ]}
                                            onPress={() => setDuration(mins)}
                                        >
                                            <Text style={styles.durationText}>
                                                {str}
                                            </Text>
                                        </TouchableOpacity>
                                    )
                                )}
                            </View>
                        </View>
                    </View>
                    <View
                        style={{
                            marginTop: 40,
                        }}
                    >
                        <Button
                            title="Delete"
                            color="red"
                            onPress={() => deleteMatch()}
                        />
                    </View>
                </>
            )}
        </View>
    );
}

export default Page;

const BottomLine = () => {
    return (
        <View
            style={{
                width: "100%",
                borderBottomWidth: 1,
                borderBottomColor: "lightgray",
                opacity: 0.5,
            }}
        />
    );
};

const styles = StyleSheet.create({
    teamSection: {
        flexDirection: "column",
        width: "100%",
        gap: 20,
        paddingHorizontal: 21,
        marginVertical: 20,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: "bold",
    },
    scoreContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 10,
        paddingVertical: 5,
    },
    scoreLabel: {
        fontSize: 17,
    },
    scoreInput: {
        padding: 8,
        width: "100%",
    },
    playerSelector: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 10,
        borderRadius: 5,
    },
    playerSelectorText: {
        fontSize: 17,
        fontWeight: "500",
    },
    playerSelectorTextEmpty: {
        fontSize: 17,
        fontWeight: "500",
        color: "#3C3C43",
        opacity: 0.6,
    },
    otherSection: {
        flexDirection: "column",
        width: "100%",
        gap: 20,
        paddingHorizontal: 21,
        marginVertical: 20,
    },
    dateTimeRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 15,
    },
    dateText: {
        borderRadius: 6,
        color: DefaultTheme.colors.primary,
        fontSize: 16,
    },
    pickerButton: {
        paddingHorizontal: 11,
        paddingVertical: 6,
        borderRadius: 6,
        backgroundColor: "#7878801F",
    },
    durationContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 50,
    },
    durationTagContainer: {
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "center",
        flexWrap: "wrap",
        width: "60%",
        gap: 10,
    },
    durationButton: {
        backgroundColor: Colors.secondary,
        color: "white",
        paddingHorizontal: 6,
        paddingVertical: 4,
        borderRadius: 6,
    },
    selectedDurationButton: {
        backgroundColor: Colors.primary,
    },
    durationText: {
        color: "white",
        fontSize: 15,
        fontWeight: "500",
    },
});

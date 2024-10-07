import { Ionicons } from "@expo/vector-icons";
import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet";
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import { useHeaderHeight } from "@react-navigation/elements";
import { DefaultTheme } from "@react-navigation/native";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Image, StyleSheet, Text, TextInput, View } from "react-native";
import DatePicker from "react-native-date-picker";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useAuth } from "~/hooks/useAuth";
import { useDatabase } from "~/hooks/useDatabase";
import { Colors } from "~/lib/theme";
import SelectPlayerPage from "../SelectPlayer";

type SelectedPlayer = {
    id: string;
    name: string;
    image_url?: string;
};

interface NewMatchModalProps {
    bottomSheetRef: React.RefObject<BottomSheetModalMethods>;
}

function NewMatchModal({ bottomSheetRef }: NewMatchModalProps) {
    const [team1Score, setTeam1Score] = useState(0);
    const [team1Player1, setTeam1Player1] = useState<SelectedPlayer>();
    const [team1Player2, setTeam1Player2] = useState<SelectedPlayer>();
    const [team2Player1, setTeam2Player1] = useState<SelectedPlayer>();
    const [team2Player2, setTeam2Player2] = useState<SelectedPlayer>();

    const [selectedPlayer, setSelectedPlayer] = useState<{
        id?: string;
        name?: string;
        num: number;
    }>({
        num: 2,
    });

    const [team2Score, setTeam2Score] = useState(0);
    const [duration, setDuration] = useState<number>(30);
    const [openDatePicker, setOpenDatePicker] = useState(false);
    const [openTimePicker, setOpenTimePicker] = useState(false);
    const [date, setDate] = useState(dayjs().set("minute", 0).toDate());

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

    const durationOptions = {
        "30 mins": 30,
        "1 hour": 60,
        "1.5 hours": 90,
        "2 hours": 120,
        "2.5 hours": 150,
        "3 hours": 180,
    };

    const headerHeight = useHeaderHeight();
    const snapPoints = useMemo(() => ["92%"], []);

    const { user } = useAuth();
    const { createMatchQuery } = useDatabase();

    const renderBackdrop = useCallback(
        (props: any) => (
            <BottomSheetBackdrop
                style={{
                    backgroundColor: Colors.primary,
                }}
                appearsOnIndex={0}
                diasappearsOnIndex={-1}
                {...props}
            />
        ),
        []
    );

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

    const onSave = () => {
        if (user && team1Player1) {
            if (team1Score > 0 || team2Score > 0) {
                createMatchQuery.mutate({
                    match_date: date,
                    duration_minutes: duration,
                    created_by: user.id,
                    team1_score: team1Score,
                    team1_player1: team1Player1.id,
                    team1_player2: team1Player2?.id,
                    team2_score: team2Score,
                    team2_player1: team2Player1?.id,
                    team2_player2: team2Player2?.id,
                });
                bottomSheetRef.current?.close();
                clearState();
            } else {
                alert("Please enter a score");
            }
        }
    };

    const onCancel = () => {
        bottomSheetRef.current?.close();
        clearState();
    };

    useEffect(() => {
        clearState();
    }, []);

    useEffect(() => {
        if (user) {
            setTeam1Player1(user);
        }
    }, [user]);

    return (
        <BottomSheetModal
            backgroundStyle={{
                backgroundColor: Colors.background,
            }}
            ref={bottomSheetRef}
            topInset={headerHeight}
            snapPoints={snapPoints}
            backdropComponent={renderBackdrop}
            handleComponent={null}
            enablePanDownToClose={false}
            enableOverDrag={false}
            containerStyle={{
                position: "relative",
            }}
        >
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
                            backgroundColor: DefaultTheme.colors.card,
                            borderTopRightRadius: 20,
                            borderTopLeftRadius: 20,
                        }}
                    >
                        <TouchableOpacity onPress={onCancel}>
                            <Text
                                style={{
                                    color: DefaultTheme.colors.primary,
                                    fontSize: 17,
                                    width: 60,
                                }}
                            >
                                Cancel
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
                            New Match
                        </Text>
                        <TouchableOpacity onPress={onSave}>
                            <Text
                                style={{
                                    color: DefaultTheme.colors.primary,
                                    fontSize: 17,
                                    fontWeight: "600",
                                    width: 60,
                                    textAlign: "right",
                                }}
                            >
                                Save
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <View
                        style={{
                            width: "100%",
                            borderBottomWidth: 1,
                            borderBottomColor: "lightgray",
                        }}
                    />

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
                                setDate(selectedDate);
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
                </>
            )}
        </BottomSheetModal>
    );
}

export default NewMatchModal;

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

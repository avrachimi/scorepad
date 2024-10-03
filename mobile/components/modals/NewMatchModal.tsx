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
import { Colors } from "~/lib/theme";

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

    const [team2Score, setTeam2Score] = useState(0);
    const [duration, setDuration] = useState<number>(30);
    const [openDatePicker, setOpenDatePicker] = useState(false);
    const [openTimePicker, setOpenTimePicker] = useState(false);
    const [date, setDate] = useState(new Date());

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

    const handleSheetChanges = useCallback((index: number) => {
        console.log("handleSheetChanges", index);
    }, []);

    const renderBackdrop = useCallback(
        (props: any) => (
            <BottomSheetBackdrop
                appearsOnIndex={0}
                opacity={0.2}
                diasappearsOnIndex={-1}
                {...props}
                onPress={() => bottomSheetRef.current?.close()}
            />
        ),
        []
    );

    const clearState = () => {
        setTeam1Score(0);
        setTeam1Player1(undefined);

        setTeam2Score(0);

        setDuration(30);
        setDate(new Date());
    };

    const onSave = () => {
        console.log("Save");
        bottomSheetRef.current?.close();
        clearState();
    };

    const onCancel = () => {
        console.log("Cancel");
        bottomSheetRef.current?.close();
        clearState();
    };

    useEffect(() => {
        if (user) {
            setTeam1Player1(user);
        }
    }, [user]);

    return (
        <BottomSheetModal
            ref={bottomSheetRef}
            topInset={headerHeight}
            onChange={handleSheetChanges}
            snapPoints={snapPoints}
            backdropComponent={renderBackdrop}
            handleComponent={null}
            enablePanDownToClose={false}
        >
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
                                                borderColor: Colors.primary,
                                            }}
                                        />
                                    ) : (
                                        <Ionicons
                                            name="person-circle"
                                            size={24}
                                            color={DefaultTheme.colors.primary}
                                        />
                                    )}
                                    <Text style={styles.playerSelectorText}>
                                        {team1Player1.name}
                                    </Text>
                                </View>
                                <Ionicons
                                    name="chevron-forward"
                                    size={20}
                                    color={DefaultTheme.colors.primary}
                                />
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity style={styles.playerSelector}>
                                <Text style={styles.playerSelectorTextEmpty}>
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
                        <TouchableOpacity style={styles.playerSelector}>
                            <Text style={styles.playerSelectorTextEmpty}>
                                Select player
                            </Text>
                            <Ionicons
                                name="chevron-forward"
                                size={20}
                                color={DefaultTheme.colors.primary}
                            />
                        </TouchableOpacity>
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
                        <TouchableOpacity style={styles.playerSelector}>
                            <Text style={styles.playerSelectorTextEmpty}>
                                Select player
                            </Text>
                            <Ionicons
                                name="chevron-forward"
                                size={20}
                                color={DefaultTheme.colors.primary}
                            />
                        </TouchableOpacity>
                        <BottomLine />
                    </View>
                    <View>
                        <TouchableOpacity style={styles.playerSelector}>
                            <Text style={styles.playerSelectorTextEmpty}>
                                Select player
                            </Text>
                            <Ionicons
                                name="chevron-forward"
                                size={20}
                                color={DefaultTheme.colors.primary}
                            />
                        </TouchableOpacity>
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
                        {Object.entries(durationOptions).map(([str, mins]) => (
                            <TouchableOpacity
                                key={str}
                                style={[
                                    styles.durationButton,
                                    duration === mins &&
                                        styles.selectedDurationButton,
                                ]}
                                onPress={() => setDuration(mins)}
                            >
                                <Text style={styles.durationText}>{str}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>
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

import { Ionicons } from "@expo/vector-icons";
import { useHeaderHeight } from "@react-navigation/elements";
import dayjs from "dayjs";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useDatabase } from "~/hooks/useDatabase";
import { Colors, globalStyles } from "~/lib/theme";
import { formatDuration, getDayWithSuffix } from "~/util/format";

function Page() {
    const { id } = useLocalSearchParams<{ id?: string }>();
    const router = useRouter();
    const headerHeight = useHeaderHeight();

    const { singleMatchQuery } = useDatabase();
    const { data: match, isLoading } = singleMatchQuery.call(undefined, id!);

    useEffect(() => {
        if (!isLoading && !match) {
            router.back();
        }
    }, [match, isLoading]);

    if (!match) return null;

    return (
        <View
            style={{
                backgroundColor: Colors.primary,
            }}
        >
            <StatusBar style="light" />
            <Stack.Screen
                options={{
                    title: "Test",
                    headerTransparent: true,
                    contentStyle: {
                        paddingTop: headerHeight + 50,
                        backgroundColor: Colors.primary,
                    },
                }}
            />
            <View style={styles.container}>
                <View style={styles.nav}>
                    <TouchableOpacity
                        style={styles.btnBack}
                        onPress={router.back}
                    >
                        <Ionicons
                            name="chevron-back"
                            size={24}
                            color={"white"}
                        />
                        <Text style={styles.btnBackText}>Back</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnEdit}>
                        <Ionicons
                            name="create-outline"
                            size={24}
                            color={"white"}
                        />
                    </TouchableOpacity>
                </View>
                <View style={styles.scorePairContainer}>
                    <View style={styles.scoreTeamContainer}>
                        <Text style={styles.teamText}>Team 1</Text>
                        <Text style={styles.scoreText}>
                            {match.team1_score}
                        </Text>
                    </View>
                    <View style={styles.scoreTeamContainer}>
                        <Text style={styles.teamText}>Team 2</Text>
                        <Text style={styles.scoreText}>
                            {match.team2_score}
                        </Text>
                    </View>
                </View>
                <View style={styles.infoRow}>
                    <Text
                        style={{
                            color: "white",
                            fontSize: 15,
                            fontWeight: "600",
                        }}
                    >
                        {dayjs(match.match_date).format("MMMM DD")}
                        {getDayWithSuffix(dayjs(match.match_date).date())}
                        {", "}
                        {dayjs(match.match_date).format("YYYY")}
                    </Text>
                    <View
                        style={{
                            flexDirection: "row",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: 10,
                        }}
                    >
                        <View style={styles.tag}>
                            <Text style={styles.tagText}>
                                {dayjs(match.match_date).format("hh:mma")}
                            </Text>
                        </View>
                        <View style={styles.tag}>
                            <Text style={styles.tagText}>
                                {formatDuration(match.duration_minutes)}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
            <View style={styles.bottomContainer}>
                <View
                    style={{
                        width: "100%",
                        flexDirection: "row",
                        justifyContent: "flex-start",
                        alignItems: "center",
                        paddingHorizontal: 11,
                    }}
                >
                    <View
                        style={{
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        <Text
                            style={{
                                color: Colors.primary,
                                fontSize: 15,
                                fontWeight: "600",
                                padding: 15,
                                paddingBottom: 10,
                            }}
                        >
                            Players
                        </Text>
                        <View
                            style={{
                                borderBottomWidth: 2,
                                borderBottomColor: Colors.primary,
                                width: "85%",
                                paddingHorizontal: 15,
                            }}
                        />
                    </View>
                </View>
            </View>
            <View
                style={{
                    backgroundColor: Colors.background,
                    height: "100%",
                    flexDirection: "column",
                    justifyContent: "flex-start",
                    alignItems: "center",
                }}
            >
                <View style={styles.teamContainer}>
                    <Text style={styles.teamHeading}>Team 1</Text>
                    <View style={styles.teamCard}>
                        <View style={styles.teamMemberContainer}>
                            {match.team1_player1.image_url ? (
                                <Image
                                    src={match.team1_player1.image_url}
                                    style={styles.teamMemberImage}
                                />
                            ) : (
                                <Ionicons
                                    name="person-circle"
                                    size={50}
                                    color={Colors.accent}
                                />
                            )}
                            <Text style={styles.teamMemberName}>
                                {match.team1_player1.name}
                            </Text>
                        </View>
                        <View
                            style={{
                                flexDirection: "row",
                                justifyContent: "center",
                                alignItems: "center",
                                width: "100%",
                            }}
                        >
                            <View style={styles.line} />
                        </View>
                        <View style={styles.teamMemberContainer}>
                            {match.team1_player2 ? (
                                <>
                                    {match.team1_player2.image_url ? (
                                        <Image
                                            src={match.team1_player2.image_url}
                                            style={styles.teamMemberImage}
                                        />
                                    ) : (
                                        <Ionicons
                                            name="person-circle"
                                            size={50}
                                            color={Colors.accent}
                                        />
                                    )}
                                    <Text style={styles.teamMemberName}>
                                        {match.team1_player2.name}
                                    </Text>
                                </>
                            ) : (
                                <>
                                    <Ionicons
                                        name="person-circle"
                                        size={50}
                                        color="gray"
                                        style={{ opacity: 0.5 }}
                                    />
                                    <Text
                                        style={[
                                            styles.teamMemberName,
                                            { opacity: 0.5 },
                                        ]}
                                    >
                                        No Player Set
                                    </Text>
                                </>
                            )}
                        </View>
                    </View>
                </View>

                <View style={styles.teamContainer}>
                    <Text style={styles.teamHeading}>Team 2</Text>
                    <View style={styles.teamCard}>
                        <View style={styles.teamMemberContainer}>
                            {match.team2_player1 ? (
                                <>
                                    {match.team2_player1.image_url ? (
                                        <Image
                                            src={match.team2_player1.image_url}
                                            style={styles.teamMemberImage}
                                        />
                                    ) : (
                                        <Ionicons
                                            name="person-circle"
                                            size={50}
                                            color={Colors.accent}
                                        />
                                    )}
                                    <Text style={styles.teamMemberName}>
                                        {match.team2_player1.name}
                                    </Text>
                                </>
                            ) : (
                                <>
                                    <Ionicons
                                        name="person-circle"
                                        size={50}
                                        color="gray"
                                        style={{ opacity: 0.5 }}
                                    />
                                    <Text
                                        style={[
                                            styles.teamMemberName,
                                            { opacity: 0.5 },
                                        ]}
                                    >
                                        No Player Set
                                    </Text>
                                </>
                            )}
                        </View>
                        <View
                            style={{
                                flexDirection: "row",
                                justifyContent: "center",
                                alignItems: "center",
                                width: "100%",
                            }}
                        >
                            <View style={styles.line} />
                        </View>
                        <View style={styles.teamMemberContainer}>
                            {match.team2_player2 ? (
                                <>
                                    {match.team2_player2.image_url ? (
                                        <Image
                                            src={match.team2_player2.image_url}
                                            style={styles.teamMemberImage}
                                        />
                                    ) : (
                                        <Ionicons
                                            name="person-circle"
                                            size={50}
                                            color={Colors.accent}
                                        />
                                    )}
                                    <Text style={styles.teamMemberName}>
                                        {match.team2_player2.name}
                                    </Text>
                                </>
                            ) : (
                                <>
                                    <Ionicons
                                        name="person-circle"
                                        size={50}
                                        color="gray"
                                        style={{ opacity: 0.5 }}
                                    />
                                    <Text
                                        style={[
                                            styles.teamMemberName,
                                            { opacity: 0.5 },
                                        ]}
                                    >
                                        No Player Set
                                    </Text>
                                </>
                            )}
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
}

export default Page;

const styles = StyleSheet.create({
    container: {
        width: "100%",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 20,
    },
    nav: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
    },
    btnBack: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.primary,
        padding: 10,
        borderRadius: 10,
    },
    btnBackText: {
        color: "white",
        fontSize: 16,
        fontWeight: "500",
        marginLeft: 5,
    },
    btnEdit: {
        backgroundColor: Colors.primary,
        padding: 10,
        borderRadius: 10,
    },
    scorePairContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        width: "100%",
        paddingHorizontal: 47,
    },
    scoreTeamContainer: {
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
    },
    teamText: {
        textAlign: "center",
        color: "white",
        fontSize: 20,
        fontWeight: "600",
    },
    scoreText: {
        textAlign: "center",
        color: "white",
        fontSize: 48,
        fontWeight: "600",
    },
    tag: {
        backgroundColor: Colors.secondary,
        color: "white",
        paddingHorizontal: 5,
        paddingVertical: 2,
        borderRadius: 6,
    },
    tagText: {
        color: "white",
        fontSize: 15,
        fontWeight: "500",
    },
    infoRow: {
        flexDirection: "row",
        width: "100%",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 21,
        paddingTop: 10,
        paddingBottom: 5,
    },
    bottomContainer: {
        width: "100%",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        backgroundColor: Colors.background,
    },
    teamContainer: {
        marginTop: 20,
        width: "100%",
        justifyContent: "flex-start",
        alignItems: "center",
        gap: 7,
        padding: 20,
    },
    teamHeading: {
        alignSelf: "flex-start",
        fontSize: 20,
        fontWeight: "600",
    },
    teamCard: {
        width: "100%",
        justifyContent: "center",
        alignItems: "flex-start",
        backgroundColor: Colors.card_bg,
        borderRadius: 22,
        padding: 21,
        gap: 13,
        ...globalStyles.shadow,
    },
    teamMemberContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
    },
    teamMemberImage: {
        width: 50,
        height: 50,
        objectFit: "cover",
        borderRadius: 25,
        borderColor: Colors.primary,
        borderWidth: 1,
    },
    teamMemberName: {
        fontSize: 16,
        fontWeight: "600",
    },
    line: {
        borderBottomWidth: 1,
        borderBottomColor: "lightgray",
        opacity: 0.6,
        width: "70%",
    },
});

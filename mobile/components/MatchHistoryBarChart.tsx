import { LinearGradient, useFont, vec } from "@shopify/react-native-skia";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import dayjs from "dayjs";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Bar, CartesianChart } from "victory-native";
import { inter } from "~/assets/fonts/Inter_18pt-Medium.ttf";
import { useAuth } from "~/hooks/useAuth";
import { Colors, globalStyles } from "~/lib/theme";
import { Stats } from "~/lib/types";

function MatchHistoryBarChart() {
    const { accessToken } = useAuth();
    const font = useFont(inter, 18);

    const { data: matchHistory, isLoading: loadingMatchHistory } = useQuery({
        queryKey: ["statsMatchHistory"],
        queryFn: async () => {
            const res = await axios.get<Stats>(
                process.env.EXPO_PUBLIC_API_ENDPOINT + "/v1/stats",
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                    params: {
                        type: "matches",
                    },
                }
            );
            console.log("matchHistory", res.data);
            return res.data.matches_by_month;
        },
    });

    if (loadingMatchHistory) {
        return (
            <View style={{ width: "100%", height: 150 }}>
                <ActivityIndicator />
            </View>
        );
    }

    if (!matchHistory) {
        return null;
    }

    return (
        <View style={styles.container}>
            <Text
                style={[globalStyles.subHeading, { alignSelf: "flex-start" }]}
            >
                Matches Played
            </Text>
            <View
                style={{
                    width: "100%",
                    height: 150,
                    backgroundColor: Colors.card_bg,
                    borderRadius: 10,
                    padding: 10,
                    ...globalStyles.shadow,
                }}
            >
                <CartesianChart
                    data={matchHistory}
                    xKey={"month"}
                    yKeys={["matches"]}
                    domainPadding={{
                        left: 50,
                        right: 50,
                        bottom: 30,
                        top: 30,
                    }}
                    axisOptions={{
                        font,
                        formatXLabel: (value) => {
                            console.log("value", value);
                            if (!value) return "aaa";
                            return dayjs(value).format("MMM");
                        },
                        lineWidth: 0,
                    }}
                    xAxis={{
                        lineWidth: 0,
                    }}
                >
                    {({ points, chartBounds }) => (
                        <Bar
                            points={points.matches}
                            chartBounds={chartBounds}
                            barCount={points.matches.length}
                            roundedCorners={{ topLeft: 5, topRight: 5 }}
                            animate={{ type: "spring" }}
                        >
                            <LinearGradient
                                start={vec(0, 0)}
                                end={vec(0, 200)}
                                colors={[Colors.primary, Colors.primary + "0D"]}
                            />
                        </Bar>
                    )}
                </CartesianChart>
            </View>
        </View>
    );
}

export default MatchHistoryBarChart;

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 21,
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        gap: 10,
    },
});

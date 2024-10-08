import { StyleSheet, Text, View } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { Colors } from "~/lib/theme";

interface MatchesPlayedProps {
    matches?: number;
}

function MatchesPlayed({ matches }: MatchesPlayedProps) {
    if (!matches) {
        return null;
    }

    return (
        <View style={styles.container}>
            <Svg
                height="100%"
                width="100%"
                style={{ position: "absolute", width: "100%", height: 150 }}
            >
                <Defs>
                    <LinearGradient
                        id="grad"
                        x1="50%"
                        y1="0"
                        x2="50%"
                        y2="100%"
                    >
                        <Stop
                            offset="0%"
                            stopColor={Colors.primary}
                            stopOpacity="1"
                        />
                        <Stop
                            offset="100%"
                            stopColor={Colors.secondary}
                            stopOpacity="1"
                        />
                    </LinearGradient>
                </Defs>
                <Rect
                    width="100%"
                    height="150"
                    rx={10}
                    ry={10}
                    fill="url(#grad)"
                />
            </Svg>
            <Text style={styles.text}>{matches}</Text>
            <Text style={[styles.text, { fontSize: 24, fontWeight: "500" }]}>
                total matches played
            </Text>
        </View>
    );
}

export default MatchesPlayed;

const styles = StyleSheet.create({
    container: {
        justifyContent: "center",
        position: "relative",
        paddingHorizontal: 21,
        height: 150,
        width: "100%",
        alignItems: "center",
        borderRadius: 10,
        gap: 10,
    },
    text: {
        fontSize: 48,
        fontWeight: "bold",
        color: "white",
    },
});

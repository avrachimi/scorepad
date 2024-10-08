import { StyleSheet } from "react-native";

export const Colors = {
    primary: "#6682A9",
    secondary: "#9DB1CD",
    accent: "#7595C2",
    background: "#FCFDFD",
    success: "#3D7068",
    error: "#FF6D64",
    card_bg: "#6682A90D",
    primary_gradient: "linear-gradient(180deg, #6682A9 0%, #9DB1CD 100%);",
};

export const globalStyles = StyleSheet.create({
    shadow: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    btnPrimary: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.primary,
        minWidth: 300,
        borderRadius: 14,
        paddingVertical: 13,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    btnPrimaryText: {
        color: "#fff",
        fontWeight: "bold",
    },
    btnSecondary: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F4F8FF",
        borderRadius: 14,
        paddingHorizontal: 20,
        paddingVertical: 10,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    btnSecondaryText: {
        color: Colors.primary,
        fontSize: 17,
        fontWeight: "600",
    },
    subHeading: {
        fontSize: 16,
        fontWeight: "bold",
        color: Colors.accent,
    },
    tag: {
        backgroundColor: Colors.primary,
        color: "white",
        paddingHorizontal: 5,
        paddingVertical: 2,
        borderRadius: 6,
    },
    tagText: {
        color: "white",
        fontSize: 11,
        fontWeight: "500",
    },
});

import { StyleSheet } from "react-native";

export const Colors = {
    primary: "#6682A9",
    secondary: "#9DB1CD",
    accent: "#7595C2",
    background: "#FCFDFD",
    success: "#3D7068",
    error: "#FF6D64",
    card_bg: "#F4F7F9",
    primary_gradient: "linear-gradient(180deg, #6682A9 0%, #9DB1CD 100%);",
};

export const globalStyles = StyleSheet.create({
    shadow: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
});

import { useHeaderHeight } from "@react-navigation/elements";
import { Link } from "expo-router";
import { Text, View } from "react-native";

function Index() {
    const headerHeight = useHeaderHeight();

    return (
        <View
            style={{
                paddingTop: headerHeight + 30,
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                gap: 20,
            }}
        >
            <Text>Login Page</Text>
            <Link href={"/(authenticated)/(tabs)/home"}>Home</Link>
        </View>
    );
}

export default Index;

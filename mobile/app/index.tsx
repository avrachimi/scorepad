import { useHeaderHeight } from "@react-navigation/elements";
import { Image, Text, View, useWindowDimensions } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import CarouselScreen from "~/components/WelcomeCarousel";
import { useAuth } from "~/hooks/useAuth";
import { Colors } from "~/lib/theme";

function Index() {
    const { signIn } = useAuth();
    const headerHeight = useHeaderHeight();
    const { height } = useWindowDimensions();

    return (
        <View
            style={{
                paddingTop: headerHeight + 33,
                height: height,
                flex: 1,
                flexDirection: "column",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 20,
                backgroundColor: Colors.background,
            }}
        >
            <CarouselScreen />
            <View
                style={{
                    flex: 1,
                    flexDirection: "column",
                    justifyContent: "flex-start",
                    alignItems: "center",
                    padding: 20,
                }}
            >
                <TouchableOpacity
                    onPress={() => {
                        signIn();
                    }}
                    style={{
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: Colors.card_bg,
                        borderRadius: 10,
                        paddingHorizontal: 35,
                        paddingVertical: 15,
                        shadowColor: "#000000",
                        shadowOpacity: 0.25,
                        shadowRadius: 4,
                        shadowOffset: {
                            width: 0,
                            height: 4,
                        },
                    }}
                >
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 10,
                        }}
                    >
                        <Image
                            source={require("~/assets/images/google-logo.png")}
                            style={{
                                objectFit: "cover",
                                width: 20,
                                height: 20,
                            }}
                        />
                        <Text
                            style={{
                                fontSize: 17,
                                fontWeight: "semibold",
                                color: Colors.primary,
                            }}
                        >
                            Continue with Google
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
}

export default Index;

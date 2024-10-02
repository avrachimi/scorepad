import React, { useRef } from "react";
import {
    Image,
    StyleSheet,
    Text,
    View,
    useWindowDimensions,
} from "react-native";
import { useSharedValue } from "react-native-reanimated";
import {
    default as Carousel,
    ICarouselInstance,
    Pagination,
} from "react-native-reanimated-carousel";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "~/lib/theme";

interface Slide {
    title: string;
    description: string;
    image: any;
}

const data: Slide[] = [
    {
        title: "Track Your Padel Matches",
        description:
            "Log your matches, track stats, and collaborate with teammates effortlessly. Whether you're playing for fun or aiming for the top, get all your match details in one place and watch your game improve over time.",
        image: require("~/assets/images/padel1.png"),
    },
    {
        title: "Analyze Your Match Stats",
        description:
            "Dive deep into your performance. Track wins, losses, and key stats over time to see where you excel and where you can improve.",
        image: require("~/assets/images/padel2.png"),
    },
    {
        title: "Connect with Your Team",
        description:
            "Keep track of your teammates and opponents. Easily log match details and collaborate to grow together on the court.",
        image: require("~/assets/images/padel3.png"),
    },
];

const CarouselScreen = () => {
    const { width, height } = useWindowDimensions();
    const ref = useRef<ICarouselInstance>(null);
    const progress = useSharedValue(0);

    const onPressPagination = (index: number) => {
        ref.current?.scrollTo({
            count: index - progress.value,
            animated: true,
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={{ marginTop: -40, marginBottom: -30 }}>
                <Carousel
                    data={data}
                    width={width}
                    loop={true}
                    ref={ref}
                    style={{ margin: 0, padding: 0 }}
                    vertical={false}
                    pagingEnabled
                    onProgressChange={progress}
                    renderItem={({ _, item }: any) => (
                        <View style={styles.slide}>
                            <Image source={item.image} style={styles.image} />
                            <View
                                style={{
                                    flexDirection: "column",
                                    gap: 10,
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                            >
                                <Text style={styles.title}>{item.title}</Text>
                                <Text style={styles.description}>
                                    {item.description}
                                </Text>
                            </View>
                        </View>
                    )}
                />
                <Pagination.Basic
                    data={data}
                    progress={progress}
                    dotStyle={styles.inactiveDot}
                    size={8}
                    activeDotStyle={styles.activeDot}
                    containerStyle={{ gap: 10 }}
                    onPress={onPressPagination}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "column",
        justifyContent: "flex-start",
        height: "85%",
    },
    slide: {
        height: "100%",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
        padding: 20,
        paddingTop: 5,
        gap: 20,
    },
    image: {
        width: "100%",
        height: "70%",
        resizeMode: "cover",
        borderRadius: 15,
    },
    title: {
        fontSize: 24,
        fontWeight: "semibold",
        textAlign: "center",
        marginTop: 20,
        paddingHorizontal: 50,
    },
    description: {
        fontSize: 13,
        textAlign: "center",
        marginTop: 10,
        color: "#999999",
        paddingHorizontal: 50,
    },
    activeDot: {
        backgroundColor: Colors.primary,
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    inactiveDot: {
        backgroundColor: "#C4C4C4",
        width: 8,
        height: 8,
        borderRadius: 4,
    },
});

export default CarouselScreen;

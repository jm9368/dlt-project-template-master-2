// Component: HomeScreen
// Home screen

import { View, Text } from "react-native";

import { useTranslation } from "../../../hooks/translation";
import { useThemedStyle } from "../../../style/themed-style";
import HomeScreenStyles from "../../../style/screens/home";
import GeneralScreenBase from "../../utils/GeneralScreenBase";
import { NavigationProp } from "@react-navigation/native";

export default function HomeScreen({ navigation }: { navigation: NavigationProp<any> }) {
    const { t } = useTranslation();

    const Styles = useThemedStyle(HomeScreenStyles);

    return (
        <GeneralScreenBase current="HomeScreen" navigation={navigation}>
            <View>
                <View style={Styles.titleContainer}>
                    <Text style={Styles.title}>{t("Home")}</Text>
                </View>
                <View style={Styles.row}>
                    <Text style={Styles.text}>TODO</Text>
                </View>
            </View>
        </GeneralScreenBase>
    );
}

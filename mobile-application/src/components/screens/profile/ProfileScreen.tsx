// Component: ProfileScreen
// Displays the profile of an user

import { View, Text, ActivityIndicator, Image, Linking } from "react-native";

import { useTranslation } from "../../../hooks/translation";
import { useThemedStyle } from "../../../style/themed-style";
import GeneralScreenBase from "../../utils/GeneralScreenBase";
import { NavigationProp, useRoute } from "@react-navigation/native";
import { useAuth } from "../../../hooks/auth";
import { useEffect, useState } from "react";
import { getUniqueStringId } from "../../../utils/unique-id";
import { Timeouts } from "../../../utils/timeout";
import { Request } from "@asanrom/request-browser";
import { ApiProfile } from "../../../api/api-group-profile";
import { AppEvents } from "../../../control/app-events";
import { UserProfile } from "../../../api/definitions";
import { useTheme } from "../../../style/theme-context";
import ProfileScreenStyles from "../../../style/screens/profile";
import AppImage from "../../utils/AppImage";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { renderDate } from "../../../utils/time-utils";
import AppButton from "../../utils/AppButton";
import TouchableLink from "../../utils/TouchableLink";

export default function ProfileScreen({ navigation }: { navigation: NavigationProp<any> }) {
    const { t } = useTranslation();

    const { theme } = useTheme();

    const [loadRequestId] = useState(getUniqueStringId());

    const route = useRoute();

    const q = (route.params as any)["q"] || "";

    const { uid } = useAuth();

    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    const [data, setData] = useState<UserProfile>(null);

    const load = () => {
        setLoading(true);

        Timeouts.Abort(loadRequestId);

        Request.Pending(loadRequestId, ApiProfile.GetProfile(q))
            .onSuccess(response => {
                setData(response);
                setLoading(false);
                setNotFound(false);
            })
            .onRequestError((err, handleErr) => {
                handleErr(err, {
                    unauthorized: () => {
                        AppEvents.Emit("unauthorized");
                        if (navigation.isFocused()) {
                            navigation.navigate("LoginScreen");
                        }
                    },
                    notFound: () => {
                        setLoading(false);
                        setNotFound(true);
                    },
                    temporalError: () => {
                        Timeouts.Set(loadRequestId, 1500, load);
                    },
                });
            })
            .onUnexpectedError(err => {
                console.error(err);
                Timeouts.Set(loadRequestId, 1500, load);
            });
    };

    useEffect(() => {
        load();

        return () => {
            Timeouts.Abort(loadRequestId);
            Request.Abort(loadRequestId);
        };
    }, [q]);

    const Styles = useThemedStyle(ProfileScreenStyles);

    const getImage = (profileImage: string) => {
        if (profileImage) {
            return <AppImage style={Styles.profileImage} src={profileImage} />;
        } else {
            return <Image style={Styles.profileImage} source={require("../../../../assets/user.png")} />;
        }
    };

    return (
        <GeneralScreenBase
            current="ProfileScreen"
            navigation={navigation}
            refreshing={loading}
            onRefresh={() => {
                load();
            }}>
            {loading ? (
                <ActivityIndicator size="large" color={theme.activityIndicatorColor} />
            ) : notFound || !data ? (
                <View>
                    <View style={Styles.profileImageContainer}>{getImage(data.image)}</View>
                    <Text style={Styles.profileName}>{t("User not found")}</Text>
                    <Text style={Styles.notFoundDescription}>
                        {t("The user you are looking for does not exist or was deleted from the platform.")}
                    </Text>
                </View>
            ) : (
                <View>
                    <View style={Styles.profileImageContainer}>{getImage(data.image)}</View>
                    <Text style={Styles.profileName}>{data.name || data.username}</Text>
                    <Text style={Styles.username}>@{data.username}</Text>

                    <View style={Styles.row}>
                        <FontAwesomeIcon icon="calendar" size={14} color={theme.text} />
                        <Text style={Styles.detail}>
                            {t("Join date")}: {renderDate(data.joinDate, t)}
                        </Text>
                    </View>

                    {!!data.bio && (
                        <View style={Styles.row}>
                            <FontAwesomeIcon icon="info" size={14} color={theme.text} />
                            <Text style={Styles.detail}>{data.bio}</Text>
                        </View>
                    )}

                    {!!data.location && (
                        <View style={Styles.row}>
                            <FontAwesomeIcon icon="location-dot" size={14} color={theme.text} />
                            <Text style={Styles.detail}>{data.location}</Text>
                        </View>
                    )}

                    {!!data.website && (
                        <View style={Styles.row}>
                            <FontAwesomeIcon icon="link" size={14} color={theme.text} />
                            <Text style={Styles.detail} />
                            <TouchableLink
                                onPress={() => {
                                    Linking.openURL(data.website).catch(err => {
                                        console.error(err);
                                    });
                                }}>
                                {data.website}
                            </TouchableLink>
                        </View>
                    )}

                    {data.id === uid && (
                        <View style={Styles.rowButtons}>
                            <AppButton
                                paddingH={10}
                                title={t("Edit profile")}
                                icon="pencil"
                                size={14}
                                onPress={() => {
                                    navigation.navigate("EditProfileScreen");
                                }}
                            />
                        </View>
                    )}
                </View>
            )}
        </GeneralScreenBase>
    );
}

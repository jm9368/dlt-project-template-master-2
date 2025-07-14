// Component: EditProfileScreen
// Edit profile

import { View, Text, ActivityIndicator, Image } from "react-native";

import { useTranslation } from "../../../hooks/translation";
import { useThemedStyle } from "../../../style/themed-style";
import { NavigationProp } from "@react-navigation/native";
import AccountSettingsBase from "./AccountSettingsBase";
import AccountSettingsScreensStyles from "../../../style/screens/account-settings";
import { useEffect, useState } from "react";
import { useAuth } from "../../../hooks/auth";
import { Timeouts } from "../../../utils/timeout";
import { getUniqueStringId } from "../../../utils/unique-id";
import { Request } from "@asanrom/request-browser";
import { ApiProfile } from "../../../api/api-group-profile";
import { AppEvents } from "../../../control/app-events";
import { useTheme } from "../../../style/theme-context";
import AppImage from "../../utils/AppImage";
import AppFormInput from "../../utils/AppFormInput";
import AppButton from "../../utils/AppButton";
import { NavigationCallbacks } from "../../../control/navigation-callbacks";
import { AuthController } from "../../../control/auth";
import * as ImagePicker from "expo-image-picker";
import { renderSizeBytes } from "../../../utils/size";

const IMAGE_UPLOAD_MAX_SIZE = 20 * 1024 * 1024;

export default function EditProfileScreen({ navigation }: { navigation: NavigationProp<any> }) {
    const { t } = useTranslation();

    const [loadRequestId] = useState(getUniqueStringId());

    const { uid } = useAuth();

    const { theme } = useTheme();

    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [dirty, setDirty] = useState(false);

    const [name, setName] = useState("");
    const [profileImage, setProfileImage] = useState("");
    const [location, setLocation] = useState("");
    const [website, setWebsite] = useState("");
    const [bio, setBio] = useState("");

    const [errorName, setErrorName] = useState("");
    const [errorLocation, setErrorLocation] = useState("");
    const [errorWebsite, setErrorWebsite] = useState("");
    const [errorBio, setErrorBio] = useState("");

    const load = () => {
        setLoading(true);

        Timeouts.Abort(loadRequestId);

        Request.Pending(loadRequestId, ApiProfile.GetProfile(uid))
            .onSuccess(response => {
                setLoading(false);

                setDirty(false);

                setName(response.name);
                setProfileImage(response.image);
                setLocation(response.location);
                setWebsite(response.website);
                setBio(response.bio);

                setErrorName("");
                setErrorBio("");
                setErrorLocation("");
                setErrorWebsite("");
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
                        if (navigation.isFocused()) {
                            navigation.navigate("HomeScreen");
                        }
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
    }, [uid]);

    const uploadImage = (imageFile: ImagePicker.ImagePickerAsset) => {
        if (busy) {
            return;
        }

        setBusy(true);

        Request.Do(ApiProfile.UpdateImage({ image: imageFile }))
            .onSuccess(response => {
                setBusy(false);
                setProfileImage(response.url);
                NavigationCallbacks.ShowSuccessMessage(navigation, t("Success"), t("Profile image changed"));
                AuthController.CheckAuthStatus();
            })
            .onRequestError((err, handleErr) => {
                setBusy(false);
                handleErr(err, {
                    unauthorized: () => {
                        NavigationCallbacks.ShowErrorMessage(navigation, t("Error"), t("Unauthorized"));
                        AppEvents.Emit("unauthorized");
                        if (navigation.isFocused()) {
                            navigation.navigate("LoginScreen");
                        }
                    },
                    badRequest: () => {
                        NavigationCallbacks.ShowErrorMessage(navigation, t("Error"), t("Invalid image provided"));
                    },
                    serverError: () => {
                        NavigationCallbacks.ShowErrorMessage(navigation, t("Error"), t("Internal server error"));
                    },
                    networkError: () => {
                        NavigationCallbacks.ShowErrorMessage(navigation, t("Error"), t("Could not connect to the server"));
                    },
                });
            })
            .onUnexpectedError(err => {
                setBusy(false);
                NavigationCallbacks.ShowErrorMessage(navigation, t("Error"), err.message);
            });
    };

    const changeImage = () => {
        ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 4],
            quality: 1,
        })
            .then(result => {
                if (result.canceled || result.assets.length === 0) {
                    return;
                }

                const imageFile = result.assets[0];

                if (imageFile.fileSize > IMAGE_UPLOAD_MAX_SIZE) {
                    NavigationCallbacks.ShowErrorMessage(
                        navigation,
                        t("Error"),
                        t("The image must not be bigger than $SIZE.").replace("$SIZE", renderSizeBytes(IMAGE_UPLOAD_MAX_SIZE)),
                    );
                    return;
                }

                uploadImage(imageFile);
            })
            .catch(err => {
                setBusy(false);
                console.error(err);
                NavigationCallbacks.ShowErrorMessage(navigation, t("Error"), err.message);
            });
    };

    const deleteImage = () => {
        if (busy) {
            return;
        }

        setBusy(true);

        Request.Do(ApiProfile.DeleteImage())
            .onSuccess(() => {
                setBusy(false);
                setDirty(false);
                setProfileImage("");
                NavigationCallbacks.ShowSuccessMessage(navigation, t("Success"), t("Profile image successfully deleted!"));
                AuthController.CheckAuthStatus();
            })
            .onRequestError((err, handleErr) => {
                setBusy(false);
                handleErr(err, {
                    unauthorized: () => {
                        NavigationCallbacks.ShowErrorMessage(navigation, t("Error"), t("Unauthorized"));
                        AppEvents.Emit("unauthorized");
                        if (navigation.isFocused()) {
                            navigation.navigate("LoginScreen");
                        }
                    },
                    serverError: () => {
                        NavigationCallbacks.ShowErrorMessage(navigation, t("Error"), t("Internal server error"));
                    },
                    networkError: () => {
                        NavigationCallbacks.ShowErrorMessage(navigation, t("Error"), t("Could not connect to the server"));
                    },
                });
            })
            .onUnexpectedError(err => {
                setBusy(false);
                NavigationCallbacks.ShowErrorMessage(navigation, t("Error"), err.message);
            });
    };

    const askDeleteImage = () => {
        NavigationCallbacks.AskConfirmation(
            navigation,
            t("Delete profile image"),
            t("Do you want to delete your current profile image?"),
            () => {
                deleteImage();
            },
        );
    };

    const saveProfileChanges = () => {
        if (busy) {
            return;
        }

        setBusy(true);

        Request.Do(ApiProfile.UpdateProfile({ name, bio, location, website }))
            .onSuccess(() => {
                setBusy(false);
                setDirty(false);
                NavigationCallbacks.ShowSuccessMessage(navigation, t("Success"), t("Profile successfully updated!"));
                AuthController.CheckAuthStatus();
            })
            .onRequestError((err, handleErr) => {
                setBusy(false);
                handleErr(err, {
                    unauthorized: () => {
                        NavigationCallbacks.ShowErrorMessage(navigation, t("Error"), t("Unauthorized"));
                        AppEvents.Emit("unauthorized");
                        if (navigation.isFocused()) {
                            navigation.navigate("LoginScreen");
                        }
                    },
                    badRequestInvalidName: () => {
                        setErrorName(t("Invalid profile name"));
                    },
                    badRequestInvalidBio: () => {
                        setErrorBio(t("Invalid profile description"));
                    },
                    badRequestInvalidLocation: () => {
                        setErrorLocation(t("Invalid location"));
                    },
                    badRequestInvalidWebsite: () => {
                        setErrorWebsite(t("Invalid website. Must be a valid URL."));
                    },
                    badRequest: () => {
                        NavigationCallbacks.ShowErrorMessage(navigation, t("Error"), t("Bad request"));
                    },
                    serverError: () => {
                        NavigationCallbacks.ShowErrorMessage(navigation, t("Error"), t("Internal server error"));
                    },
                    networkError: () => {
                        NavigationCallbacks.ShowErrorMessage(navigation, t("Error"), t("Could not connect to the server"));
                    },
                });
            })
            .onUnexpectedError(err => {
                setBusy(false);
                NavigationCallbacks.ShowErrorMessage(navigation, t("Error"), err.message);
            });
    };

    const Styles = useThemedStyle(AccountSettingsScreensStyles);

    const getImage = (profileImage: string) => {
        if (profileImage) {
            return <AppImage style={Styles.profileImage} src={profileImage} />;
        } else {
            return <Image style={Styles.profileImage} source={require("../../../../assets/user.png")} />;
        }
    };

    return (
        <AccountSettingsBase
            current="EditProfileScreen"
            navigation={navigation}
            refreshing={loading}
            onRefresh={() => {
                load();
            }}
            busy={busy}>
            {loading ? (
                <ActivityIndicator size="large" color={theme.activityIndicatorColor} />
            ) : (
                <View>
                    <View style={Styles.subTitleContainer}>
                        <Text style={Styles.subTitle}>{t("Edit profile")}</Text>
                    </View>

                    <AppFormInput
                        value={name}
                        setValue={v => {
                            setErrorName("");
                            setName(v);
                        }}
                        label={t("Profile name")}
                        maxLength={80}
                        error={errorName}
                        disabled={busy}
                    />

                    <View style={Styles.row}>{getImage(profileImage)}</View>

                    <View style={Styles.row}>
                        <AppButton paddingH={20} disabled={busy} icon="upload" onPress={changeImage} title={t("Upload new image")} />
                    </View>

                    {!!profileImage && (
                        <View style={Styles.row}>
                            <AppButton
                                paddingH={20}
                                disabled={busy}
                                icon="trash-alt"
                                kind="danger"
                                onPress={askDeleteImage}
                                title={t("Delete image")}
                            />
                        </View>
                    )}

                    <AppFormInput
                        value={bio}
                        setValue={v => {
                            setErrorBio("");
                            setDirty(true);
                            setBio(v);
                        }}
                        label={t("Profile description")}
                        maxLength={300}
                        error={errorBio}
                        disabled={busy}
                        multiLine={3}
                    />

                    <AppFormInput
                        value={location}
                        setValue={v => {
                            setErrorLocation("");
                            setDirty(true);
                            setLocation(v);
                        }}
                        label={t("Location")}
                        maxLength={100}
                        error={errorLocation}
                        disabled={busy}
                    />

                    <AppFormInput
                        value={website}
                        setValue={v => {
                            setErrorWebsite("");
                            setDirty(true);
                            setWebsite(v);
                        }}
                        label={t("Website")}
                        maxLength={100}
                        error={errorWebsite}
                        disabled={busy}
                    />

                    <View style={Styles.row}>
                        <AppButton
                            paddingH={20}
                            disabled={busy || !dirty}
                            icon="save"
                            title={t("Save changes")}
                            onPress={saveProfileChanges}
                        />
                    </View>
                    <View style={Styles.row} />
                </View>
            )}
        </AccountSettingsBase>
    );
}

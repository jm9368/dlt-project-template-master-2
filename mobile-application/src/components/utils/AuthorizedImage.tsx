// Component: AuthorizedImage
// Network image with authorization

import { Image, ImageSourcePropType, ImageStyle, StyleProp } from "react-native";
import { useCallback, useEffect, useState } from "react";
import { fixAssetURL } from "../../utils/assets";
import { useAuth } from "../../hooks/auth";

export interface AuthorizedImageProps {
    /**
     * The URL of the image
     */
    src: string;

    /**
     * Style to apply to the image
     */
    style: StyleProp<ImageStyle>;
}

const AuthorizedImage = ({ src, style }: AuthorizedImageProps) => {
    const [source, setSource] = useState<ImageSourcePropType | undefined>(undefined);

    const { session } = useAuth();

    const load = useCallback(async () => {
        try {
            const response = await fetch(fixAssetURL(src), { headers: { Cookie: `session_id=${session}` } });
            const blob = await response.blob();
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = () => setSource({ uri: reader.result as string });
        } catch (err) {
            // file loading failed
            setSource(null);
        }
    }, [src, session]);

    useEffect(() => {
        load();
    }, [load]);

    return <Image style={style} source={source} />;
};

export default AuthorizedImage;

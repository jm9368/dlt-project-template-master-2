// Component: AppImage
// Network image without authorization

import { Image, ImageSourcePropType, ImageStyle, StyleProp } from "react-native";
import { useCallback, useEffect, useState } from "react";
import { fixAssetURL } from "../../utils/assets";

export interface AppImageProps {
    /**
     * The URL of the image
     */
    src: string;

    /**
     * Style to apply to the image
     */
    style: StyleProp<ImageStyle>;
}

const AppImage = ({ src, style }: AppImageProps) => {
    const [source, setSource] = useState<ImageSourcePropType | undefined>(undefined);

    const load = useCallback(async () => {
        try {
            const response = await fetch(fixAssetURL(src));
            const blob = await response.blob();
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = () => setSource({ uri: reader.result as string });
        } catch (err) {
            // file loading failed
            setSource(null);
        }
    }, [src]);

    useEffect(() => {
        load();
    }, [load]);

    return <Image style={style} source={source} />;
};

export default AppImage;

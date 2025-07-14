// Component: AuthFormTitle
// Renders the title of an auth screen form

import { Text } from "react-native";
import { useThemedStyle } from "../../../style/themed-style";
import AuthStyles from "../../../style/screens/auth";

const AuthFormTitle = ({ children }: any) => {
    const Styles = useThemedStyle(AuthStyles);

    return <Text style={Styles.title}>{children}</Text>;
};

export default AuthFormTitle;

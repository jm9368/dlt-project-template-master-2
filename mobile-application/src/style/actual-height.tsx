// Actual height context

import React, { useContext, useState } from "react";
import { Dimensions, View } from "react-native";

const Context = React.createContext<number>(Dimensions.get("window").height);

interface Props {
    children?: React.ReactNode;
}

export const ActualHeightProvider = React.memo<Props>(props => {
    const [appHeight, setAppHeight] = useState(Dimensions.get("window").height);

    return (
        <Context.Provider value={appHeight}>
            <View
                style={{ flex: 1 }}
                onLayout={e => {
                    if (e.nativeEvent.layout.height > Dimensions.get("window").height) {
                        setAppHeight(e.nativeEvent.layout.height);
                    }
                }}>
                {props.children}
            </View>
        </Context.Provider>
    );
});

export function useActualHeight() {
    return useContext(Context);
}

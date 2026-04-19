import { useThemeColor } from "@/hooks/use-theme-color";
import { StyleSheet, Text, TextProps } from "react-native";

export type ThemedTextProps = TextProps & {
    color?: string,
    type?: 'caption' | 'body' | 'subHeading' | 'heading2' | 'heading1' | 'title' | 'titleWide';
}

export function ThemedText({ style, color, type = 'body', ...rest }: ThemedTextProps) {

    color = color ?? useThemeColor({}, 'neutral-900')

    return (
        <Text style={[
            style,
            { color },
            type === 'caption' ? styles.caption : undefined,
            type === 'body' ? styles.body : undefined,
            type === 'subHeading' ? styles.subHeading : undefined,
            type === 'heading2' ? styles.heading2 : undefined,
            type === 'heading1' ? styles.heading1 : undefined,
            type === 'title' ? styles.title : undefined,
            type === 'titleWide' ? styles.titleWide : undefined
        ]} {...rest}>
            {rest.children}
        </Text>
    )
}

const styles = StyleSheet.create({
    caption: {
        fontFamily: "MartianGrotesk-StdxBd",
        fontSize: 10,
        lineHeight: 13.6
    },

    body: {
        fontFamily: "MartianGrotesk-StdRg",
        fontSize: 14,
        lineHeight: 20.5
    },

    subHeading: {
        fontFamily: "MartianGrotesk-StdMd",
        fontSize: 22.65,
        lineHeight: 31.1,
        letterSpacing: .1
    },

    heading2: {
        fontFamily: "MartianGrotesk-NrBl",
        fontSize: 36.65,
        lineHeight: 40.1,
        letterSpacing: -.2
    },

    heading1: {
        fontFamily: "MartianGrotesk-StdxBd",
        fontSize: 59.3,
        lineHeight: 67.6,
    },

    title: {
        fontFamily: "MartianGrotesk-StdBl",
        fontSize: 95.95,
        lineHeight: 125.4,
    },

    titleWide: {
        fontFamily: "MartianGrotesk-sWdBl",
        fontSize: 95.95,
        lineHeight: 205.4,
    }
})
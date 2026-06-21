// Registers className support for components NativeWind doesn't wrap automatically.
// react-native-css-interop only auto-registers the plain RN exports (View, Text, ...),
// so wrapped components like Animated.View are a different reference and need opting in.
//
// IMPORTANT: cssInterop swaps the component for every instance of that exact
// reference, app-wide — not just instances that pass className. Registering it
// for react-native-reanimated's Animated.View/Animated.Text breaks
// useAnimatedStyle()/useAnimatedScrollHandler() on ALL of them, even ones with
// no className at all. Only register core React Native's Animated here; give
// reanimated's Animated.View/Animated.Text their styling via a plain View/Text
// nested inside instead of className directly on the animated element.
import { cssInterop } from 'nativewind';
import { Animated } from 'react-native';

cssInterop(Animated.View, { className: 'style' });
cssInterop(Animated.Text, { className: 'style' });

// @rn-primitives/* components are also third-party (not in NativeWind's
// default registration list), so every Root/Item/Content-level component we
// pass className to needs registering here too, the same way IcomoonIcon does.
import * as AvatarPrimitive from '@rn-primitives/avatar';
import * as CheckboxPrimitive from '@rn-primitives/checkbox';
import * as DialogPrimitive from '@rn-primitives/dialog';
import * as ProgressPrimitive from '@rn-primitives/progress';
import * as RadioGroupPrimitive from '@rn-primitives/radio-group';
import * as SeparatorPrimitive from '@rn-primitives/separator';
import * as SwitchPrimitive from '@rn-primitives/switch';
import * as TabsPrimitive from '@rn-primitives/tabs';
import * as ToggleGroupPrimitive from '@rn-primitives/toggle-group';

cssInterop(AvatarPrimitive.Root, { className: 'style' });
cssInterop(SwitchPrimitive.Root, { className: 'style' });
cssInterop(DialogPrimitive.Overlay, { className: 'style' });
cssInterop(DialogPrimitive.Content, { className: 'style' });
cssInterop(CheckboxPrimitive.Root, { className: 'style' });
cssInterop(CheckboxPrimitive.Indicator, { className: 'style' });
cssInterop(RadioGroupPrimitive.Root, { className: 'style' });
cssInterop(RadioGroupPrimitive.Item, { className: 'style' });
cssInterop(TabsPrimitive.Root, { className: 'style' });
cssInterop(TabsPrimitive.List, { className: 'style' });
cssInterop(TabsPrimitive.Trigger, { className: 'style' });
cssInterop(TabsPrimitive.Content, { className: 'style' });
cssInterop(SeparatorPrimitive.Root, { className: 'style' });
cssInterop(ProgressPrimitive.Root, { className: 'style' });
cssInterop(ToggleGroupPrimitive.Root, { className: 'style' });
cssInterop(ToggleGroupPrimitive.Item, { className: 'style' });

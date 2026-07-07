/**
 * NativeWind Interop — registers className support for components that
 * NativeWind v5 doesn't wrap automatically.
 *
 * NativeWind v5 uses react-native-css-interop's new architecture which
 * handles most standard RN components automatically. Third-party libs
 * that don't ship NativeWind-aware exports still need manual registration.
 *
 * IMPORTANT: cssInterop swaps the component for every instance of that
 * exact reference, app-wide. Do NOT register Reanimated's Animated.View /
 * Animated.Text here — this breaks useAnimatedStyle(). Instead, nest a
 * plain View/Text inside for Tailwind styling on those components.
 */
import { cssInterop } from 'react-native-css-interop';
import { Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

cssInterop(Animated.View, { className: 'style' });
cssInterop(Animated.Text, { className: 'style' });
cssInterop(SafeAreaView, { className: 'style' });

// @rn-primitives/* components are third-party and need className → style mapping.
import * as AvatarPrimitive from '@rn-primitives/avatar';
import * as CheckboxPrimitive from '@rn-primitives/checkbox';
import * as ProgressPrimitive from '@rn-primitives/progress';
import * as RadioGroupPrimitive from '@rn-primitives/radio-group';
import * as SeparatorPrimitive from '@rn-primitives/separator';
import * as SwitchPrimitive from '@rn-primitives/switch';
import * as TabsPrimitive from '@rn-primitives/tabs';
import * as ToggleGroupPrimitive from '@rn-primitives/toggle-group';

cssInterop(AvatarPrimitive.Root, { className: 'style' });
cssInterop(SwitchPrimitive.Root, { className: 'style' });
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

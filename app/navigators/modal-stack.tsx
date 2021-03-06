import React from "react"
import { Platform } from "react-native"
import { RouteProp } from "@react-navigation/native"
import {
  createStackNavigator,
  StackNavigationProp,
  TransitionPresets,
} from "@react-navigation/stack"
import { AddEventScreen, AddTimelineScreen } from "screens"

import { DrawerNavigator } from "./drawer-navigator"

/**
 * This type allows TypeScript to know what routes are defined in this navigator
 * as well as what properties (if any) they might take when navigating to them.
 *
 * We recommend using MobX-State-Tree store(s) to handle state rather than navigation params.
 *
 * For more information, see this documentation:
 *   https://reactnavigation.org/docs/params/
 *   https://reactnavigation.org/docs/typescript#type-checking-the-navigator
 */
export type ModalStackParamList = {
  main: undefined
  addEvent: { timelineId: number }
  editEvent: { eventId: number; timelineId: number }
  addTimeline: undefined
}
/**
 * Utility type to make it easier to use with `useNavigation()`
 *
 * **Example usage**:
 * ```typescript
 * const navigation = useNavigation<PrimaryStackNavigationProp<"timeline">>()
 * ```
 */
export type ModalStackNavigationProp<T extends keyof ModalStackParamList> = StackNavigationProp<
  ModalStackParamList,
  T
>
/**
 * Utility type to make it easier to use with `useRoute()`
 *
 * **Example usage**:
 * ```typescript
 * const { params: { id } } = useRoute<PrimaryRouteProp<"timeline">>()
 * ```
 */
export type ModalStackRouteProp<T extends keyof ModalStackParamList> = RouteProp<
  ModalStackParamList,
  T
>

const ModalStack = createStackNavigator<ModalStackParamList>()
const transition = () =>
  Platform.OS === "ios" ? TransitionPresets.ModalPresentationIOS : undefined

export const ModalStackScreen = () => (
  <ModalStack.Navigator
    initialRouteName="main"
    mode="modal"
    screenOptions={() => {
      return {
        headerShown: false,
        gestureEnabled: Platform.OS === "ios",
        cardOverlayEnabled: true,
        ...transition(),
      }
    }}
  >
    <ModalStack.Screen name="main" component={DrawerNavigator} />
    <ModalStack.Screen
      name="addTimeline"
      options={() => {
        return {
          headerShown: true,
          title: "New Timeline",
        }
      }}
      component={AddTimelineScreen}
    />
    <ModalStack.Screen
      name="addEvent"
      options={() => {
        return {
          headerShown: true,
          title: "New Event",
        }
      }}
      component={AddEventScreen}
    />
  </ModalStack.Navigator>
)

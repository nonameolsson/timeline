/**
 * The root navigator is used to switch between major navigation flows of your app.
 * Generally speaking, it will contain an auth flow (registration, login, forgot password)
 * and a "main" flow (which is contained in your MainNavigator) which the user
 * will use once logged in.
 */
import React, { forwardRef } from "react"
import { NavigationContainer, NavigationContainerRef } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import { observer } from "mobx-react-lite"

import { useStores } from "models"

import { AuthNavigator } from "./auth-navigator"
import { ModalStackScreen } from "./modal-stack"

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
export type RootParamList = {
  modalStack: undefined
  authStack: undefined
}

const Stack = createStackNavigator<RootParamList>()

const RootStack = observer(function RootStack() {
  const { userStore } = useStores()

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
      }}
    >
      {userStore.isLoggedIn() ? (
        <Stack.Screen name="modalStack" component={ModalStackScreen} />
      ) : (
        <Stack.Screen name="authStack" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  )
})

export const RootNavigator = forwardRef<
  NavigationContainerRef,
  Partial<React.ComponentProps<typeof NavigationContainer>>
>((props, ref) => {
  return (
    <NavigationContainer {...props} ref={ref}>
      <RootStack />
    </NavigationContainer>
  )
})

RootNavigator.displayName = "RootNavigator"

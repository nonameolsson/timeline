import React, { useState, useCallback } from "react"
import { ActivityIndicator, SafeAreaView, View } from "react-native"
import { Button, Text, List, useTheme } from "react-native-paper"
import { observer } from "mobx-react-lite"
import { useNavigation, useRoute, useFocusEffect, CompositeNavigationProp } from "@react-navigation/native"
import { StackScreenProps, StackNavigationProp } from "@react-navigation/stack"
import { MaterialBottomTabNavigationProp } from "@react-navigation/material-bottom-tabs"

import { AddTimelineForm } from 'components'
import { useStores } from "models"
import { TimelineStackNavigationProp, TimelineRouteProp, TimelineParamList } from "navigation"
import { styles } from "./timelines-screen.styles"
import { pathOr } from 'ramda'
import { BottomTabParamList } from 'navigation/primary-tab-navigator'

// type TimelinesScreenProp = {
//   navigation: CompositeNavigationProp<
//     MaterialBottomTabNavigationProp<BottomTabParamList, "timelines">,
//     StackNavigationProp<RootTimelineParamList>>
//   route: TimelineRouteProp<"timelines">
// }

// type Props = {
//   navigation: TimelineStackNavigationProp<"timelines">
//   route: TimelineRouteProp<"timelines">
// };

export const TimelinesScreen = observer(function TimelinesScreen({ navigation, route: { params } }: any) {
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const {
    colors: { background },
  } = useTheme()

  // Fix to get correct type
  const { userStore, timelineStore } = useStores()

  const onOpen = () => navigation.navigate('addTimeline')
  // const onOpen = () => navigation.navigate('main')

  // TODO: Adjust so new timelines are retrieved when navigating to this screen.
  useFocusEffect(
    useCallback(() => {
      if (userStore.user) {
        timelineStore.getTimelines(userStore.user.id).then(() => setIsLoading(false))
      }
    }, [timelineStore, userStore.user])
  )

  useFocusEffect(
    useCallback(() => {
      if (!params || !params.action) return
      const { action } = params

      const deleteTimeline = async (timelineId: string) => {
        const timeline = timelineStore.getTimeline(timelineId)
        if (!timeline) return

        await timeline.deleteAllEvents()
        await timelineStore.deleteTimeline(timelineId)
      }

      if (action.type === 'DELETE_TIMELINE') {
        setIsLoading(true)
        deleteTimeline(action.meta.id)
        setIsLoading(false)
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params])
  )

  const openTimeline = (id: string, title: string): void => {
    navigation.navigate("timeline", { id, title })
  }

  const renderEmptyState = () => <Text>Please create a timeline first.</Text>

  const renderList = () => {
    return timelineStore.getTimelinesArray().map(timeline => (
      <List.Item
        title={timeline.title}
        key={timeline.id}
        onPress={() => openTimeline(timeline.id, timeline.title)}
        description={timeline.description}
        left={props => <List.Icon {...props} icon="folder" />}
      />
    ))
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={[styles.container, { backgroundColor: background }]}>
        {userStore.isLoggedIn() ? (
          <>
            <Text>Your timelines</Text>
            {isLoading
              ? <ActivityIndicator />
              : timelineStore.hasTimelines()
                ? renderList()
                : renderEmptyState()
            }
          </>
        ) : (
          <Text>Logging in...</Text>
        )}
        <Button onPress={() => onOpen()}>Add</Button>
      </View>
      {/* <Modal
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <AddTimelineForm />
        </Modal> */}
    </SafeAreaView>
  )
})

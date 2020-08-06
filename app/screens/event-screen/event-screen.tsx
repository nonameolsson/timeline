import React, { FunctionComponent as Component, useLayoutEffect, useRef, useEffect, useCallback } from "react"
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native"
import { Button, Layout, Text } from '@ui-kitten/components'

import { useStores, Event } from "models"
import { PrimaryStackNavigationProp, PrimaryRouteProp } from "navigation"
import { styles } from './event-screen-styles'
import { Button as HeaderButton, Alert } from "react-native"
import { autorun } from "mobx"
import { useObserver } from 'mobx-react-lite'
import { useEffectWithStore } from 'utils/hooks'

// FIXME: Move to helper utility in navigation
const useTitle = (timelineId: string, eventId: string) => {
  const { timelineStore } = useStores()
  const titleRef = useRef('')
  const navigation = useNavigation()

  useEffect(() => {
    const dispose = autorun(() => {
      const timeline = timelineStore.getTimeline(timelineId)

      // If something happens in MST and the timeline has been removed, navigate back to avoid a crash.
      // FIXME: This doesn't feel as the correct way to avoid a crash.
      if (!timeline) {
        navigation.goBack()
        return
      }

      const event = timeline.getEvent(eventId)

      if (event) titleRef.current = event.title
    })

    return dispose
  }, [eventId, navigation, timelineId, timelineStore])
  useFocusEffect(() => { navigation.setOptions({ title: titleRef.current }) })
}

const useHeaderRight = (timelineId, eventId) => {
  const { timelineStore } = useStores()
  const navigation = useNavigation()
  const timeline = timelineStore.getTimeline(timelineId)
  const event = timelineStore.getEventFromTimeline(timelineId, eventId)

  useLayoutEffect(() => {
    if (!timeline || !event) {
      navigation.goBack()
      return
    }

    const id = timeline.id

    navigation.setOptions({
      headerRight: () => (
        <HeaderButton title="Edit" onPress={() => navigation.navigate("editEvent", { eventId: event.id, timelineId: id })} />
      ),
    })
  }, [event, navigation, timeline])
}

export const EventScreen: Component = () => {
  // Pull in one of our MST stores
  const { timelineStore } = useStores()

  // Pull in navigation via hook
  const navigation = useNavigation<PrimaryStackNavigationProp<"event">>()
  const { params } = useRoute<PrimaryRouteProp<"event">>()

  // Get current timeline and event
  const timeline = timelineStore.getTimeline(params.timelineId)

  const event = timeline?.getEvent(params.eventId) as Event
  // const event = (timelineId: string, eventId: string): Event => {
  //   const timeline = timelineStore.getTimeline(timelineId)

  //   if (!timeline) return

  //   return timeline.getEvent(eventId)
  // }

  const deleteEvent = () => {
    navigation.navigate('timeline', {
      id: timeline?.id as string, // FIXME: Shouldn't be required to pass in timelineId. FIXME: Avoid type cast
      title: event.title,
      action: {
        type: 'DELETE_EVENT',
        meta: {
          id: event.id
        }
      }
    })
  }

  const showDeleteAlert = () => {
    Alert.alert(
      "Delete event",
      "Do you really want to delete it?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel"
        },
        { text: "OK", onPress: () => deleteEvent() }
      ],
      { cancelable: false }
    )
  }

  // TODO: Migrate to useEffectWithStore()
  useTitle(timeline?.id, params?.eventId)

  // TODO: Migrate to useEffectWithStore()
  useHeaderRight(timeline?.id, params.eventId)

  useEffectWithStore(

    () => timelineStore.getTimeline(params.timelineId),
    herp => {
      if (!herp) return

      if (params.action?.type === 'EDIT_EVENT') {
        event.updateEvent(params.action.payload)
      }
    },
    [params, event],
  )

  return useObserver(() => {
    if (!timeline) return null

    return (
      <Layout style={styles.container}>
        <Text>{event.title}</Text>
        <Text>{event.description}</Text>
        <Button onPress={showDeleteAlert}>Delete</Button>
      </Layout>
    )
  })
}

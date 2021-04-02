/* eslint-disable @typescript-eslint/camelcase */
import { destroy, types, flow } from "mobx-state-tree"
import { EventModel, EventModelFromData } from "models/event/event"
import { withEnvironment } from "models/extensions/with-environment"
/**
 * Model description here for TypeScript hints.
 */
export const TimelineModel = types
  .model("Timeline")
  .props({
    id: types.identifierNumber,
    title: types.string,
    description: types.maybeNull(types.string),
    events: types.array(EventModel),
    created_at: types.string,
    updated_at: types.string,
  })
  .extend(withEnvironment)
  .views((self) => ({
    /**
     * Get a specific event from a timeline
     */
    getEvent: (id) => {
      return self.events.find((event) => event.id === id)
      // if (!event) throw new Error('No event found. Fix this error.')
    },
    /**
     * Get all events from a timeline
     */
    getEvents: () => {
      return self.events
    },
  }))
  /**
   * Following actions will be called with data received from the API and modify the store.
   */
  .actions((self) => ({
    updateTimelineInStore: (timelineSnapshot) => {
      // eslint-disable-next-line
      const { created_at, description, title, updated_at } = timelineSnapshot
      // eslint-disable-next-line
      self.created_at = created_at
      // eslint-disable-next-line
      self.updated_at = updated_at
      self.title = title
      self.description = description
    },
    addNewEventToTimeline: (event) => {
      const eventToCreate = EventModelFromData(event)
      self.events.push(eventToCreate)
    },
    deleteEventFromStore: (id) => {
      const eventToDelete = self.getEvent(id)
      if (eventToDelete) {
        destroy(eventToDelete)
      }
    },
  }))
  /**
   * Following actions will send requests to the API, and call actions defined in the first action definition
   */
  .actions((self) => ({
    createEvent: flow(function* (event) {
      const result = yield self.environment.api.createEvent(event)
      if (result.kind === "ok") {
        self.addNewEventToTimeline(result.data)
      } else {
        __DEV__ && console.tron.log(result.kind)
      }
    }),
    editTimeline: flow(function* (
      /** Data for updated timeline */
      data,
      /** ID of timeline to update */
      id,
    ) {
      const result = yield self.environment.api.updateTimeline(data, id)
      if (result.kind === "ok") {
        self.updateTimelineInStore(result.data)
      } else {
        __DEV__ && console.tron.log(result.kind)
      }
    }),
    deleteEvent: flow(function* (id) {
      const result = yield self.environment.api.deleteEvent(id)
      if (result.kind === "ok") {
        self.deleteEventFromStore(result.data.id)
      } else {
        __DEV__ && console.tron.log(result.kind)
      }
    }),
    deleteAllEvents: flow(function* () {
      const eventsToDelete = []
      yield Promise.all(
        self.events.map(async (event) => {
          const result = await self.environment.api.deleteEvent(event.id)
          if (result.kind === "ok") {
            eventsToDelete.push(event.id)
          } else {
            __DEV__ && console.tron.log(result.kind)
          }
        }),
      )
      eventsToDelete.forEach((id) => {
        self.deleteEventFromStore(id)
      })
    }),
  }))
//# sourceMappingURL=timeline.js.map

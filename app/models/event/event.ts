/* eslint-disable camelcase */
import { flow, Instance, SnapshotOut, types } from "mobx-state-tree"

import { withEnvironment } from "models/extensions/with-environment"
import * as Types from "services/api/api.types"

/**
 * Model description here for TypeScript hints.
 */
export const EventModel = types
  .model("Event")
  .props({
    id: types.identifierNumber,
    title: types.string,
    description: types.string,
    timeline: types.maybeNull(types.number),
    url: types.maybeNull(types.string),
    created_at: types.string,
    updated_at: types.string,
    startDate: types.string,
    startBC: types.boolean,
    endDate: types.maybeNull(types.string),
    endBC: types.maybeNull(types.boolean),
  })
  .extend(withEnvironment)
  .views((self) => ({
    get readableStartDateString(): string {
      return self.startBC ? `BCE ${self.startDate}` : self.startDate
    },
    get readableEndDateString(): string | null {
      if (!self.endDate) return null
      return self.endBC ? `BCE ${self.endDate}` : self.endDate
    },
    get readableStartToEndDateString(): string {
      let readableString = this.readableStartDateString

      if (this.readableEndDateString) {
        readableString = `${readableString} - ${this.readableEndDateString}`
      }

      return readableString
    },
  })) // eslint-disable-line @typescript-eslint/no-unused-vars
  // Following actions will send requests to the API, and call actions defined in the first action definition
  .actions((self) => {
    const updateEventInStore = (eventSnapshot: Types.EventResponse) => {
      const {
        title,
        description,
        startDate,
        startBC,
        endDate,
        endBC,
        created_at,
        url,
        timeline,
        updated_at,
      } = eventSnapshot
      self.title = title
      self.description = description
      self.url = url
      self.timeline = timeline ? timeline.id : null
      self.updated_at = updated_at
      self.created_at = created_at
      self.startDate = startDate
      self.startBC = startBC
      self.endDate = endDate
      self.endBC = endBC
    }

    const updateEvent = flow(function* (data: Types.EventRequest, id: number) {
      const result: Types.PutEventResult = yield self.environment.api.updateEvent(data, id)

      if (result.kind === "ok") {
        updateEventInStore(result.data)
      } else {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        __DEV__ && console.tron.log(result.kind)
      }
    })

    return {
      updateEvent,
    }
  })

/**
  * Un-comment the following to omit model attributes from your snapshots (and from async storage).
  * Useful for sensitive data like passwords, or transitive state like whether a modal is open.

  * Note that you'll need to import `omit` from ramda, which is already included in the project!
  *  .postProcessSnapshot(omit(["password", "socialSecurityNumber", "creditCardNumber"]))
  */

type EventType = Instance<typeof EventModel>
export interface Event extends EventType {}
type EventSnapshotType = SnapshotOut<typeof EventModel>
export interface EventSnapshot extends EventSnapshotType {}
export const createEventDefaultModel = () => types.optional(EventModel, {}) // TODO: Använd den här

export const EventModelFromData = (event: Types.EventResponse | Types.EventResponse): EventType => {
  return EventModel.create({
    id: event.id,
    title: event.title,
    description: event.description,
    url: event.url,
    timeline: event.timeline ? event.timeline.id : null,
    created_at: event.created_at,
    updated_at: event.updated_at,
    startDate: event.startDate,
    startBC: event.startBC,
    endDate: event.endDate,
    endBC: event.endBC,
  })
}

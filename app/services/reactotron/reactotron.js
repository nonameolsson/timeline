import Tron from "reactotron-react-native"
import AsyncStorage from "@react-native-community/async-storage"
import { onSnapshot } from "mobx-state-tree"
import { DEFAULT_REACTOTRON_CONFIG } from "./reactotron-config"
import { mst } from "reactotron-mst"
import { clear } from "../../utils/storage"
import { RootNavigation } from "../../navigation"
/** Do Nothing. */
const noop = () => undefined
// in dev, we attach Reactotron, in prod we attach a interface-compatible mock.
if (__DEV__) {
  console.tron = Tron // attach reactotron to `console.tron`
} else {
  // attach a mock so if things sneaky by our __DEV__ guards, we won't crash.
  console.tron = {
    benchmark: noop,
    clear: noop,
    close: noop,
    configure: noop,
    connect: noop,
    display: noop,
    error: noop,
    image: noop,
    log: noop,
    logImportant: noop,
    onCustomCommand: noop,
    overlay: noop,
    reportError: noop,
    send: noop,
    startTimer: noop,
    storybookSwitcher: noop,
    use: noop,
    useReactNative: noop,
    warn: noop,
  }
}
/**
 * You'll probably never use the service like this since we hang the Reactotron
 * instance off of `console.tron`. This is only to be consistent with the other
 * services.
 */
export class Reactotron {
  /**
   * Create the Reactotron service.
   *
   * @param config the configuration
   */
  constructor(config = DEFAULT_REACTOTRON_CONFIG) {
    // merge the passed in config with some defaults
    this.config = {
      host: "localhost",
      useAsyncStorage: true,
      ...config,
      state: {
        initial: false,
        snapshots: false,
        ...(config && config.state),
      },
    }
  }
  /**
   * Hook into the root store for doing awesome state-related things.
   *
   * @param rootStore The root store
   */
  setRootStore(rootStore, initialData) {
    if (__DEV__) {
      rootStore = rootStore // typescript hack
      this.rootStore = rootStore
      const { initial, snapshots } = this.config.state
      const name = "ROOT STORE"
      // logging features
      if (initial) {
        console.tron.display({ name, value: initialData, preview: "Initial State" })
      }
      // log state changes?
      if (snapshots) {
        onSnapshot(rootStore, (snapshot) => {
          console.tron.display({ name, value: snapshot, preview: "New State" })
        })
      }
      // @ts-ignore
      console.tron.trackMstNode(rootStore)
    }
  }
  /**
   * Configure reactotron based on the the config settings passed in, then connect if we need to.
   */
  async setup() {
    // only run this in dev... metro bundler will ignore this block: 🎉
    if (__DEV__) {
      // configure reactotron
      Tron.configure({
        name: this.config.name || require("../../../package.json").name,
        host: this.config.host,
      })
      // hookup middleware
      if (this.config.useAsyncStorage) {
        Tron.setAsyncStorageHandler(AsyncStorage)
      }
      // eslint-disable-next-line react-hooks/rules-of-hooks
      Tron.useReactNative({
        asyncStorage: this.config.useAsyncStorage ? undefined : false,
      })
      // ignore some chatty `mobx-state-tree` actions
      const RX = /postProcessSnapshot|@APPLY_SNAPSHOT/
      // hookup mobx-state-tree middleware
      Tron.use(
        mst({
          filter: (event) => RX.test(event.name) === false,
        }),
      )
      // connect to the app
      Tron.connect()
      // Register Custom Commands
      Tron.onCustomCommand({
        title: "Log out",
        command: "logOut",
        handler: () => this.rootStore.userStore.logOut(),
      })
      Tron.onCustomCommand({
        title: "Log in as Kalle",
        command: "logInKalle",
        handler: () => this.rootStore.userStore.login("kalle@timeline.app", "password"),
      })
      Tron.onCustomCommand({
        title: "Log in as Jasmin",
        command: "logInJasmin",
        handler: () => this.rootStore.userStore.login("zetajaz@gmail.com", "Abc123!"),
      })
      Tron.onCustomCommand({
        title: "Delete event",
        description: "Deletes an event ",
        command: "deleteEvent",
        handler: () => {
          console.tron.log("deletingEvent")
          const timeline = this.rootStore.timelineStore.getTimeline(2)
          timeline.deleteEvent(71)
        },
      })
      Tron.onCustomCommand({
        title: "Reset Root Store",
        description: "Resets the MST store",
        command: "resetStore",
        handler: () => {
          console.tron.log("resetting store")
          clear()
        },
      })
      Tron.onCustomCommand({
        title: "Reset Navigation State",
        description: "Resets the navigation state",
        command: "resetNavigation",
        handler: () => {
          console.tron.log("resetting navigation state")
          RootNavigation.resetRoot({ routes: [] })
        },
      })
      Tron.onCustomCommand({
        title: "Go Back",
        description: "Goes back",
        command: "goBack",
        handler: () => {
          console.tron.log("Going back")
          RootNavigation.goBack()
        },
      })
      Tron.onCustomCommand({
        title: "Toggle theme",
        description: "Toggles between light and dark theme",
        command: "toggleTheme",
        handler: () => this.rootStore.uiStore.toggleTheme(),
      })
      // clear if we should
      if (this.config.clearOnLoad) {
        Tron.clear()
      }
    }
  }
}
//# sourceMappingURL=reactotron.js.map

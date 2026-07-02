import { registerRootComponent } from "expo";
import { registerWidgetTaskHandler } from "react-native-android-widget";

import App from "./App";
import { widgetTaskHandler } from "./widget-task-handler";

// Must import so TaskManager.defineTask runs at startup
import "./background-task";

registerRootComponent(App);
registerWidgetTaskHandler(widgetTaskHandler);

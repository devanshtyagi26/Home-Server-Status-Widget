import { registerRootComponent } from 'expo';
import { registerWidgetTaskHandler } from 'react-native-android-widget';

import App from './App';
import { widgetTaskHandler } from './widget-task-handler';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App)
// and ensures the environment is set up correctly for Expo Go or a native build.
registerRootComponent(App);

// Register the widget task handler so Android can call into JS for widget events.
registerWidgetTaskHandler(widgetTaskHandler);

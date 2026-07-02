import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import React from 'react';
import { requestWidgetUpdate } from 'react-native-android-widget';
import { fetchServerData } from './api';
import { HomeServerHealthWidget } from './widgets/HomeServerHealthWidget';

export const BACKGROUND_FETCH_TASK = 'background-status-check';

// Define the task — must be called at module level, outside any component
TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  try {
    const data = await fetchServerData();

    await requestWidgetUpdate({
      widgetName: 'HomeServerHealth',
      renderWidget: () => <HomeServerHealthWidget data={data} />,
      widgetNotFound: () => {},
    });

    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export async function registerBackgroundFetch() {
  const status = await BackgroundFetch.getStatusAsync();

  if (status === BackgroundFetch.BackgroundFetchStatus.Restricted ||
      status === BackgroundFetch.BackgroundFetchStatus.Denied) {
    console.log('Background fetch is disabled');
    return;
  }

  await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
    minimumInterval: 4 * 60,  // 4 minutes — as frequent as Android allows
    stopOnTerminate: false,    // keep running after app is closed
    startOnBoot: true,         // restart after phone reboot
  });
}

export async function unregisterBackgroundFetch() {
  await BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
}
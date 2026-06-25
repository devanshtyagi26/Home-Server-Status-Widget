import React from 'react';
import type { WidgetTaskHandlerProps } from 'react-native-android-widget';
import { HomeServerHealthWidget } from './widgets/HomeServerHealthWidget';
import { fetchServerData } from './api';

const nameToWidget = {
  HomeServerHealth: HomeServerHealthWidget,
} as const;

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  const widgetName = props.widgetInfo.widgetName as keyof typeof nameToWidget;
  const Widget = nameToWidget[widgetName];

  switch (props.widgetAction) {
    case 'WIDGET_ADDED':
    case 'WIDGET_UPDATE': {
      const data = await fetchServerData();
      props.renderWidget(<Widget data={data} />);
      break;
    }
    case 'WIDGET_RESIZED':
      props.renderWidget(<Widget />);
      break;
    case 'WIDGET_DELETED':
    case 'WIDGET_CLICK':
    default:
      break;
  }
}

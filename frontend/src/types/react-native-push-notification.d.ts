declare module 'react-native-push-notification' {
  export interface ChannelObject {
    channelId: string;
    channelName: string;
    channelDescription?: string;
    playSound?: boolean;
    soundName?: string;
    importance?: number;
    vibrate?: boolean;
  }

  export interface PushNotificationObject {
    id?: string;
    channelId?: string;
    title?: string;
    message: string;
    ongoing?: boolean;
    autoCancel?: boolean;
    smallIcon?: string;
    largeIcon?: string;
    color?: string;
    actions?: string[];
    invokeApp?: boolean;
  }

  export enum Importance {
    DEFAULT = 3,
    HIGH = 4,
    LOW = 2,
    MAX = 5,
    MIN = 1,
    NONE = 0,
    UNSPECIFIED = -1000,
  }

  export interface ConfigureOptions {
    onRegister?: (token: { os: string; token: string }) => void;
    onNotification?: (notification: any) => void;
    onAction?: (notification: any) => void;
    onRegistrationError?: (error: any) => void;
    permissions?: {
      alert?: boolean;
      badge?: boolean;
      sound?: boolean;
    };
    popInitialNotification?: boolean;
    requestPermissions?: boolean;
  }

  export default class PushNotification {
    static configure(options: ConfigureOptions): void;
    static createChannel(channel: ChannelObject, callback: (created: boolean) => void): void;
    static localNotification(details: PushNotificationObject): void;
    static cancelLocalNotification(id: string): void;
    static registerNotificationActions(actions: string[]): void;
    static onAction(callback: (notification: any) => void): void;
  }
} 
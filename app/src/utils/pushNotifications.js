import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import { Platform } from 'react-native'
import Constants from 'expo-constants'

export async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C'
    })
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }
    if (finalStatus !== 'granted') {
      handleRegistrationError(
        'Permission not granted to get push token for push notification!'
      )
      return
    }
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId
    if (!projectId) {
      handleRegistrationError('Project ID not found')
    }
    try {
      const pushTokenString = (
        await Notifications.getExpoPushTokenAsync({
          projectId
        })
      ).data
      return pushTokenString
    } catch (e) {
      handleRegistrationError(`${e}`)
    }
  } else {
    handleRegistrationError('Must use physical device for push notifications')
  }
}

function handleRegistrationError(errorMessage) {
  alert(errorMessage)
  throw new Error(errorMessage)
}
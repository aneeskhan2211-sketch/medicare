export const isCameraSupported = () => !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
export const isMicrophoneSupported = () => !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
export const isGeolocationSupported = () => !!navigator.geolocation;
export const isBluetoothSupported = () => !!(navigator as any).bluetooth;

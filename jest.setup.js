// Mock AsyncStorage for Jest
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

try {
  // Silence the warning: Animated: `useNativeDriver` is not supported because the native animated module is missing
  jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
} catch (e) {
  // ignore in environments where the helper path is different
}

// Mock vector icons components used across screens
jest.mock('react-native-vector-icons/Feather', () => {
  const React = require('react');
  return (props: any) => React.createElement('Icon', props, null);
});

jest.mock('react-native-vector-icons/Ionicons', () => {
  const React = require('react');
  return (props: any) => React.createElement('Icon', props, null);
});

jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => {
  const React = require('react');
  return (props: any) => React.createElement('Icon', props, null);
});

// Mock image picker
jest.mock('react-native-image-picker', () => ({
  launchCamera: jest.fn(() => Promise.resolve({ didCancel: true })),
  launchImageLibrary: jest.fn(() => Promise.resolve({ didCancel: true })),
}));

// Mock vision camera
jest.mock('react-native-vision-camera', () => ({
  Camera: () => null,
  useCameraDevice: () => ({
    id: 'back',
    name: 'Back Camera',
    position: 'back',
    devices: [],
  }),
  useCameraPermission: () => ({ hasPermission: true, requestPermission: jest.fn() }),
}));

// Mock modern datepicker
jest.mock('react-native-modern-datepicker', () => ({
  getFormatedDate: (dateString: string) => dateString,
}));

// Mock date picker modal
jest.mock('react-native-date-picker', () => {
  const React = require('react');
  return (props: any) => React.createElement('DatePicker', props, null);
});

// Mock react-native-maps
jest.mock('react-native-maps', () => {
  const React = require('react');
  const MapView = (props: any) => React.createElement('MapView', props, props.children);
  const Marker = (props: any) => React.createElement('Marker', props, props.children);
  const Callout = (props: any) => React.createElement('Callout', props, props.children);
  MapView.Marker = Marker;
  MapView.Callout = Callout;
  return MapView;
});

// Mock raw bottom sheet
jest.mock('react-native-raw-bottom-sheet', () => {
  const React = require('react');
  return React.forwardRef((props: any, ref: any) => React.createElement('RBSheet', { ...props, ref }, props.children));
});

// Mock picker select
jest.mock('react-native-picker-select', () => {
  const React = require('react');
  return (props: any) => React.createElement('PickerSelect', props, props.children);
}); 
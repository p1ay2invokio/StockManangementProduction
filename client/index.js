/**
 * @format
 */
import 'react-native-reanimated'
import {AppRegistry} from 'react-native';
// import App from './App';
import {name as appName} from './app.json';
import Warp from './App';

AppRegistry.registerComponent(appName, () => Warp);

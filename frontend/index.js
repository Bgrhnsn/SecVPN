/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);
// Eski isim için de kayıt yapalım (backward compatibility)
AppRegistry.registerComponent('VpnApp1', () => App);

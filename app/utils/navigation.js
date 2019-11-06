import { analytics, leaveBreadcrumb } from './log';
import { themes } from '../constants/colors';

export const defaultHeader = {
	headerBackTitle: null
};

export const themedHeader = (theme) => {
	return {
		headerStyle: { backgroundColor: themes[theme].headerBackground },
		headerTintColor: themes[theme].headerTintColor,
		headerTitleStyle: { color: themes[theme].headerTitleColor }
	};
};

// gets the current screen from navigation state
export const getActiveRouteName = (navigationState) => {
	if (!navigationState) {
		return null;
	}
	const route = navigationState.routes[navigationState.index];
	// dive into nested navigators
	if (route.routes) {
		return getActiveRouteName(route);
	}
	return route.routeName;
};

export const onNavigationStateChange = (prevState, currentState) => {
	const currentScreen = getActiveRouteName(currentState);
	const prevScreen = getActiveRouteName(prevState);

	if (prevScreen !== currentScreen) {
		analytics().setCurrentScreen(currentScreen);
		leaveBreadcrumb(currentScreen, { type: 'navigation' });
	}
};

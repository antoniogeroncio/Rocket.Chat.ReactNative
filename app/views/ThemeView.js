import React from 'react';
import PropTypes from 'prop-types';
import { FlatList, Text, View } from 'react-native';
import { SafeAreaView } from 'react-navigation';

import I18n from '../i18n';
import { themedHeader } from '../utils/navigation';
import { withTheme } from '../theme';
import { themes } from '../constants/colors';
import sharedStyles from './Styles';
import StatusBar from '../containers/StatusBar';
import Separator from '../containers/Separator';
import ListItem from '../containers/ListItem';
import { CustomIcon } from '../lib/Icons';

const THEMES = [
	{
		label: I18n.t('Light'),
		value: 'light'
	}, {
		label: I18n.t('Dark'),
		value: 'dark'
	}, {
		label: I18n.t('Black'),
		value: 'black'
	}
];

class LanguageView extends React.Component {
	static navigationOptions = ({ screenProps }) => ({
		title: I18n.t('Theme'),
		...themedHeader(screenProps.theme)
	})

	static propTypes = {
		theme: PropTypes.string,
		setTheme: PropTypes.func
	}

	renderSeparator = () => {
		const { theme } = this.props;
		return <Separator theme={theme} />;
	}

	renderIcon = () => {
		const { theme } = this.props;
		return <CustomIcon name='check' size={20} style={{ color: themes[theme].tintColor }} />;
	}

	renderItem = ({ item }) => {
		const { setTheme, theme } = this.props;
		const { label, value } = item;
		const isSelected = theme === value;
		return (
			<ListItem
				title={label}
				onPress={() => setTheme(value)}
				testID={`theme-view-${ value }`}
				right={isSelected ? this.renderIcon : null}
				theme={theme}
			/>
		);
	}

	renderHeader = () => {
		const { theme } = this.props;
		return (
			<View style={{ paddingTop: 20, paddingHorizontal: 16 }}>
				<Text style={{ color: themes[theme].auxiliaryText }}>{I18n.t('ALL_THEMES')}</Text>
			</View>
		);
	}

	render() {
		const { theme } = this.props;
		return (
			<SafeAreaView
				style={[sharedStyles.container, { backgroundColor: themes[theme].focusedBackground }]}
				forceInset={{ vertical: 'never' }}
				testID='language-view'
			>
				<StatusBar />
				{this.renderHeader()}
				<FlatList
					data={THEMES}
					keyExtractor={item => item.value}
					contentContainerStyle={[
						sharedStyles.listContentContainer,
						{
							backgroundColor: themes[theme].focusedBackground,
							borderColor: themes[theme].borderColor
						}
					]}
					renderItem={this.renderItem}
					ItemSeparatorComponent={this.renderSeparator}
				/>
			</SafeAreaView>
		);
	}
}

export default withTheme(LanguageView);

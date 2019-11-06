import React from 'react';
import {
	View, Linking, ScrollView, AsyncStorage, SafeAreaView, Switch, Text, Share
} from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { toggleMarkdown as toggleMarkdownAction } from '../../actions/markdown';
import { toggleCrashReport as toggleCrashReportAction } from '../../actions/crashReport';
import { SWITCH_TRACK_COLOR, themes } from '../../constants/colors';
import { DrawerButton } from '../../containers/HeaderButton';
import StatusBar from '../../containers/StatusBar';
import ListItem from '../../containers/ListItem';
import { DisclosureImage } from '../../containers/DisclosureIndicator';
import Separator from '../../containers/Separator';
import I18n from '../../i18n';
import { MARKDOWN_KEY, CRASH_REPORT_KEY } from '../../lib/rocketchat';
import { getReadableVersion, getDeviceModel, isAndroid } from '../../utils/deviceInfo';
import openLink from '../../utils/openLink';
import scrollPersistTaps from '../../utils/scrollPersistTaps';
import { showErrorAlert } from '../../utils/info';
import styles from './styles';
import sharedStyles from '../Styles';
import { loggerConfig, analytics } from '../../utils/log';
import { PLAY_MARKET_LINK, APP_STORE_LINK, LICENSE_LINK } from '../../constants/links';
import { withTheme } from '../../theme';
import { themedHeader } from '../../utils/navigation';

const SectionSeparator = React.memo(({ theme }) => <View style={[styles.sectionSeparatorBorder, { borderColor: themes[theme].borderColor, backgroundColor: themes[theme].focusedBackground }]} />);
SectionSeparator.propTypes = {
	theme: PropTypes.string
};
const ItemInfo = React.memo(({ info, theme }) => (
	<View style={[styles.infoContainer, { backgroundColor: themes[theme].focusedBackground }]}>
		<Text style={[styles.infoText, { color: themes[theme].titleText }]}>{info}</Text>
	</View>
));
ItemInfo.propTypes = {
	info: PropTypes.string,
	theme: PropTypes.string
};

class SettingsView extends React.Component {
	static navigationOptions = ({ navigation, screenProps }) => ({
		...themedHeader(screenProps.theme),
		headerLeft: <DrawerButton navigation={navigation} />,
		title: I18n.t('Settings')
	});

	static propTypes = {
		navigation: PropTypes.object,
		server:	PropTypes.object,
		useMarkdown: PropTypes.bool,
		allowCrashReport: PropTypes.bool,
		toggleMarkdown: PropTypes.func,
		toggleCrashReport: PropTypes.func,
		theme: PropTypes.string
	}

	toggleMarkdown = (value) => {
		AsyncStorage.setItem(MARKDOWN_KEY, JSON.stringify(value));
		const { toggleMarkdown } = this.props;
		toggleMarkdown(value);
	}

	toggleCrashReport = (value) => {
		AsyncStorage.setItem(CRASH_REPORT_KEY, JSON.stringify(value));
		const { toggleCrashReport } = this.props;
		toggleCrashReport(value);
		loggerConfig.autoNotify = value;
		analytics().setAnalyticsCollectionEnabled(value);

		if (value) {
			loggerConfig.clearBeforeSendCallbacks();
		} else {
			loggerConfig.registerBeforeSendCallback(() => false);
		}
	}

	navigateToRoom = (room) => {
		const { navigation } = this.props;
		navigation.navigate(room);
	}

	sendEmail = async() => {
		const subject = encodeURI('React Native App Support');
		const email = encodeURI('support@rocket.chat');
		const description = encodeURI(`
			version: ${ getReadableVersion }
			device: ${ getDeviceModel }
		`);
		try {
			await Linking.openURL(`mailto:${ email }?subject=${ subject }&body=${ description }`);
		} catch (e) {
			showErrorAlert(I18n.t('error-email-send-failed', { message: 'support@rocket.chat' }));
		}
	}

	shareApp = () => {
		Share.share({ message: isAndroid ? PLAY_MARKET_LINK : APP_STORE_LINK });
	}

	onPressLicense = () => openLink(LICENSE_LINK)

	renderDisclosure = () => <DisclosureImage />

	renderMarkdownSwitch = () => {
		const { useMarkdown } = this.props;
		return (
			<Switch
				value={useMarkdown}
				trackColor={SWITCH_TRACK_COLOR}
				onValueChange={this.toggleMarkdown}
			/>
		);
	}

	renderCrashReportSwitch = () => {
		const { allowCrashReport } = this.props;
		return (
			<Switch
				value={allowCrashReport}
				trackColor={SWITCH_TRACK_COLOR}
				onValueChange={this.toggleCrashReport}
			/>
		);
	}

	render() {
		const { server, theme } = this.props;
		return (
			<SafeAreaView style={[sharedStyles.listSafeArea, { backgroundColor: themes[theme].focusedBackground }]} testID='settings-view'>
				<StatusBar />
				<ScrollView
					{...scrollPersistTaps}
					contentContainerStyle={[sharedStyles.listContentContainer, styles.listWithoutBorderBottom, { backgroundColor: themes[theme].focusedBackground, borderColor: themes[theme].borderColor }]}
					showsVerticalScrollIndicator={false}
					testID='settings-view-list'
				>
					<ListItem
						title={I18n.t('Contact_us')}
						onPress={this.sendEmail}
						showActionIndicator
						testID='settings-view-contact'
						right={this.renderDisclosure}
						theme={theme}
					/>
					<Separator theme={theme} />
					<ListItem
						title={I18n.t('Language')}
						onPress={() => this.navigateToRoom('LanguageView')}
						showActionIndicator
						testID='settings-view-language'
						right={this.renderDisclosure}
						theme={theme}
					/>
					<Separator theme={theme} />
					<ListItem
						title={I18n.t('Share_this_app')}
						showActionIndicator
						onPress={this.shareApp}
						testID='settings-view-share-app'
						right={this.renderDisclosure}
						theme={theme}
					/>
					<Separator theme={theme} />
					<ListItem
						title={I18n.t('Theme')}
						showActionIndicator
						disabled
						testID='settings-view-theme'
						theme={theme}
					/>
					<Separator theme={theme} />

					<SectionSeparator theme={theme} />

					<ListItem
						title={I18n.t('License')}
						onPress={this.onPressLicense}
						showActionIndicator
						testID='settings-view-license'
						right={this.renderDisclosure}
						theme={theme}
					/>
					<Separator theme={theme} />
					<ListItem title={I18n.t('Version_no', { version: getReadableVersion })} testID='settings-view-version' theme={theme} />
					<Separator theme={theme} />
					<ListItem
						title={I18n.t('Server_version', { version: server.version })}
						subtitle={`${ server.server.split('//')[1] }`}
						testID='settings-view-server-version'
						theme={theme}
					/>

					<SectionSeparator theme={theme} />

					<ListItem
						title={I18n.t('Enable_markdown')}
						testID='settings-view-markdown'
						right={() => this.renderMarkdownSwitch()}
						theme={theme}
					/>

					<SectionSeparator theme={theme} />

					<ListItem
						title={I18n.t('Send_crash_report')}
						testID='settings-view-crash-report'
						right={() => this.renderCrashReportSwitch()}
						theme={theme}
					/>
					<Separator theme={theme} />
					<ItemInfo
						info={I18n.t('Crash_report_disclaimer')}
						theme={theme}
					/>
				</ScrollView>
			</SafeAreaView>
		);
	}
}

const mapStateToProps = state => ({
	server: state.server,
	useMarkdown: state.markdown.useMarkdown,
	allowCrashReport: state.crashReport.allowCrashReport
});

const mapDispatchToProps = dispatch => ({
	toggleMarkdown: params => dispatch(toggleMarkdownAction(params)),
	toggleCrashReport: params => dispatch(toggleCrashReportAction(params))
});

export default connect(mapStateToProps, mapDispatchToProps)(withTheme(SettingsView));

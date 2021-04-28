import React, { useEffect, useCallback } from 'react';
import { Tabs } from '@rocket.chat/fuselage';

import { UserInfoWithData } from '../admin/users/UserInfo';
import Page from '../../components/Page';
import VerticalBar from '../../components/VerticalBar';
import { useTranslation } from '../../contexts/TranslationContext';
import UserTab from './UserTab';
import ChannelsTab from './ChannelsTab';
import ProfileLibraryTab from './ProfileLibraryTab';
import { useRoute, useRouteParameter } from '../../contexts/RouterContext';
import { useSetting } from '../../contexts/SettingsContext';

function DirectoryPage() {
	const t = useTranslation();

	const defaultTab = useSetting('Accounts_Directory_DefaultView');

	const federationEnabled = useSetting('FEDERATION_Enabled');
	const context = useRouteParameter('context');
	const id = useRouteParameter('id');
	const tab = useRouteParameter('tab');
	const directoryRoute = useRoute('directory');
	const handleTabClick = useCallback((tab) => () => directoryRoute.push({ tab }), [directoryRoute]);

	console.log('context', context)
	console.log('id', id)

	useEffect(() => {
		if (!tab || (tab === 'external' && !federationEnabled)) {
			return directoryRoute.replace({ tab: defaultTab });
		}
	}, [directoryRoute, tab, federationEnabled, defaultTab]);

	const handleVerticalBarCloseButtonClick = () => {
		directoryRoute.push({});
	};

	return <Page flexDirection='row'>
		<Page>
		<Page.Header title={t('Directory')} />
		<Tabs flexShrink={0} >
			<Tabs.Item selected={tab === 'channels'} onClick={handleTabClick('channels')}>{t('Channels')}</Tabs.Item>
			<Tabs.Item selected={tab === 'users'} onClick={handleTabClick('users')}>{t('Users')}</Tabs.Item>
			<Tabs.Item selected={tab === 'profileLibrary'} onClick={handleTabClick('profileLibrary')}>{t('Profile Library')}</Tabs.Item>
			{ federationEnabled && <Tabs.Item selected={tab === 'external'} onClick={handleTabClick('external')}>{t('External_Users')}</Tabs.Item> }
		</Tabs>
		<Page.Content>
			{
				(tab === 'users' && <UserTab />)
			|| (tab === 'channels' && <ChannelsTab />)
			|| (tab === 'profileLibrary' && <ProfileLibraryTab />)
			|| (federationEnabled && tab === 'external' && <UserTab workspace='external' />)
			}

		</Page.Content>
	</Page>
	{context && <VerticalBar>
		<VerticalBar.Header>
			{context === 'info' && t('User_Info')}
			<VerticalBar.Close onClick={handleVerticalBarCloseButtonClick} />
		</VerticalBar.Header>
		{context === 'info' && <UserInfoWithData uid={id}/>}
	</VerticalBar>};
	</Page>
}


DirectoryPage.displayName = 'DirectoryPage';

export default DirectoryPage;

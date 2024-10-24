import React, { memo, useCallback, useEffect } from 'react';
import { useSubscription } from 'use-subscription';

import { itemsSubscription } from './sidebarItems';
import { menu, SideNav, Layout } from '../../../app/ui-utils/client';
import Sidebar from '../../components/Sidebar';
import { useRoutePath, useCurrentRoute } from '../../contexts/RouterContext';
import { useTranslation } from '../../contexts/TranslationContext';
import SettingsProvider from '../../providers/SettingsProvider';

const AccountSidebar = () => {
	const t = useTranslation();

	const items = useSubscription(itemsSubscription);

	const closeFlex = useCallback(() => {
		if (Layout.isEmbedded()) {
			menu.close();
			return;
		}

		SideNav.closeFlex();
	}, []);

	const [currentRouteName, ...rest] = useCurrentRoute();
	const currentPath = useRoutePath(currentRouteName, ...rest);

	useEffect(() => {
		if (currentRouteName !== 'account') {
			SideNav.closeFlex();
		}
	}, [currentRouteName]);

	// TODO: uplift this provider
	return (
		<SettingsProvider privileged>
			<Sidebar>
				<Sidebar.Header onClose={closeFlex} title={t('Account')} />
				<Sidebar.Content>
					<Sidebar.ItemsAssembler items={items} currentPath={currentPath} />
				</Sidebar.Content>
			</Sidebar>
		</SettingsProvider>
	);
};

export default memo(AccountSidebar);

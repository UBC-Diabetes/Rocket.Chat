import { Button, ButtonGroup, Icon } from '@rocket.chat/fuselage';
import React, { useCallback } from 'react';

import EditIncomingWebhookWithData from './EditIncomingWebhookWithData';
import EditOutgoingWebhookWithData from './EditOutgoingWebhookWithData';
import Page from '../../../../components/Page';
import { useRouteParameter, useRoute } from '../../../../contexts/RouterContext';
import { useTranslation } from '../../../../contexts/TranslationContext';

function EditIntegrationsPage({ ...props }) {
	const t = useTranslation();

	const router = useRoute('admin-integrations');

	const type = useRouteParameter('type');
	const integrationId = useRouteParameter('id');

	const handleClickReturn = useCallback(() => {
		router.push({});
	}, [router]);

	const handleClickHistory = useCallback(() => {
		router.push({ context: 'history', type: 'outgoing', id: integrationId });
	}, [integrationId, router]);

	return (
		<Page flexDirection='column' {...props}>
			<Page.Header
				title={
					type === 'incoming'
						? t('Integration_Incoming_WebHook')
						: t('Integration_Outgoing_WebHook')
				}
			>
				<ButtonGroup>
					<Button onClick={handleClickReturn}>
						<Icon name='back' size='x16' /> {t('Back')}
					</Button>
					{type === 'outgoing' && <Button onClick={handleClickHistory}>{t('History')}</Button>}
				</ButtonGroup>
			</Page.Header>
			{(type === 'outgoing' && (
				<EditOutgoingWebhookWithData integrationId={integrationId} key='outgoing' />
			)) ||
				(type === 'incoming' && (
					<EditIncomingWebhookWithData integrationId={integrationId} key='incoming' />
				))}
		</Page>
	);
}

export default EditIntegrationsPage;

import { useCallback } from 'react';

import { useEndpointAction } from './useEndpointAction';
import { useTranslation } from '../contexts/TranslationContext';
import { useToastMessageDispatch } from '../contexts/ToastMessagesContext';

export const useUpdateCustomFields = (customFields) => {
	const t = useTranslation();
	const successText = t('Custom fields saved successfully');
	useToastMessageDispatch();

	const saveCustomFieldUrlAction = useEndpointAction('POST', 'users.updateOwnBasicInfo', {
		data: {},
		customFields,
	}, successText);

	return useCallback(async () => saveCustomFieldUrlAction(), [saveCustomFieldUrlAction]);
};

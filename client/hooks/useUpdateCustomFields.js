import { useCallback } from 'react';

import { useEndpointAction } from './useEndpointAction';
import { useTranslation } from '../contexts/TranslationContext';

export const useUpdateCustomFields = (customFields) => {
	const t = useTranslation();
	const successText = t('Custom fields saved successfully');

	const saveCustomFieldUrlAction = useEndpointAction(
		'POST',
		'users.updateOwnBasicInfo',
		{
			data: {},
			customFields,
		},
		successText,
	);

	const updateCustomFields = useCallback(
		async () => saveCustomFieldUrlAction(),
		[saveCustomFieldUrlAction],
	);

	return updateCustomFields;
};

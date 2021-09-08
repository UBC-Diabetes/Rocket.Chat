import { useCallback } from 'react';

import { useTranslation } from '../contexts/TranslationContext';
import { useEndpointAction } from './useEndpointAction';

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

import { useMemo, useCallback } from 'react';

import { useMethod } from '../contexts/ServerContext';
import { useEndpointAction } from './useEndpointAction';
import { useTranslation } from '../contexts/TranslationContext';
import { useToastMessageDispatch } from '../contexts/ToastMessagesContext';

export const useUpdateCustomFields = (customFields) => {

	const t = useTranslation();
	const successText = t('Custom fields saved successfully');
	const dispatchToastMessage = useToastMessageDispatch();

	const saveCustomFieldUrlAction = useEndpointAction('POST', 'users.updateOwnBasicInfo', { 
		data: {}, 
		customFields: customFields
	}, successText);

	const updateCustomFields = useCallback(async () => {
		return saveCustomFieldUrlAction();
	}, [customFields, dispatchToastMessage, saveCustomFieldUrlAction, successText]);

	return updateCustomFields;
};
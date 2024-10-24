import { Box } from '@rocket.chat/fuselage';
import React from 'react';

import CustomFieldsForm from './CustomFieldsForm';
import { useForm } from '../../../hooks/useForm';

export default {
	title: 'omnichannel/customFields/NewCustomFieldsForm',
	component: CustomFieldsForm,
};

export const Default = () => {
	const { values, handlers } = useForm({
		field: '',
		label: '',
		scope: 'visitor',
		visibility: true,
		regexp: '',
	});

	return (
		<Box maxWidth='x600' alignSelf='center' w='full' m='x24'>
			<CustomFieldsForm values={values} handlers={handlers} />
		</Box>
	);
};

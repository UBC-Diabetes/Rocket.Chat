import { Box } from '@rocket.chat/fuselage';
import React from 'react';

import AutoTranslate from './AutoTranslate';
import VerticalBar from '../../../../components/VerticalBar';

export default {
	title: 'room/contextualBar/AutoTranslate',
	component: AutoTranslate,
};

const languages = [
	['en', 'English'],
	['jp', 'Japanese'],
	['pt', 'Portuguese'],
];

export const Default = () => (
	<Box height='600px'>
		<VerticalBar>
			<AutoTranslate languages={languages} defaultLanguage='en' />
		</VerticalBar>
	</Box>
);

import { Box } from '@rocket.chat/fuselage';
import React, { FC } from 'react';

import { DNSRecord } from './Types';
import { SectionStatus } from '../Section';
import getStatusIcon from '../SectionStatusIcon';

export const DNSRecordItem: FC<{
	record: DNSRecord;
}> = ({ record: { status, title, expectedValue, value, hideErrorString } }) => (
	<Box display='flex' alignItems='flex-start'>
		{getStatusIcon(status)}
		<Box flexDirection='column' fontSize='x12'>
			<b>{title}</b>: {expectedValue}{' '}
			{!hideErrorString && status === SectionStatus.FAILED ? `(${value || '?'})` : ''}
		</Box>
	</Box>
);

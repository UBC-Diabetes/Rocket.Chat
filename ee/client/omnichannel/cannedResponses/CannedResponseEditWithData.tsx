import { Callout } from '@rocket.chat/fuselage';
import React, { FC } from 'react';

import CannedResponseEdit from './CannedResponseEdit';
import CannedResponseEditWithDepartmentData from './CannedResponseEditWithDepartmentData';
import { FormSkeleton } from '../../../../client/components/Skeleton';
import { useTranslation } from '../../../../client/contexts/TranslationContext';
import { AsyncStatePhase } from '../../../../client/hooks/useAsyncState';
import { useEndpointData } from '../../../../client/hooks/useEndpointData';

const CannedResponseEditWithData: FC<{
	cannedResponseId: string;
	reload: () => void;
	totalDataReload: () => void;
}> = ({ cannedResponseId, reload, totalDataReload }) => {
	const {
		value: data,
		phase: state,
		error,
	} = useEndpointData(`canned-responses/${cannedResponseId}` as 'canned-responses/${string}');

	const t = useTranslation();

	if (state === AsyncStatePhase.LOADING) {
		return <FormSkeleton />;
	}

	if (error) {
		return (
			<Callout m='x16' type='danger'>
				{t('Not_Available')}
			</Callout>
		);
	}

	if (data?.cannedResponse?.scope === 'department') {
		return (
			<CannedResponseEditWithDepartmentData
				data={data}
				reload={reload}
				totalDataReload={totalDataReload}
			/>
		);
	}

	return <CannedResponseEdit data={data} reload={reload} totalDataReload={totalDataReload} />;
};

export default CannedResponseEditWithData;

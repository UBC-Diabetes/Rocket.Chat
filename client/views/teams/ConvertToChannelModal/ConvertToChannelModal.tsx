import { Skeleton } from '@rocket.chat/fuselage';
import React, { FC, useMemo } from 'react';

import BaseConvertToChannelModal from './BaseConvertToChannelModal';
import { IRoom } from '../../../../definition/IRoom';
import GenericModal from '../../../components/GenericModal';
import { useTranslation } from '../../../contexts/TranslationContext';
import { useEndpointData } from '../../../hooks/useEndpointData';
import { AsyncStatePhase } from '../../../lib/asyncState';

type ConvertToChannelModalProps = {
	onClose: () => void;
	onCancel: () => void;
	onConfirm: () => Array<IRoom>;
	teamId: string;
	userId: string;
};

const ConvertToChannelModal: FC<ConvertToChannelModalProps> = ({
	onClose,
	onCancel,
	onConfirm,
	teamId,
	userId,
}) => {
	const t = useTranslation();

	const { value, phase } = useEndpointData(
		'teams.listRoomsOfUser',
		useMemo(() => ({ teamId, userId, canUserDelete: true }), [teamId, userId]),
	);

	if (phase === AsyncStatePhase.LOADING) {
		return (
			<GenericModal
				variant='warning'
				onClose={onClose}
				title={<Skeleton width='50%' />}
				confirmText={t('Cancel')}
				onConfirm={onClose}
			>
				<Skeleton width='full' />
			</GenericModal>
		);
	}

	return (
		<BaseConvertToChannelModal
			onClose={onClose}
			onCancel={onCancel}
			onConfirm={onConfirm}
			rooms={value?.rooms}
		/>
	);
};

export default ConvertToChannelModal;

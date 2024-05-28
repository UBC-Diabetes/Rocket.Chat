import React, { FC, memo, MouseEvent, MouseEventHandler } from 'react';

import CannedResponse from './CannedResponse';
import { usePermission } from '../../../../../../client/contexts/AuthorizationContext';
import { useSetModal } from '../../../../../../client/contexts/ModalContext';
import CreateCannedResponse from '../../CannedResponse/modals';

const WrapCannedResponse: FC<{
	cannedItem: any;
	onClickBack: MouseEventHandler<HTMLOrSVGElement>;
	onClickUse: (e: MouseEvent<HTMLOrSVGElement>, text: string) => void;
	reload: () => void;
}> = ({
	cannedItem: { _id, departmentName, departmentId, shortcut, tags, scope, text },
	onClickBack,
	onClickUse,
	reload,
}) => {
	const setModal = useSetModal();
	const onClickEdit = (): void => {
		setModal(
			<CreateCannedResponse
				data={{ _id, departmentId, shortcut, tags, scope, text }}
				reloadCannedList={reload}
			/>,
		);
	};

	const hasManagerPermission = usePermission('view-all-canned-responses');
	const hasMonitorPermission = usePermission('save-department-canned-responses');

	const canEdit =
		hasManagerPermission || (hasMonitorPermission && scope !== 'global') || scope === 'user';

	return (
		<CannedResponse
			canEdit={canEdit}
			data={{
				departmentName,
				shortcut,
				tags,
				scope,
				text,
			}}
			onClickBack={onClickBack}
			onClickEdit={onClickEdit}
			onClickUse={(e): void => {
				onClickUse(e, text);
			}}
		/>
	);
};

export default memo(WrapCannedResponse);

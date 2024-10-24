import { useDebouncedValue } from '@rocket.chat/fuselage-hooks';
import React, { useState, useMemo } from 'react';

import UsersInRoleTable from './UsersInRoleTable';
import { useEndpointData } from '../../../hooks/useEndpointData';

const UsersInRoleTableContainer = ({ rid, roleName, reloadRef }) => {
	const [params, setParams] = useState({ current: 0, itemsPerPage: 25 });

	const debouncedParams = useDebouncedValue(params, 500);

	const query = useMemo(
		() => ({
			roomId: rid,
			role: roleName,
			...(debouncedParams.itemsPerPage && { count: debouncedParams.itemsPerPage }),
			...(debouncedParams.current && { offset: debouncedParams.current }),
		}),
		[debouncedParams, rid, roleName],
	);

	const { value: data = {}, reload } = useEndpointData('roles.getUsersInRole', query);

	reloadRef.current = reload;

	const tableData = data?.users || [];

	return (
		<UsersInRoleTable
			data={tableData}
			total={data?.total}
			reload={reload}
			params={params}
			setParams={setParams}
			roleName={roleName}
			rid={rid}
		/>
	);
};

export default UsersInRoleTableContainer;

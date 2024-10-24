import React, { Suspense, useEffect } from 'react';

import AdministrationLayout from './AdministrationLayout';
import PageSkeleton from '../../components/PageSkeleton';
import { useCurrentRoute, useRoute } from '../../contexts/RouterContext';
import SettingsProvider from '../../providers/SettingsProvider';

function AdministrationRouter({ renderRoute }) {
	const [routeName] = useCurrentRoute();
	const defaultRoute = useRoute('admin-info');
	useEffect(() => {
		if (routeName === 'admin-index') {
			defaultRoute.push();
		}
	}, [defaultRoute, routeName]);

	return (
		<AdministrationLayout>
			<SettingsProvider privileged>
				{renderRoute ? (
					<Suspense fallback={<PageSkeleton />}>{renderRoute()}</Suspense>
				) : (
					<PageSkeleton />
				)}
			</SettingsProvider>
		</AdministrationLayout>
	);
}

export default AdministrationRouter;

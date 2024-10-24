import { Session } from 'meteor/session';
import React, { FC } from 'react';

import { createReactiveSubscriptionFactory } from './createReactiveSubscriptionFactory';
import { SessionContext } from '../contexts/SessionContext';

const contextValue = {
	query: createReactiveSubscriptionFactory<unknown>((name) => Session.get(name)),
	dispatch: (name: string, value: unknown): void => {
		Session.set(name, value);
	},
};

const SessionProvider: FC = ({ children }) => (
	<SessionContext.Provider children={children} value={contextValue} />
);

export default SessionProvider;

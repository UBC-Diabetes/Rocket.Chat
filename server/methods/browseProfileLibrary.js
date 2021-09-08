import { Meteor } from 'meteor/meteor';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';

import { hasPermission } from '../../app/authorization';
import { Users } from '../../app/models';
import { getFederationDomain } from '../../app/federation/server/lib/getFederationDomain';
import { isFederationEnabled } from '../../app/federation/server/lib/isFederationEnabled';
import { federationSearchUsers } from '../../app/federation/server/handler';

const sortUsers = function(field, direction) {
	switch (field) {
		case 'email':
			return {
				'emails.address': direction === 'asc' ? 1 : -1,
				username: direction === 'asc' ? 1 : -1,
			};
		default:
			return {
				[field]: direction === 'asc' ? 1 : -1,
			};
	}
};

Meteor.methods({
	browseProfileLibrary({ text = '', workspace = '', type = 'channels', sortBy = 'name', sortDirection = 'asc', page, offset, limit = 10 }) {
		if (!['channels', 'users'].includes(type)) {
			return;
		}

		if (!['asc', 'desc'].includes(sortDirection)) {
			return;
		}

		if ((!page && page !== 0) && (!offset && offset !== 0)) {
			return;
		}

		if (!['name', 'createdAt', 'usersCount', ...type === 'channels' ? ['usernames', 'lastMessage'] : [], ...type === 'users' ? ['username', 'email', 'bio'] : []].includes(sortBy)) {
			return;
		}

		const skip = Math.max(0, offset || (page > -1 ? limit * page : 0));

		limit = limit > 0 ? limit : 10;

		const pagination = {
			skip,
			limit,
		};


		const user = Meteor.user();

		// non-logged id user
		if (!user) {
			return;
		}

		const forcedSearchFields = workspace === 'all' && ['username', 'name', 'emails.address'];

		const viewFullOtherUserInfo = hasPermission(user._id, 'view-full-other-user-info');

		const options = {
			...pagination,
			sort: sortUsers(sortBy, sortDirection),
			fields: {
				username: 1,
				name: 1,
				nickname: 1,
				bio: 1,
				createdAt: 1,
				...viewFullOtherUserInfo && { emails: 1 },
				federation: 1,
				avatarETag: 1,
				roles: 1,
			},
		};

		let result;
		if (workspace === 'all') {
			result = Users.findByActiveLocalPeersSupporter(text, [], options, forcedSearchFields);
		} else if (workspace === 'external') {
			result = Users.findByActiveLocalPeersSupporter(text, [], options, forcedSearchFields, getFederationDomain());
		} else {
			result = Users.findByActiveLocalPeersSupporter(text, [], options, forcedSearchFields, getFederationDomain());
		}

		const total = result.count(); // count ignores the `skip` and `limit` options
		const results = result.fetch();

		// Try to find federated users, when applicable
		if (isFederationEnabled() && type === 'users' && workspace === 'external' && text.indexOf('@') !== -1) {
			const users = federationSearchUsers(text);

			for (const user of users) {
				if (results.find((e) => e._id === user._id)) { continue; }

				// Add the federated user to the results
				results.unshift({
					username: user.username,
					name: user.name,
					bio: user.bio,
					nickname: user.nickname,
					emails: user.emails,
					federation: user.federation,
					isRemote: true,
				});
			}
		}

		return {
			total,
			results,
		};
	},
});

DDPRateLimiter.addRule({
	type: 'method',
	name: 'browseProfileLibrary',
	userId(/* userId*/) {
		return true;
	},
}, 100, 100000);

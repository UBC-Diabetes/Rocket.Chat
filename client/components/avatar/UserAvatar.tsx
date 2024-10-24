import React, { FC, memo } from 'react';

import BaseAvatar, { BaseAvatarProps } from './BaseAvatar';
import { useUserAvatarPath } from '../../contexts/AvatarUrlContext';

type UserAvatarProps = Omit<BaseAvatarProps, 'url' | 'title'> & {
	username: string;
	etag?: string;
	url?: string;
};

const UserAvatar: FC<UserAvatarProps> = ({ username, etag, ...rest }) => {
	const getUserAvatarPath = useUserAvatarPath();
	const { url = getUserAvatarPath(username, etag), ...props } = rest;

	return <BaseAvatar url={url} title={username} {...props} />;
};

export default memo(UserAvatar);

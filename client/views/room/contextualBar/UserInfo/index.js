import React, { useMemo, useState, useCallback } from 'react';
import { Box, Margins, Tag, Button, Icon } from '@rocket.chat/fuselage';
import { css } from '@rocket.chat/css-in-js';

import { Meteor } from 'meteor/meteor';
import { hasRole } from '../../../../../app/authorization';
import { useTranslation } from '../../../../contexts/TranslationContext';
import { useSetting } from '../../../../contexts/SettingsContext';
import { useRoute } from '../../../../contexts/RouterContext';
import { ReactiveUserStatus } from '../../../../components/UserStatus';
import UserCard from '../../../../components/UserCard';
import VerticalBar from '../../../../components/VerticalBar';
import { useRolesDescription } from '../../../../contexts/AuthorizationContext';
import { useTimeAgo } from '../../../../hooks/useTimeAgo';
import { UTCClock } from '../../../../components/UTCClock';
import UserAvatar from '../../../../components/avatar/UserAvatar';
import MarkdownText from '../../../../components/MarkdownText';
import UserActions from './actions/UserActions';
import { useEndpointData } from '../../../../hooks/useEndpointData';
import { AsyncStatePhase } from '../../../../hooks/useAsyncState';
import { getUserEmailAddress } from '../../../../lib/getUserEmailAddress';
import { FormSkeleton } from '../../../../components/Skeleton';
import { getUserEmailVerified } from '../../../../lib/getUserEmailVerified';
import { useUpdateCustomFields } from './../../../../hooks/useUpdateCustomFields';


const Label = (props) => <Box fontScale='p2' color='default' {...props} />;

const wordBreak = css`
	word-break: break-word;
`;

const Info = ({ className, ...props }) => <UserCard.Info className={[className, wordBreak]} flexShrink={0} {...props}/>;
const Avatar = ({ username, ...props }) => <UserAvatar title={username} username={username} {...props}/>;
const Username = ({ username, status, ...props }) => <UserCard.Username name={username} status={status} {...props}/>;

export const UserInfo = React.memo(function UserInfo({
	id,
	username,
	bio,
	email,
	verified,
	showRealNames,
	status,
	phone,
	customStatus,
	roles = [],
	lastLogin,
	createdAt,
	utcOffset,
	customFields = [],
	name,
	data,
	nickname,
	// onChange,
	actions,
	...props
}) {
	const t = useTranslation();

	const timeAgo = useTimeAgo();

	const uid = Meteor.userId();
	const user = Meteor.user();
	const isAdmin = hasRole(uid, ['admin']);
	const directRoute = useRoute('direct');
	const isPeerSupporter = customFields.VideoUrl !== undefined && customFields.VideoUrl !== '';

	const peerIds = (user === null || user.customFields === null || user.customFields === undefined || user.customFields.ConnectIds === undefined || user.customFields.ConnectIds === '')
		? [] 
		: user.customFields.ConnectIds.split(",");

	const [canConnect, setCanConnect] = useState((!peerIds.includes(username)) && peerIds.length < 5 && !isAdmin);
	const [isConnected, setIsConnected] = useState(peerIds.includes(username) && !isAdmin);

	if (user !== null && user.customFields != undefined && user.customFields !== null) {
		user.customFields.ConnectIds = user.customFields.ConnectIds === undefined || user.customFields.ConnectIds === ''
		? username 
		: `${user.customFields.ConnectIds},${username}`;
	}

	const updateCustomFields = isAdmin ? null : useUpdateCustomFields(user.customFields);

	async function connectCliked() {
		var result = await updateCustomFields(user.customFields);
		setCanConnect(false);
		setIsConnected(true);
	}

	const directMessageClick = useCallback(() => directRoute.push({
		rid: username,
	}), [directRoute, username]);
	
	return <VerticalBar.ScrollableContent p='x24' {...props}>

		<Box alignSelf='center'>
			{ isPeerSupporter ? (
				<>
				 <div className="video-responsive">
				 <iframe
				   width="380"
				   height="240"
				   src={customFields.VideoUrl}
				   frameBorder="0"
				   allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
				   allowFullScreen
				   title="Embedded youtube"
				 />
			   </div>
			   </>
			) : (
				<Avatar size={'x332'} username={username} etag={data?.avatarETag}/>	
			)}
		</Box>

		{canConnect && (
			<Button title={'Connect'} mi='x4' onClick={connectCliked}>
				Connect
			</Button>
		)}

			{isConnected && (
			<Button title={'Message'} mi='x4' onClick={directMessageClick}>
				Message
			</Button>
		)}

		{actions}

		<Margins block='x4'>
			<UserCard.Username name={(showRealNames && name) || username || name} status={status} />
			<Info>{customStatus}</Info>

			{isAdmin && !!roles && <>
				<Label>{t('Roles')}</Label>
				<UserCard.Roles>{roles.map((role, index) => (
					<UserCard.Role key={index}>{role}</UserCard.Role>
				))}
				</UserCard.Roles>
			</>}

			{isAdmin && Number.isInteger(utcOffset) && <>
				<Label>{t('Local_Time')}</Label>
				<Info><UTCClock utcOffset={utcOffset}/></Info>
			</>}

			{username && username !== name && <>
				<Label>{t('Username')}</Label>
				<Info>{username}</Info>
			</>}

			{isAdmin && <>
			<Label>{t('Last_login')}</Label>
			<Info>{lastLogin ? timeAgo(lastLogin) : t('Never')}</Info>
			</>}

			{name && <>
				<Label>{t('Full Name')}</Label>
				<Info>{name}</Info>
			</>}

			{nickname && <>
				<Label>{t('Nickname')}</Label>
				<Info>{nickname}</Info>
			</>}

			{bio && <>
				<Label>{t('Bio')}</Label>
				<Info withTruncatedText={false}><MarkdownText content={bio}/></Info>
			</>}

			{phone && <> <Label>{t('Phone')}</Label>
				<Info display='flex' flexDirection='row' alignItems='center'>
					<Box is='a' withTruncatedText href={`tel:${ phone }`}>{phone}</Box>
				</Info>
			</>}

			{email && <> <Label>{t('Email')}</Label>
				<Info display='flex' flexDirection='row' alignItems='center'>
					<Box is='a' withTruncatedText href={`mailto:${ email }`}>{email}</Box>
					<Margins inline='x4'>
						{verified && <Tag variant='primary'>{t('Verified')}</Tag>}
						{verified || <Tag disabled>{t('Not_verified')}</Tag>}
					</Margins>
				</Info>
			</>}

			{ customFields && Object.entries(customFields).map(([label, value]) => { 
				return !isAdmin && label === 'VideoUrl' 
				? (<></>) 
				: (
				<React.Fragment key={label}>
					<Label>{t(label)}</Label>
					<Info>{value}</Info>
				</React.Fragment>);
				})}

			{isAdmin && <>
			<Label>{t('Created_at')}</Label>
			<Info>{timeAgo(createdAt)}</Info>
			</>}

		</Margins>

	</VerticalBar.ScrollableContent>;
});

export const Action = ({ icon, label, ...props }) => (
	<Button title={label} {...props} mi='x4'>
		<Icon name={icon} size='x20' mie='x4' />
		{label}
	</Button>
);

UserInfo.Action = Action;
UserInfo.Avatar = Avatar;
UserInfo.Info = Info;
UserInfo.Label = Label;
UserInfo.Username = Username;

export const UserInfoWithData = React.memo(function UserInfoWithData({ uid, username, tabBar, rid, onClickClose, onClose = onClickClose, video, onClickBack, ...props }) {
	const t = useTranslation();

	const getRoles = useRolesDescription();

	const showRealNames = useSetting('UI_Use_Real_Name');

	const { value, phase: state, error } = useEndpointData(
		'users.info',
		useMemo(
			() => ({ ...uid && { userId: uid }, ...username && { username } }),
			[uid, username],
		),
	);


	const user = useMemo(() => {
		const { user } = value || { user: {} };
		const {
			_id,
			name,
			username,
			roles = [],
			status = null,
			statusText,
			bio,
			utcOffset,
			lastLogin,
			nickname,
		} = user;

		return {
			id: _id,
			name: showRealNames ? name : username,
			username,
			lastLogin,
			roles: roles && getRoles(roles),
			bio,
			phone: user.phone,
			customFields: user.customFields,
			verified: getUserEmailVerified(user),
			email: getUserEmailAddress(user),
			utcOffset,
			createdAt: user.createdAt,
			// localTime: <LocalTime offset={utcOffset} />,
			status: status && <ReactiveUserStatus uid={_id} presence={status} />,
			customStatus: statusText,
			nickname,
		};
	}, [value, showRealNames, getRoles]);

	return (
		<>
			<VerticalBar.Header>
				{onClickBack && <VerticalBar.Back onClick={onClickBack} />}
				<VerticalBar.Text>{t('User_Info')}</VerticalBar.Text>
				{onClose && <VerticalBar.Close onClick={onClose} />}
			</VerticalBar.Header>

			{
				(error && <VerticalBar.Content>
					<Box mbs='x16'>{t('User_not_found')}</Box>
				</VerticalBar.Content>)
				|| (state === AsyncStatePhase.LOADING && <VerticalBar.Content>
					<FormSkeleton />
				</VerticalBar.Content>)
				|| <UserInfo
					{...user}
					data={user}
					// onChange={onChange}
					actions={<UserActions user={user} rid={rid}/>}
					{...props}
					p='x24'
				/>
			}
		</>
	);
});

export default UserInfoWithData;

import fetch from 'node-fetch';
import { EJSON } from 'meteor/ejson';

import { logger } from './logger';

const MAX_RETRIES = 5;

// Function to fetch with retry logic
async function fetchWithRetry(url, _removeToken, options, retries = 0) {
	const response = await fetch(url, options);

	if (response.ok) {
		return response;
	}

	if (retries >= MAX_RETRIES) {
		logger.error('sendFCM error: max retries reached');
		return response;
	}

	const retryAfter = response.headers.get('retry-after');
	const retryAfterSeconds = retryAfter ? parseInt(retryAfter, 10) : 60;

	if (response.status === 404) {
		_removeToken();
		return response;
	}

	if (response.status === 429) {
		await new Promise((resolve) =>
			setTimeout(resolve, retryAfterSeconds * 1000),
		);
		return fetchWithRetry(url, options, retries + 1);
	}

	if (response.status >= 500 && response.status < 600) {
		const backoff = Math.pow(2, retries) * 10000;
		await new Promise((resolve) => setTimeout(resolve, backoff));
		return fetchWithRetry(url, options, retries + 1);
	}

	const error = await response.json();
	logger.error('sendFCM error', error);

	return response;
}

// Function to construct FCM messages from push data
function getFCMMessagesFromPushData(userTokens, notification) {
	const data = notification.payload
		? { ejson: EJSON.stringify(notification.payload) }
		: {};

	if (notification.gcm?.image) {
		data.image = notification.gcm?.image;
	}

	if (notification.badge) {
		data.msgcnt = notification.badge.toString();
	}

	if (notification.sound) {
		data.soundname = notification.sound;
	}

	if (notification.notId) {
		data.notId = notification.notId.toString();
	}

	if (notification.gcm?.style) {
		data.style = notification.gcm?.style;
	}

	if (notification.contentAvailable) {
		data['content-available'] = notification.contentAvailable.toString();
	}

	const notificationField = {
		title: notification.title,
		body: notification.text,
	};

	const message = {
		notification: notificationField,
		data,
		android: {
			priority: 'HIGH',
		},
	};

	return userTokens.map((token) => ({ message: { ...message, token } }));
}

// Function to send FCM notifications
export const sendFCM = function({
	userTokens,
	_removeToken,
	notification,
	options,
}) {
	const tokens = typeof userTokens === 'string' ? [userTokens] : userTokens;
	if (!tokens.length) {
		logger.log('sendFCM no push tokens found');
		return;
	}

	logger.debug('sendFCM', tokens, notification);

	const messages = getFCMMessagesFromPushData(tokens, notification);
	const headers = {
		'Content-Type': 'application/json',
		Authorization: `Bearer ${ options.gcm.apiKey }`,
		access_token_auth: true,
	};

	if (!options.gcm.projectNumber?.trim()) {
		logger.error('sendFCM error: GCM project number is missing');
		return;
	}

	const url = `https://fcm.googleapis.com/v1/projects/${ options.gcm.projectNumber }/messages:send`;

	for (const { message } of messages) {
		logger.debug('sendFCM message', message);
		const response = fetchWithRetry(url, _removeToken, {
			method: 'POST',
			headers,
			body: JSON.stringify({ message }),
		});

		response.catch((err) => {
			logger.error('sendFCM error', err);
		});
	}
};

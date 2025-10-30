import { callbacks } from '../../../callbacks/server';
import { Messages, Rooms, Users } from '../../../models/server';
import { createDirectMessage } from '../../../../server/methods/createDirectMessage';
import { Logger } from '../../../logger/server';

const logger = new Logger('tech-support-duplication');


// Define the list of administrators who should see tech_support messages
const TECH_SUPPORT_ADMINS = [
	'timq',
    'akshay.tripathi',
    'tangts',
    'vanthonio',
    'ravi.bhan'
	// Add more usernames as needed
];

/**
 * Routes admin replies back to original user
 */
function routeAdminRepliesToUser(message, room) {
	// Only process direct messages
	if (room.t !== 'd') {
		return message;
	}

	// Only process thread replies (messages with tmid)
	if (!message.tmid) {
		return message;
	}

	// Check if this is an admin replying in a DM with tech_support
	if (!room.usernames || !room.usernames.includes('tech_support')) {
		return message;
	}

	// Skip if tech_support is the one replying (they can handle their own replies)
	if (message.u.username === 'tech_support') {
		return message;
	}

	// Check if sender is one of the admins
	if (!TECH_SUPPORT_ADMINS.includes(message.u.username)) {
		return message;
	}

	// Find the parent message this is replying to
	const parentMessage = Messages.findOneById(message.tmid);
	if (!parentMessage || !parentMessage.customFields?.duplicatedFrom) {
		return message; // Not a reply to a duplicated message
	}

	// Get the original message details
	const originalSender = parentMessage.customFields.duplicatedFrom.originalSender;
	const originalRoom = parentMessage.customFields.duplicatedFrom.originalRoom;

	// Get tech_support user
	const techSupportUser = Users.findOneByUsername('tech_support');
	if (!techSupportUser) {
		return message;
	}

	// Get original room
	const userTechRoom = Rooms.findOneById(originalRoom);
	if (!userTechRoom) {
		logger.warn(`Original room ${originalRoom} not found for reply routing`);
		return message;
	}

	try {
		// Create reply message from tech_support to original user
		Messages.insert({
			rid: userTechRoom._id,
			ts: new Date(),
			msg: `**Reply from @${message.u.username}:**\n${message.msg}`,
			u: {
				_id: techSupportUser._id,
				username: techSupportUser.username,
				name: techSupportUser.name || techSupportUser.username
			},
			mentions: [],
			channels: [],
			_updatedAt: new Date(),
			customFields: {
				adminReply: {
					adminUser: message.u.username,
					originalMessageId: parentMessage.customFields.duplicatedFrom.originalMessageId,
					adminReplyId: message._id
				}
			}
		});

		logger.debug(`Routed reply from admin ${message.u.username} back to user ${originalSender}`);

	} catch (error) {
		logger.error(`Error routing admin reply back to user:`, error);
	}

	return message;
}

/**
 * Duplicates messages sent TO tech_support user into DMs with each admin
 */
function duplicateTechSupportMessages(message, room) {
	// Only process direct messages
	if (room.t !== 'd') {
		return message;
	}

	// Check if tech_support is involved in this DM
	if (!room.usernames || !room.usernames.includes('tech_support')) {
		return message;
	}

	// Only duplicate messages TO tech_support (not FROM tech_support)
	if (message.u.username === 'tech_support') {
		return message;
	}

	// Skip system messages and empty messages
	if (message.t || !message.msg || message.msg.trim() === '') {
		return message;
	}

	// Get tech_support user
	const techSupportUser = Users.findOneByUsername('tech_support');
	if (!techSupportUser) {
		return message;
	}

	// Process each admin
	TECH_SUPPORT_ADMINS.forEach(adminUsername => {
		try {
			const adminUser = Users.findOneByUsername(adminUsername);
			if (!adminUser) {
				console.log(`[TechSupport] Admin user ${adminUsername} not found`);
				return;
			}

			// Find or create DM between admin and tech_support
			let adminTechRoom = Rooms.findOneDirectRoomContainingAllUserIDs([adminUser._id, techSupportUser._id]);
			
			if (!adminTechRoom) {
				// Create DM between admin and tech_support
				const roomResult = createDirectMessage([techSupportUser.username], adminUser._id);
				if (roomResult && roomResult.rid) {
					adminTechRoom = Rooms.findOneById(roomResult.rid);
				}
			}

			if (!adminTechRoom) {
				console.log(`[TechSupport] Could not find/create DM between ${adminUsername} and tech_support`);
				return;
			}

            logger.debug(`Duplicating message from ${message.u.username} to admin ${adminUsername}`);

			// Create duplicate message posted by tech_support in the admin DM
			Messages.insert({
				rid: adminTechRoom._id,
				ts: new Date(),
				msg: `**Message from @${message.u.username}:**\n${message.msg}`,
				u: {
					_id: techSupportUser._id,
					username: techSupportUser.username,
					name: techSupportUser.name || techSupportUser.username
				},
				mentions: [],
				channels: [],
				_updatedAt: new Date(),
				customFields: {
					duplicatedFrom: {
						originalSender: message.u.username,
						originalMessageId: message._id,
						originalRoom: room._id
					}
				}
			});

			console.log(`[TechSupport] Duplicated message from ${message.u.username} to admin ${adminUsername}`);

		} catch (error) {
			console.error(`[TechSupport] Error duplicating message to admin ${adminUsername}:`, error);
		}
	});

	return message;
}

// Hook into the message system
callbacks.add('afterSaveMessage', duplicateTechSupportMessages, callbacks.priority.LOW, 'tech-support-duplication');
callbacks.add('afterSaveMessage', routeAdminRepliesToUser, callbacks.priority.LOW, 'tech-support-reply-routing');

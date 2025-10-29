import { callbacks } from '../../../callbacks/server';
import { Messages, Rooms, Users } from '../../../models/server';
import { createDirectMessage } from '../../../../server/methods/createDirectMessage';
import { Logger } from '../../../logger/server';

const logger = new Logger('tech-support-duplication');


// Define the list of administrators who should see tech_support messages
const TECH_SUPPORT_ADMINS = [
	'timq',
	// Add more usernames as needed
];

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

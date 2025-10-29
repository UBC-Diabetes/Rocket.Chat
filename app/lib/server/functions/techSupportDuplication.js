import { callbacks } from '../../../callbacks/server';
import { Messages, Rooms, Users, Subscriptions } from '../../../models/server';

/**
 * Duplicates messages sent TO tech_support user into #tech_support_feed channel
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

	// Find the tech_support_feed channel
	const targetRoom = Rooms.findOneByName('tech_support_feed');
	if (!targetRoom) {
		return message;
	}

	// Get tech_support user
	const techSupportUser = Users.findOneByUsername('tech_support');
	if (!techSupportUser) {
		return message;
	}

	try {
		// Create duplicate message posted by tech_support
		Messages.insert({
			rid: targetRoom._id,
			ts: new Date(),
			msg: `**Message from @${message.u.username}:**\n${message.msg}`,
			u: {
				_id: techSupportUser._id,
				username: techSupportUser.username,
				name: techSupportUser.name || techSupportUser.username
			},
			mentions: [],
			channels: [],
			_updatedAt: new Date()
		});
	} catch (error) {
		console.error('[TechSupport] Error duplicating message:', error);
	}

	return message;
}

// Hook into the message system
callbacks.add('afterSaveMessage', duplicateTechSupportMessages, callbacks.priority.LOW, 'tech-support-duplication');
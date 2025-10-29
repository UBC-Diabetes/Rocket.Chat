import { callbacks } from '../../callbacks/server';
import { Messages, Rooms, Users, Subscriptions } from '../../models/server';
import { settings } from '../../settings/server';

/**
 * Duplicates messages sent TO tech_support user into a team channel
 * for team visibility while maintaining the original DM conversation
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

	// Skip system messages (join/leave/etc)
	if (message.t) {
		return message;
	}

	// Skip empty messages
	if (!message.msg || message.msg.trim() === '') {
		return message;
	}

	// Find the tech_support_feed channel
	const targetRoom = Rooms.findOneByName('tech_support_feed');
	if (!targetRoom) {
		console.log('[TechSupportMonitor] tech_support_feed channel not found');
		return message;
	}

	// Get tech_support user
	const techSupportUser = Users.findOneByUsername('tech_support');
	if (!techSupportUser) {
		console.log('[TechSupportMonitor] tech_support user not found');
		return message;
	}

	// Check if tech_support has permission to post in the target channel
	const subscription = Subscriptions.findOneByRoomIdAndUserId(targetRoom._id, techSupportUser._id);
	if (!subscription) {
		console.log('[TechSupportMonitor] tech_support user not subscribed to tech_support_feed channel');
		return message;
	}

	try {
		// Create duplicate message posted by tech_support
		const duplicateMessage = {
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
			_updatedAt: new Date(),
			// Add metadata to track the original message
			customFields: {
				duplicatedFrom: {
					messageId: message._id,
					originalSender: message.u.username,
					originalRoom: room._id,
					originalTimestamp: message.ts
				}
			}
		};

		// Insert the duplicate message
		const insertedId = Messages.insert(duplicateMessage);
		
		if (insertedId) {
			console.log(`[TechSupportMonitor] Duplicated message from ${message.u.username} to tech_support_feed`);
		}

	} catch (error) {
		console.error('[TechSupportMonitor] Error duplicating message:', error);
	}

	// Always return the original message unchanged
	return message;
}

/**
 * Initialize the tech support monitoring system
 */
function initTechSupportMonitor() {
	// Add the callback with low priority to ensure it runs after other message processing
	callbacks.add(
		'afterSaveMessage', 
		duplicateTechSupportMessages, 
		callbacks.priority.LOW, 
		'tech-support-duplication'
	);
	
	console.log('[TechSupportMonitor] Tech support message duplication enabled');
}

/**
 * Remove the tech support monitoring system
 */
function removeTechSupportMonitor() {
	callbacks.remove('afterSaveMessage', 'tech-support-duplication');
	console.log('[TechSupportMonitor] Tech support message duplication disabled');
}

// Initialize on startup
initTechSupportMonitor();

// Export functions for potential future use
export {
	duplicateTechSupportMessages,
	initTechSupportMonitor,
	removeTechSupportMonitor
};
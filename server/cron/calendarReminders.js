import { Meteor } from 'meteor/meteor';
import { CalendarEvents } from '../../app/models/server';
import { Push } from '../../app/push/server/push';

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function sendCalendarReminders() {
	const now = new Date();
	const oneWeekOut = new Date(now.getTime() + ONE_WEEK_MS);
	const oneDayOut = new Date(now.getTime() + ONE_DAY_MS);

	// Window for "one week out" notifications (events happening in ~7 days, +/- 12 hours)
	const oneWeekStart = new Date(oneWeekOut.getTime() - 12 * 60 * 60 * 1000);
	const oneWeekEnd = new Date(oneWeekOut.getTime() + 12 * 60 * 60 * 1000);

	// Window for "one day out" notifications (events happening in ~24 hours, +/- 12 hours)
	const oneDayStart = new Date(oneDayOut.getTime() - 12 * 60 * 60 * 1000);
	const oneDayEnd = new Date(oneDayOut.getTime() + 12 * 60 * 60 * 1000);

	console.log('[Calendar Reminders] Running job at', now.toISOString());
	console.log('[Calendar Reminders] One week window:', oneWeekStart.toISOString(), 'to', oneWeekEnd.toISOString());
	console.log('[Calendar Reminders] One day window:', oneDayStart.toISOString(), 'to', oneDayEnd.toISOString());

	// Find events that need one-week reminders
	const oneWeekEvents = CalendarEvents.find({
		'event.dateTime': {
			$gte: oneWeekStart.toISOString(),
			$lte: oneWeekEnd.toISOString()
		},
		oneWeekReminderSent: { $ne: true }
	}).fetch();

	console.log(`[Calendar Reminders] Found ${oneWeekEvents.length} events needing one-week reminders`);

	oneWeekEvents.forEach(eventDoc => {
		const event = eventDoc.event || {};
		const attendees = event.attendees || [];

		console.log(`[Calendar Reminders] Processing one-week reminder for event: ${event.title}, attendees: ${attendees.length}`);

		attendees.forEach(userId => {
			try {
				Push.send({
					from: 'push',
					title: `Upcoming Event: ${event.title || 'Untitled Event'}`,
					text: 'Your event is in one week',
					userId: userId,
					payload: {
						notificationType: 'calendar',
						eventId: eventDoc._id,
						eventTitle: event.title,
						eventDateTime: event.dateTime,
						meetingLink: event.meetingLink,
						type: 'calendar_reminder',
						reminderType: 'one_week'
					},
					badge: 1,
					sound: 'default'
				});

				console.log(`[Calendar Reminders] Sent one-week notification to user: ${userId}`);
			} catch (error) {
				console.error(`[Calendar Reminders] Error sending one-week notification to ${userId}:`, error);
			}
		});

		// Mark one-week reminder as sent
		try {
			CalendarEvents.updateEvent(eventDoc._id, { oneWeekReminderSent: true });
			console.log(`[Calendar Reminders] Marked event ${eventDoc._id} one-week reminder as sent`);
		} catch (error) {
			console.error(`[Calendar Reminders] Error marking one-week reminder as sent:`, error);
		}
	});

	// Find events that need one-day reminders
	const oneDayEvents = CalendarEvents.find({
		'event.dateTime': {
			$gte: oneDayStart.toISOString(),
			$lte: oneDayEnd.toISOString()
		},
		oneDayReminderSent: { $ne: true }
	}).fetch();

	console.log(`[Calendar Reminders] Found ${oneDayEvents.length} events needing one-day reminders`);

	oneDayEvents.forEach(eventDoc => {
		const event = eventDoc.event || {};
		const attendees = event.attendees || [];

		console.log(`[Calendar Reminders] Processing one-day reminder for event: ${event.title}, attendees: ${attendees.length}`);

		attendees.forEach(userId => {
			try {
				Push.send({
					from: 'push',
					title: `Upcoming Event: ${event.title || 'Untitled Event'}`,
					text: 'Your event is tomorrow',
					userId: userId,
					payload: {
						notificationType: 'calendar',
						eventId: eventDoc._id,
						eventTitle: event.title,
						eventDateTime: event.dateTime,
						meetingLink: event.meetingLink,
						type: 'calendar_reminder',
						reminderType: 'one_day'
					},
					badge: 1,
					sound: 'default'
				});

				console.log(`[Calendar Reminders] Sent one-day notification to user: ${userId}`);
			} catch (error) {
				console.error(`[Calendar Reminders] Error sending one-day notification to ${userId}:`, error);
			}
		});

		// Mark one-day reminder as sent
		try {
			CalendarEvents.updateEvent(eventDoc._id, { oneDayReminderSent: true });
			console.log(`[Calendar Reminders] Marked event ${eventDoc._id} one-day reminder as sent`);
		} catch (error) {
			console.error(`[Calendar Reminders] Error marking one-day reminder as sent:`, error);
		}
	});

	console.log('[Calendar Reminders] Job completed');
}

export function calendarRemindersCron(SyncedCron) {
	SyncedCron.add({
		name: 'Calendar Event Reminders',
		schedule(parser) {
			// Run once a day at 9:00 AM
			return parser.cron('0 9 * * *');
		},
		job: sendCalendarReminders
	});
}

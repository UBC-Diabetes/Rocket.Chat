import { API } from '../api';
import { CalendarEvents } from '../../../models/server';

API.v1.addRoute('calendarEvents.fetch', { authRequired: true }, {
  get() {
    const events = CalendarEvents.getAllEvents().fetch();
    return API.v1.success({ events });
  },
  });

API.v1.addRoute('calendarEvents.create', { authRequired: true }, {
  post() {
    const eventData = this.bodyParams;
    try {
      const eventId = CalendarEvents.createEvent(eventData);
      return API.v1.success({ eventId });
    } catch (error) {
      console.log('create error', error)
      return API.v1.failure(`Failed to create event: ${error.message}`);
    }
  }
});

API.v1.addRoute('calendarEvents.update', { authRequired: true }, {
  post() {
    const eventData = this.bodyParams;
    try {
      const eventId = CalendarEvents.updateEvent(eventData.event.id, eventData);
      return API.v1.success({ eventId });
    } catch (error) {
      return API.v1.failure(`Failed to update event: ${error.message}`);
    }
  }
});

API.v1.addRoute('calendarEvents.delete', { authRequired: true }, {
  post() {
    const { eventId } = this.bodyParams;
    try {
      const deletedEvent = CalendarEvents.deleteEvent(eventId);
      return API.v1.success({ deletedEvent });
    } catch (error) {
      return API.v1.failure(`Failed to delete event: ${error.message}`);
    }
  }
});

API.v1.addRoute('calendarEvents.register', { authRequired: true }, {
  post() {
    const { eventId, attendeeId } = this.bodyParams;
    try {
      const existingEvent = CalendarEvents.getEventById(eventId);
      existingEvent.event.attendees.push(attendeeId);
      const updatedEvent = CalendarEvents.updateEvent(eventId, existingEvent);
      return API.v1.success({ updatedEvent });
    } catch (error) {
      return API.v1.failure(`Failed to register for event: ${error.message}`);
    }
  }
});

API.v1.addRoute('calendarEvents.deregister', { authRequired: true }, {
  post() {
    const { eventId, attendeeId } = this.bodyParams;
    try {
      const existingEvent = CalendarEvents.getEventById(eventId);
      const filteredAttendees = existingEvent.event.attendees.filter(attendee => attendee != attendeeId);
      existingEvent.event.attendees = filteredAttendees;
      const updatedEvent = CalendarEvents.updateEvent(eventId, existingEvent);
      return API.v1.success({ updatedEvent });
    } catch (error) {
      return API.v1.failure(`Failed to deregister for event: ${error.message}`);
    }
  }
});

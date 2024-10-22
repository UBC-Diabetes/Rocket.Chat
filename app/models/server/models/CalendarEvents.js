import { Base } from './_Base';

class CalendarEvents extends Base {
  constructor() {
    super('calendar_events');
    this.tryEnsureIndex({ createdAt: 1 });
    this.tryEnsureIndex({ userId: 1 });
  }

  createEvent(eventData) {
    const event = {
      createdAt: new Date(),
      ...eventData,
    };

    return this.insert(event);
  }

  getEventById(_id) {
    return this.findOne({ _id });
  }

  getAllEvents(options = {}) {
    return this.find({}, options);
  }

  updateEvent(_id, updateData) {
    return this.update({ _id }, { $set: updateData });
  }

  deleteEvent(_id) {
    return this.remove({ _id });
  }
}

export default new CalendarEvents();

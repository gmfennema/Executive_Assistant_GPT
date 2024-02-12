function viewEvents(startDateTime, endDateTime) {
  var startDate = stringToDatetime(startDateTime);
  var endDate = stringToDatetime(endDateTime);
  var calendar = CalendarApp.getCalendarById(calendarId);
  var events = calendar.getEvents(startDate, endDate);
  var eventList = [];
  for (var i = 0; i < events.length; i++) {
    var event = events[i];
    eventList.push({
      title: event.getTitle(),
      startTime: event.getStartTime().toLocaleString(timeZone),
      endTime: event.getEndTime().toLocaleString(timeZone),
      description: event.getDescription(),
      id: event.getId(),
    });
  }
  Logger.log(String(JSON.stringify(eventList)));
  return ContentService.createTextOutput(JSON.stringify(eventList));
}

function createEvent(
  title,
  startDateTime,
  endDateTime,
  isAllDay,
  description,
  invitees
) {
  endDateTime = endDateTime || startDateTime;
  isAllDay = isAllDay || false;
  description = description || null;
  invitees = invitees || "";

  var startDate = stringToDatetime(startDateTime);
  var endDate = stringToDatetime(endDateTime);
  var calendar = CalendarApp.getCalendarById(calendarId);
  var inviteesList = invitees ? invitees.join(",") : "";
  var eventOptions = {
    description: description,
    guests: inviteesList,
  };
  if (isAllDay) {
    var newEvent = calendar.createAllDayEvent(
      title,
      startDate,
      endDate,
      eventOptions
    );
  } else {
    var newEvent = calendar.createEvent(
      title,
      startDate,
      endDate,
      eventOptions
    );
  }
  if (newEvent) {
    return ContentService.createTextOutput(
      "Event created successfully. ID = " + newEvent.getId()
    ).setMimeType(ContentService.MimeType.TEXT);
  } else {
    return ContentService.createTextOutput("Error creating event").setMimeType(
      ContentService.MimeType.TEXT
    );
  }
}

function modifyEvent(
  eventId,
  title,
  startDateTime,
  endDateTime,
  description,
  deleteEvent
) {
  var calendar = CalendarApp.getCalendarById(calendarId);
  var event = calendar.getEventById(eventId);
  if (!event) {
    return ContentService.createTextOutput("Event not found").setMimeType(
      ContentService.MimeType.TEXT
    );
  }
  if (deleteEvent == true) {
    event.deleteEvent(); // Delete the event
    return ContentService.createTextOutput(
      "Event deleted successfully"
    ).setMimeType(ContentService.MimeType.TEXT);
  } else {
    if (startDateTime == null) {
      var newStartTime = event.getStartTime();
    } else {
      var newStartTime = stringToDatetime(startDateTime);
    }
    //------//
    if (endDateTime == null) {
      var newEndTime = event.getEndTime();
    } else {
      var newEndTime = stringToDatetime(endDateTime);
    }
    Logger.log(newStartTime + " " + newEndTime);
    event.setTime(new Date(newStartTime), new Date(newEndTime));

    if (title !== null) {
      event.setTitle(title);
    }
    if (description !== null) {
      event.setDescription(description);
    }

    return ContentService.createTextOutput(
      "Event modified successfully"
    ).setMimeType(ContentService.MimeType.TEXT);
  }
}

function stringToDatetime(inputString) {
  try {
    var date = new Date(inputString);
    if (!isNaN(date.getTime())) {
      var formattedDate =
        Utilities.formatDate(date, timeZone, "MMMM dd, yyyy HH:mm:ss") +
        " " +
        timeZone;
      var udatedDate = new Date(formattedDate);
      return udatedDate;
    } else {
      return "Invalid date format";
    }
  } catch (error) {
    return "Error: " + error.toString();
  }
}
function listOwnedCalendars() {
  var calendars = CalendarApp.getAllOwnedCalendars();

  if (calendars.length === 0) {
    Logger.log("You don't own any calendars.");
  } else {
    for (var i = 0; i < calendars.length; i++) {
      var calendar = calendars[i];
      Logger.log("Calendar Name: " + calendar.getName());
      Logger.log("Calendar ID: " + calendar.getId());
      Logger.log("---");
    }
  }
}

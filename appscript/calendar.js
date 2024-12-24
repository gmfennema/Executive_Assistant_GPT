function viewEvents(startDateTime, endDateTime) {
  var startDate = stringToDatetime(startDateTime);
  var endDate = stringToDatetime(endDateTime);
  var calendar = CalendarApp.getCalendarById(calendarId);
  var events = calendar.getEvents(startDate, endDate);
  var eventList = [];
  
  // Color lookup key
  var colorKey = {
    "1": "PALE_BLUE",
    "2": "PALE_GREEN",
    "3": "MAUVE",
    "4": "PALE_RED",
    "5": "YELLOW",
    "6": "ORANGE",
    "7": "CYAN",
    "8": "GRAY",
    "9": "BLUE",
    "10": "GREEN",
    "11": "RED"
  };

  for (var i = 0; i < events.length; i++) {
    var event = events[i];
    var colorNumber = event.getColor();
    var colorName = colorKey[colorNumber] || "UNKNOWN"; // Default to "UNKNOWN" if not found

    eventList.push({
      title: event.getTitle(),
      startTime: event.getStartTime().toLocaleString(timeZone),
      endTime: event.getEndTime().toLocaleString(timeZone),
      description: event.getDescription(),
      id: event.getId(),
      color: colorName // Added color to the event object
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
  invitees,
  color
) {
  endDateTime = endDateTime || startDateTime; // If endDateTime is not provided, set it to startDateTime
  isAllDay = isAllDay || false;
  description = description || null;
  invitees = invitees || "";
  color = color || null;

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
    if (color) {
      newEvent.setColor(CalendarApp.EventColor[color]);
    }
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
  deleteEvent,
  color
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

    if (color !== null) {
      event.setColor(CalendarApp.EventColor[color]);
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

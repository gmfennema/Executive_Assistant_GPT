//Required for all functionality
var securityKey = "[YOUR SECURITY KEY]";

//For Google Calendar Functionaily
var calendarId = "[YOUR CALENDAR ID OR GMAIL]";
var timeZone = "PST";

function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  var operation = e.parameter.operation;
  var providedKey = e.parameter.securityKey; // Get the security key from the request
  var requestBody = JSON.parse(e.postData.contents);
  // Check if the provided security key matches the expected security key
  if (providedKey !== securityKey) {
    return ContentService.createTextOutput("Invalid security key").setMimeType(
      ContentService.MimeType.TEXT
    );
  }
  switch (operation) {
    /* ------- PERSONAL CRM FUNCTIONALITY --------*/
    case "getPeople":
      return getPeople();
    case "getPerson":
      return getPerson(requestBody.name);
    case "viewEvents":
      return viewEvents(requestBody.startDateTime, requestBody.endDateTime);
    case "createProfile":
      return createProfile(requestBody.name);
    case "updateProfile":
      return updateProfile(
        requestBody.name,
        requestBody.value,
        requestBody.path,
        requestBody.updateType
      );

    /* ------- GOOGLE CALENDAR FUNCTIONALITY --------*/
    case "createEvent":
      var title = requestBody.title || null;
      var startDateTime = requestBody.startDateTime || null;
      var endDateTime = requestBody.endDateTime || null;
      var isAllDay = requestBody.isAllDay || false;
      var description = requestBody.description || null;
      var invitees = requestBody.invitees || null;
      return createEvent(
        title,
        startDateTime,
        endDateTime,
        isAllDay,
        description,
        invitees
      );
    case "modifyEvent":
      var title = requestBody.title || null;
      var startDateTime = requestBody.startDateTime || null;
      var endDateTime = requestBody.endDateTime || null;
      var isAllDay = requestBody.isAllDay || false;
      var description = requestBody.description || null;
      var deleteEvent = requestBody.deleteEvent || false;
      return modifyEvent(
        requestBody.eventId,
        title,
        startDateTime,
        endDateTime,
        description,
        deleteEvent
      );
    default:
      return ContentService.createTextOutput("Invalid operation").setMimeType(
        ContentService.MimeType.TEXT
      );
  }
}

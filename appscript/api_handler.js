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
  var requestBody = {};
  if (e.postData) { // Check if postData is present
    requestBody = JSON.parse(e.postData.contents);
  }
  // Check if the provided security key matches the expected security key
  if (providedKey !== securityKey) {
    return ContentService.createTextOutput("Invalid security key").setMimeType(
      ContentService.MimeType.TEXT
    );
  }
  switch (operation) {
    /* ------- PERSONAL CRM FUNCTIONALITY --------*/
    case "getPeople":
      var peopleNames = getPeople();
      return ContentService.createTextOutput(String(peopleNames)).setMimeType(ContentService.MimeType.TEXT);
    case "getPerson":
      return getPerson(e.parameter.name);
    case "createProfile":
      return createProfile(e.parameter.name);
    case "updateProfile":
      return updateProfile(
        e.parameter.name,
        requestBody.value,
        requestBody.path,
        requestBody.updateType
      );

    /* ------- GOOGLE CALENDAR FUNCTIONALITY --------*/
    case "viewEvents":
      return viewEvents(requestBody.startDateTime, requestBody.endDateTime);
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
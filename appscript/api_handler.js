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
      return getPeople();
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
      return createEvent(
        title=requestBody.title || null,
        startDateTime=requestBody.startDateTime || null,
        endDateTime=requestBody.endDateTime || null,
        isAllDay=requestBody.isAllDay || false,
        description=requestBody.description || null,
        invitees=requestBody.invitees || null
      );
    case "modifyEvent":
      return modifyEvent(
        requestBody.eventId,
        title = requestBody.title || null,
        startDateTime = requestBody.startDateTime || null,
        endDateTime = requestBody.endDateTime || null,
        isAllDay = requestBody.isAllDay || false,
        description = requestBody.description || null,
        deleteEvent = requestBody.deleteEvent || false
      );

    /* ------- GMAIL FUNCTIONALITY --------*/
    case "getEmails":
      return getEmails(
        minDate = requestBody.minDate,
        isUnread = requestBody.isUnread || null,
        isInInbox = requestBody.isInInbox || null
      );
    case "updateEmails":
      return updateEmails(
        emailIds = requestBody.emailIds || [],
        markAsRead = requestBody.markAsRead || null,
        archive = requestBody.archive || null,
        moveToInbox = requestBody.moveToInbox || null
        );
    default:
      return ContentService.createTextOutput("Invalid operation").setMimeType(
        ContentService.MimeType.TEXT
      );
  }
}
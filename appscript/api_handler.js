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
        invitees=requestBody.invitees || null,
        color=requestBody.color || null
      );
    case "modifyEvent":
      return modifyEvent(
        requestBody.eventId,
        title = requestBody.title || null,
        startDateTime = requestBody.startDateTime || null,
        endDateTime = requestBody.endDateTime || null,
        isAllDay = requestBody.isAllDay || false,
        description = requestBody.description || null,
        deleteEvent = requestBody.deleteEvent || false,
        color=requestBody.color || null
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

    /* ------- OBSIDIAN FUNCTIONALITY --------*/
    case "getObsidianVaultStructure":
      return ContentService.createTextOutput(JSON.stringify(
        getObsidianVaultStructure(base_obsidian_folder)
      )).setMimeType(ContentService.MimeType.JSON);

    case "searchObsidianNotes":
      return ContentService.createTextOutput(JSON.stringify(
        searchObsidianNotes(e.parameter.folderId, e.parameter.searchTerm)
      )).setMimeType(ContentService.MimeType.JSON);

    case "previewObsidianFolder":
      return ContentService.createTextOutput(JSON.stringify(
        previewObsidianFolder(e.parameter.folderId)
      )).setMimeType(ContentService.MimeType.JSON);

    case "createObsidianNote":
      return ContentService.createTextOutput(JSON.stringify(
        createObsidianNote(
          e.parameter.folderId,
          requestBody.fileName,
          requestBody.content
        )
      )).setMimeType(ContentService.MimeType.JSON);

    case "readObsidianNote":
      return ContentService.createTextOutput(JSON.stringify(
        readObsidianNote(e.parameter.fileId)
      )).setMimeType(ContentService.MimeType.JSON);

    case "createObsidianFolder":
      return ContentService.createTextOutput(JSON.stringify(
        createObsidianFolder(
          e.parameter.parentFolderId,
          requestBody.folderName
        )
      )).setMimeType(ContentService.MimeType.JSON);

    case "moveObsidianItem":
      return ContentService.createTextOutput(JSON.stringify(
        moveObsidianItem(
          e.parameter.itemId,
          e.parameter.destinationFolderId,
          requestBody.isFolder
        )
      )).setMimeType(ContentService.MimeType.JSON);

    case "deleteObsidianNote":
      return ContentService.createTextOutput(JSON.stringify(
        deleteObsidianNote(e.parameter.fileId)
      )).setMimeType(ContentService.MimeType.JSON);

    default:
      return ContentService.createTextOutput("Invalid operation").setMimeType(
        ContentService.MimeType.TEXT
      );
  }
}
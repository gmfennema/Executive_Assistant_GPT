function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  var operation = e.parameter.operation;
  var providedKey = e.parameter.securityKey;
  var requestBody = {};
  
  if (e.postData) {
    requestBody = JSON.parse(e.postData.contents);
  }

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
    case "createProfile":
      return createProfile(requestBody.name);
    case "updateProfile":
      return updateProfile(
        requestBody.name,
        requestBody.value,
        requestBody.path,
        requestBody.updateType
      );

    /* ------- OBSIDIAN FUNCTIONALITY --------*/
    case "getObsidianVaultStructure":
      return ContentService.createTextOutput(JSON.stringify(
        getObsidianVaultStructure(base_obsidian_folder)
      )).setMimeType(ContentService.MimeType.JSON);

    case "searchObsidianNotes":
      return ContentService.createTextOutput(JSON.stringify(
        searchObsidianNotes(requestBody.folderId, requestBody.searchTerm)
      )).setMimeType(ContentService.MimeType.JSON);

    case "previewObsidianFolder":
      return ContentService.createTextOutput(JSON.stringify(
        previewObsidianFolder(requestBody.folderId)
      )).setMimeType(ContentService.MimeType.JSON);

    case "createObsidianNote":
      return ContentService.createTextOutput(JSON.stringify(
        createObsidianNote(
          requestBody.folderId,
          requestBody.fileName,
          requestBody.content
        )
      )).setMimeType(ContentService.MimeType.JSON);

    case "readObsidianNote":
      return ContentService.createTextOutput(JSON.stringify(
        readObsidianNote(requestBody.fileId)
      )).setMimeType(ContentService.MimeType.JSON);

    case "createObsidianFolder":
      return ContentService.createTextOutput(JSON.stringify(
        createObsidianFolder(
          requestBody.parentFolderId,
          requestBody.folderName
        )
      )).setMimeType(ContentService.MimeType.JSON);

    case "moveObsidianItem":
      return ContentService.createTextOutput(JSON.stringify(
        moveObsidianItem(
          requestBody.itemId,
          requestBody.destinationFolderId,
          requestBody.isFolder
        )
      )).setMimeType(ContentService.MimeType.JSON);

    case "deleteObsidianNote":
      return ContentService.createTextOutput(JSON.stringify(
        deleteObsidianNote(requestBody.fileId)
      )).setMimeType(ContentService.MimeType.JSON);

    /* ------- GOOGLE CALENDAR FUNCTIONALITY --------*/
    case "viewEvents":
      return viewEvents(requestBody.startDateTime, requestBody.endDateTime);
    case "createEvent":
      return createEvent(
        requestBody.title,
        requestBody.startDateTime,
        requestBody.endDateTime,
        {
          isAllDay: requestBody.isAllDay || false,
          description: requestBody.description,
          invitees: requestBody.invitees
        }
      );
    case "modifyEvent":
      return modifyEvent(
        requestBody.eventId,
        requestBody.title,
        requestBody.startDateTime,
        requestBody.endDateTime,
        requestBody.description,
        requestBody.deleteEvent || false
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

    /* ------- GOOGLE TASKS FUNCTIONALITY --------*/
    case "getTaskLists":
      return getTaskLists();
    case "createTaskList":
      return createTaskList(requestBody.title);
    case "getTasks":
      const dateRange = getDefaultDateRange();
      const taskListIds = (requestBody && requestBody.taskListIds) || (e.parameter && e.parameter.taskListIds);
      return getTasks(
        (requestBody && requestBody.startDateTime) || dateRange.startDateTime,
        (requestBody && requestBody.endDateTime) || dateRange.endDateTime,
        taskListIds
      );
    case "createTask":
      return createTask(requestBody);

    case "markTaskAsComplete":
      return markTaskAsComplete(requestBody);
    case "updateTaskDetails":
      return updateTaskDetails(requestBody);
    case "deleteTask":
      return deleteTask(requestBody);
    case "deleteTaskList":
      return deleteTaskList(requestBody.taskListId);
    case "moveTask":
      return moveTask(requestBody);

    default:
      return ContentService.createTextOutput("Invalid operation").setMimeType(
        ContentService.MimeType.TEXT
      );
  }
}
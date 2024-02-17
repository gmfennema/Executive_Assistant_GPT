function getEmails(minDate, isUnread, isInInbox) {
    if (isUnread === undefined) {
      isUnread = true;
    }
    var inbox = GmailApp.getInboxThreads();
  
    var minDateFormatted = new Date(minDate)
    // Filter threads based on the minimum date
    if (minDateFormatted) {
      inbox = inbox.filter(function(thread) {
        return thread.getLastMessageDate() >= minDateFormatted;
      });
    }
    if (isUnread === true) {
      inbox = inbox.filter(function(thread) {
        return thread.isUnread();
      });
    }
  
    if (isInInbox === true) {
      inbox = inbox.filter(function(thread) {
        return thread.isInInbox();
      });
    }
  
    var emailData = [];
    for (var i = 0; i < inbox.length; i++) {
      var messages = inbox[i].getMessages();
      for (var j = 0; j < messages.length; j++) {
        var email = messages[j];
        var sender = email.getFrom();
        var ccRecipients = email.getCc();
        var inPriorityInbox = email.isInPriorityInbox();
        var inInbox = email.isInInbox();
        var subject = email.getSubject();
        var emailID = email.getId();
        
        var emailInfo = {
          emailID: emailID,
          sender: sender,
          ccRecipients: ccRecipients,
          subject: subject,
          inInbox: inInbox,
          inPriorityInbox: inPriorityInbox
        };
  
        emailData.push(emailInfo);
      }
    }
    return ContentService
      .createTextOutput(JSON.stringify(emailData))
      .setMimeType(ContentService.MimeType.JSON);;
  }
  
  function updateEmails(emailIds=[], markAsRead, archive, moveToInbox) {
    emailIds.forEach(function(emailId) {
      var thread = GmailApp.getMessageById(emailId).getThread();
      if (markAsRead) {
        thread.markRead();
      } 
      if (markAsRead == false){
        thread.markUnread();
      }
      if (archive) {
        thread.moveToArchive();
      }
      if (moveToInbox) {
        thread.moveToInbox();
      }
    });
    ContentService.createTextOutput("Updated Successfully").setMimeType(ContentService.MimeType.TEXT);
  }
  
  
  /* ------------------HELPER FUNCTIONS------------------------- */
  
  function cleanEmailContent(emailContent) {
    // Define a regular expression pattern to match long links
    var longLinkPattern = /<[^>]*https:\/\/[^>]*>/g;
  
    // Replace long links with a placeholder text
    var cleanedContent = emailContent.replace(longLinkPattern, "[Long Link Removed]");
  
    return cleanedContent;
  }
  
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
  
  // Function to create a draft reply to a specific email
  function draftReply(emailId, draftContent, replyAll) {
    var email = GmailApp.getMessageById(emailId);
    var draft;
    
    // Determine if it's a reply or a reply all
    if (replyAll) {
      draft = email.createDraftReplyAll(draftContent);
    } else {
      draft = email.createDraftReply(draftContent);
    }
    
    // Update the draft content
    // draft.setContent(draftContent);
    var draftId = draft.getId()
    var draftLink = "https://mail.google.com/mail/u/0/#drafts?compose="+draftId
    
    // Return draft ID and content
    var draft_response = {draftId: draftId, draftLink: draftLink, draftContent: draftContent}
    return ContentService.createTextOutput(JSON.stringify(draft_response))
  }
  
  // Function to get the context of a specific email
  function getEmailContext(emailId) {
    var email = GmailApp.getMessageById(emailId);
    var threadId = email.getThread().getId();
    var allEmails = [];
    
    // Retrieve all emails in the thread
    var threadEmails = GmailApp.getThreadById(threadId).getMessages();
    
    // Loop through each email in the thread
    for (var i = 0; i < threadEmails.length; i++) {
      var currentEmail = threadEmails[i];
      var emailContent = currentEmail.getPlainBody(); // You can change this to get HTML body if needed
      var sender = currentEmail.getFrom();
      var ccRecipients = currentEmail.getCc();
      var subject = currentEmail.getSubject();
      
      // Store email details in an object
      var emailDetails = {
        emailId: currentEmail.getId(),
        emailContent: cleanEmailContent(emailContent),
        sender: sender,
        ccRecipients: ccRecipients,
        subject: subject
      };
      
      // Push email details to the allEmails array
      allEmails.push(emailDetails);
    }
    
    // Return thread ID and all emails
    var emailContextResponse = {thread_id: threadId, allEmails: allEmails};
    return ContentService.createTextOutput(JSON.stringify(emailContextResponse))  
  }
  
  
  
  /* ------------------HELPER FUNCTIONS------------------------- */
  
  function cleanEmailContent(emailContent) {
    // Define a regular expression pattern to match long links
    var longLinkPattern = /<[^>]*https:\/\/[^>]*>/g;
  
    // Replace long links with a placeholder text
    var cleanedContent = emailContent.replace(longLinkPattern, "[Long Link Removed]");
  
    return cleanedContent;
  }
  
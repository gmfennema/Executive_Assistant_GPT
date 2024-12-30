# Google Workspace Executive Assistant GPT
This project gives a custom GPT the ability to interact with your Google Workspace Apps, essentially functioning as your executive assistant. It can currently do the following upon user request:

<img src="https://github.com/gmfennema/Executive_Assistant_GPT/blob/main/assets/overview_image.png" style="width: 600px" >


## Current Functionality
**Gmail**:
  - Access your inbox
  - Summarize email threads
  - Generate reply drafts
  - Mark emails as read/unread and archive them

**Google Calendar**:
  - View your current schedule
  - Create new events
  - Update existing events

**Google Tasks**:
  - View all task lists
  - Create and manage task lists
  - Add, update, and complete tasks
  - Move tasks between lists
  - Set due dates and add notes

**Personal CRM (Google Sheets)**:
  - View all contacts
  - Read profile details
  - Create new profiles
  - Update profiles

**Obsidian (Google Drive)**:
  - Browse vault structure
  - Search and preview notes
  - Create and edit markdown files
  - Organize folders and notes

## Example Use Cases

1) Email Triage
    - Give me a quick summary of new emails I received today
    - Archive anything that doesn't require a response
    - Create 5-minute time slots on my calendar starting at 4 pm to respond to anything that requires a response.
    - Link those emails in the event descriptions and then archive them

2) Task Management
    - Create a new task list called "Project Alpha"
    - Add three tasks due this week: "Research competitors", "Draft proposal", and "Schedule team meeting"
    - Move all completed tasks from "Personal" to "Archive" list
    - Show me all tasks due in the next 7 days

3) Knowledge Management
    - Create a new note in my Obsidian vault about the meeting with Tom
    - Search for all notes related to "project planning"
    - Move my project notes to the "Archive/2024" folder
    - Update Tom's CRM profile with the new information from our meeting

4) Calendar Organization
    - Show me my schedule for next week
    - Create recurring team meetings every Tuesday at 10 AM
    - Block out focus time for deep work every morning
    - Add reminders for upcoming task deadlines

5) Integrated Workflows
    - Read Tom's latest email about the project
    - Create tasks for all action items
    - Schedule a follow-up meeting
    - Update the project notes in Obsidian
    - Add key details to Tom's CRM profile

## Install Instructions

1) Make a copy of this [template](https://docs.google.com/spreadsheets/d/1KheU2VmuqmDsuuvq2kkn1AQuIQih-NKwP4j_WsfPBnM/template/preview)
2) Access the Apps Script code Extensions > Apps Script
3) Update the values on the `API Handler.gs` file
4) Deploy > New Deployment | Execute as Me | Anyone has access
5) Paste Instructions and YAML into your own custom GPT
6) Update security key to match App Script
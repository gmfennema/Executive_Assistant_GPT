# Google Workspace Executive Assistant GPT
This project gives a custom GPT the ability to interact with your Google Workspace Apps, essentially functioning as your executive assistant. It can currently do the following upon user request:

<img src="https://github.com/gmfennema/Executive_Assistant_GPT/assets/38080470/3f645195-b577-4e3d-9600-797f68aa816e" style="width: 600px" >


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

**Personal CRM (Google Sheets)**:
  - View all contacts
  - Read profile details
  - Create new profiles
  - Update profiles

## Example Use Cases

1) Email Triage
    - Give me a quick summary of new emails I received today
    - Archive anything that doesn't require a response
    - Create 5-minute time slots on my calendar starting at 4 pm to respond to anything that requires a response.
    - Link those emails in the event descriptions and then archive them

2) Remember Anything
    - Tom's birthday is April 20th
    - Update his CRM profile
    - Add it as an all-day event to my calendar

3) Extract Key Details
    - Read Tom's Christmas update email he sent 1 month ago
    - Extract all personal details
    - Update his CRM profile with relevant information

4) Speedy Response
    - Summarize the long email chain from Tom
    - Draft an encouraging response and give me the link

## Install Instructions

1) Make a copy of this [template](https://docs.google.com/spreadsheets/d/1KheU2VmuqmDsuuvq2kkn1AQuIQih-NKwP4j_WsfPBnM/template/preview)
2) Access the Apps Script code Extensions > Apps Script
3) Update the values on the `API Handler.gs` file
4) Deploy > New Deployment | Execute as Me | Anyone has access
5) Paste Instructions and YAML into your own custom GPT
6) Update security key to match App Script
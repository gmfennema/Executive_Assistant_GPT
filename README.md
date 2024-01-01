# Custom GPT Google Sheets Storage & Retrieval
Use Google Sheets to store persistant information across custom GPT conversations

## Use Cases

### Personal CRM
Create customized profiles for your contacts and access all the information in a conversational manner with your CRM GPT

#### Demo
##### Store Information
While this demo shows creating a profile and then adding information to it, GPT can handle mutiple types of instructions (Create, Add, Update, Retrieve)

[MOV to WEBM conversion (1).webm](https://github.com/gmfennema/CustomGPT-Google-Sheets-RAG/assets/38080470/b467d17e-f7d8-4b30-9c3a-a8b2d8732f16)

##### Retrieve Information
[MOV to WEBM conversion.webm](https://github.com/gmfennema/CustomGPT-Google-Sheets-RAG/assets/38080470/0c78ce7a-896e-48da-b870-67c91bf6ca3b)


#### Setup Instructions
1. Create your custom GPT and insert the instructions from the markdown file
2. Set a security key that you will use later and update the instructions with your security key
3. Create a new Google Sheet and paste the Appscript code (you may need to run a function to approve permissions)
4. Paste your security key in the appscript code
5. Publish your code as a public webapp and copy the public url
6. Paste the YAML into the custom GPT action along with the webapp url
7. Setup your Google Sheet with the following fields:
  -  A1 = *Template*
  -  B1 = *{"PersonalInformation":{"FirstName":"","LastName":"","BirthDetails":{"Birthday":"","BirthYear":"","BirthLocation":""},"CurrentLocation":"","FamilyMembers":[{"Name":"","Relationship":"","Occupation":"","CurrentLocation":"","OtherDetails":""}],"ContactDetails":{"WorkEmail":"","PersonalEmail":"","Phone":"","Website":"","Address":""},"InterestsAndHobbies":{"Books":[{"Title":"","Author":""}],"Movies_TVShows":[],"HobbiesAndInterests":[]},"SpecialConsiderations":{"PersonalityTests":{"LoveLanguage":"","StrengthsFinders":"","Eniagram":"","MyerBriggs":""},"GiftIdeas":[],"DietaryPreferences":[],"OtherPreferences":[]},"KeyLifeEvents":[{"EventName":"","EventDescription":"","TimeFrame":""}],"GoalsAndDreams":[],"Skills":[],"Religion":"","PoliticalViews":"","InspirationalFigures":"","FunFacts":""},"ProfessionalInformation":{"WorkHistory":[{"JobTitle":"","CompanyName":"","IsCurrentPosition":"","RoleDescription":"","StartDate":"","EndDate":""}],"Education":[{"SchoolName":"","SchoolLocation":"","Degree":"","DegreeDate":""}]},"Interactions":{"Recommendations":{"Books":[],"Movies":[],"TVShows":[],"Other":[]},"ItemsToFollowUpOn":[],"GiftsRecieved":[],"SummaryOfLastInteraction":"","MemorableQuotes":""}}*

### Personal Notetaker
_Coming Soon_

### Personal Research Assistant
_Coming Soon_

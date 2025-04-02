# Brandinfluencer App

|Tool                | Description                    | Tags for tools used                                                                                               |
| ------------------- | ------------------------------ | ---------------------------------------------------------------------------------------------------- |
| 1.GitHub| Version Control| [Version-Control]; [Repository];|
| 2.Next Js| Front End Framework| [Typescript];|
| 3.Nest Js |  Javascript Based Backend Framework| [Javascript];|
| 4.ESLint| Linting Framework| [Lint]; [syntax];|
| 5.MongoDB | Not Only Relational Database| [Not Only relational Integrity]; [Database];|
| 6.TailWind | Open Css Framework| [Css]; [Style Sheet];|
| 7.Passport | Authentication Middleware| [Authentication]; [Middleware];|
| 8.RxJs | State Management Library| [state];|
| 9.Ethereal | Fake Email Server| [smtp]; [Email];|

## <h1> Description</h1>
<p>The aim of the project is to build a brand-influencer app that allow brands to connect to influencers to monitor active campaigns so that an influencer can view ongoing campaigns, track submission statuses, and monitor their performance while brands/SMEs to monitor influencers' participation in campaigns and approve/reject submissions..</p>

## <h1> Set up Instructions</h1>
<p><b>Github</b></p>
<ul>
<li> Download the Zip file from the code tab on github to get the project Zip files (Recommended)</li>
<li> Clone the project using 'git clone https://github.com/yourusername/yourproject.git'.</li>
<li> Unzip the file and add the Project folder to your IDE/Compiler</li>
</ul>

<p><b>Nest Js</b></p>
The backend is built using Nest Js .node v21.4.0 (npm v10.2.4)
<ul>
1. Install the required dependencies using the commands 

```bash
npm install
```

2. For scripts and detailed instructions on NestJs VISIT: [this README](backend/README.md)

</ul>

<p><b>Nest Js</b></p>
The frontend was build using NextJs .node v21.4.0 (npm v10.2.4)

1. Install the required dependencies using the commands 

```bash
npm install
```

2. For scripts and detailed instructions on NextJs VISIT: [this README](frontend/README.md)

## <h1> Endpoints </h1>

1. Register User POST: http://localhost:4000/auth/influencer/register
            Super User POST: http://localhost:4000/admin/create-superuser           
    {
    "username": "john_doe",
    "email": "john@example.com",
    "role": "influencer",
    "password": "your_password",
    "confirmPassword": "your_password"
    }

2. Login user: POST: http://localhost:4000/auth/influencer/login
    {
    "username": "john_doe",
    "email": "john@example.com",
    "password": "your_password",
    "confirmPassword": "your_password"
    }

3. Brand register: POST:http://localhost:4000/auth/brand/register
    {
    "username": "example corp",
    "email": "examplecorp@example.com",
    "password": "securepassword123",
    "confirmPassword": "securepassword123",
    "name": "ecorp",
    "description": "An example of a corp",
        "website": "www.example.com",
        "logoUrl": "www.example.com",
        "contactInfo": {
            "phone": "+254798472473423",
            "address": "Kilimani,Nairobi"
            }
        }

4. Brand login: POST: http://localhost:4000/auth/brand/login
    {
    "username": "example corp",
    "email": "examplecorp@example.com",
    "password": "securepassword123",
    "confirmPassword": "securepassword123",
    }

2. Create Campaign: POST: http://localhost:4000/campaign
    Make sure campaigns are within the correct range in relation to the current date
    for the campaign to be active.
    Only brand users can create campaigns
    {
    "title": "Sample Campaign",
    "instructions": "Upload your content.",
    "startDate": "2025-06-01T00:00:00Z",
    "endDate": "2025-06-01T07:00:00Z",
    "images": ["image1.jpg", "image2.jpg"],
    "status": "active"
    }

3. Join Campaign as influencer:
    POST: http://localhost:4000/campaign/{campaignId}/join
    Headers: Add the Authorization header with the value Bearer your-jwt-token.
    Body (Form-data):
    Key: file (upload a file)
    Key: content (write the content of the submission)

3. Create submission by influencer:
    POST: http://localhost:4000/campaign/{campaignId}/submissions
    Headers: Add the Authorization header with the value Bearer your-jwt-token.
    Body (Form-data):
    Key: file (upload a file)
    Key: content (write the content of the submission)

    payload:
    file: your_uploaded_file.jpg
    content: "This is the content of my submission."
    submissionData: { "key1": "value1", "key2": "value2" }

3. Campaign List Page: GET: http://localhost:4000/campaign
      payload: use Token.

4. Get Individual campaign by ID: GET: http://localhost:4000/campaign/ID

5. Get submission: GET:http://localhost:4000/campaign/:id/submissions

6. Get influencer by campaign:  http://localhost:4000/campaign/:id/influencers

7. Refresh Token: http://localhost:4000/auth/refresh

## <h1> Figma Designs </h1>
https://www.figma.com/design/j0J8gezE9uhoGrCG9dvzPe/Untitled?node-id=1001-2&t=bwG3VeJPii4DMXfm-1

## <h1> Sample Designs </h1>
![Landing Page](<frontend/public/images/screenshots/Screenshot 2025-01-23 175801.png>)
![Brand Dashboard - influencers](<frontend/public/images/screenshots/Screenshot 2025-01-17 205240.png>)
![Brand Dashboard - campaigns](<frontend/public/images/screenshots/Screenshot 2025-02-03 154431.png>)
![Influencer Dashboard](<frontend/public/images/screenshots/Screenshot 2025-01-17 231458.png>)

## <h1> Author </h1>
Built by <b>Andrew Indeche</b>
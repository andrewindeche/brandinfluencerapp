# Brandinfluencer App

|Tool                | Description                    | Tags for tools used                                                                                               |
| ------------------- | ------------------------------ | ---------------------------------------------------------------------------------------------------- |
| 1.GitHub| Version Control| [Version-Control]; [Repository];|
| 2.Next Js| Front End Framework| [Typescript];|
| 3.Nest Js |  Javascript Based Backend Framework| [Javascript];|
| 4.ESLint| Linting Framework| [Lint]; [syntax];|
| 5.MongoDB | Not Only Relational Database| [Not Only relational Integrity]; [Database];|

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

1. Register User: http://localhost:3000/auth/register
    {
    "username": "john_doe",
    "email": "john@example.com",
    "password": "your_password"
    }

2. Login user: http://localhost:3000/auth/login
    {
    "username": "john_doe",
    "email": "john@example.com",
    "password": "your_password"
    }

## <h1> Author </h1>
Built by <b>Andrew Indeche</b>
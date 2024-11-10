## Help Desk Ticketing System
A fully functional Help Desk Ticketing System that allows users to submit support tickets, IT staff to manage tickets, and administrators to update and resolve issues. The project demonstrates full-stack development, role-based access control, and secure deployment on Google Cloud Platform (GCP).


## Features

User Registration and Authentication: Users can register and log in, with passwords securely hashed using bcrypt.

Role-Based Access Control: Regular users can create and view tickets, while admins can update and delete tickets.

CRUD Operations for Tickets: Users can create tickets with details like title, description, urgency, and category. Admins can update ticket status or delete tickets.

Email Notifications: Users receive email notifications upon ticket creation and status updates.

Filtering and Searching: Tickets can be filtered by urgency and status for easy management.

Cloud Deployment: The application is deployed on Google Cloud Platform using Nginx as a reverse proxy and PM2 for process management.

## Technologies Used

Frontend: HTML, CSS, JavaScript
Backend: Node.js, Express, SQLite3
Authentication: JSON Web Tokens (JWT), bcrypt
Email Notifications: Nodemailer
Deployment: Google Cloud Platform (GCP), Nginx, PM2

## Setup and Installation
Clone the repository:

bash

git clone https://github.com/JustinRLew/helpdesk-system.git
cd helpdesk-system
Navigate to the backend folder:

bash

cd backend
Install dependencies:

bash

npm install express sqlite3 bcryptjs jsonwebtoken dotenv nodemailer
Create the .env file (see Environment Variables section).

Set up the SQLite database:

Ensure server.js includes SQL to create the necessary users and tickets tables if they don’t already exist.
Run the application:

bash

node server.js
The server should now be running on http://localhost:3000.
Environment Variables
Create a .env file in the backend directory with the following contents:

plaintext

JWT_SECRET=your_generated_secret_here
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-password
JWT_SECRET: A secure, random string used to sign JWT tokens.
EMAIL_USER: Email address for sending notifications.
EMAIL_PASS: Password or app-specific password for the email account.
Usage
Register and Log In:

Open index.html in a browser to register a new user or log in.
Admin users can update and delete tickets; regular users have restricted access.
Create and Manage Tickets:

Navigate to dashboard.html to submit a new ticket. Tickets can be filtered by status and urgency.
Admin users can update ticket status (e.g., “In Progress”, “Resolved”) or delete tickets as needed.
Email Notifications:

Users receive email confirmations upon ticket submission and status updates.

## Deployment
Set up a Google Cloud Platform (GCP) VM:

Create a new Compute Engine VM on GCP, using Ubuntu 22.04.
Configure the VM with Node.js, npm, and SQLite3.
Transfer project files and environment variables to the VM.

Set up Nginx as a reverse proxy:

Configure Nginx to route traffic from port 80 to the Node.js server on port 3000.
Add your domain in the server_name directive of the Nginx config file.
Install and Configure PM2:

Use PM2 to keep the application running continuously:
bash

sudo npm install -g pm2
pm2 start server.js
pm2 save
pm2 startup

## Future Improvements
Analytics and Reporting: Add a dashboard for tracking ticket metrics like average resolution time and category distribution.

Automated Ticket Assignment and Escalation: Route tickets to staff based on urgency or category and implement automated escalation for unresolved tickets.

Multi-Channel Support: Allow users to submit tickets via email or live chat, with messages converted into tickets in the system.

## License
This project is open-source and available under the MIT License.

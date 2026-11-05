# CarePoint — Hospital Appointment Management System

A responsive full-stack CRUD project built with **HTML, CSS, JavaScript, Node.js, Express and MySQL**.

## Database structure

The project uses **one database named `hospital` containing three tables**:
- `patients`
- `doctors`
- `appointments`

The three tables are related using foreign keys. If your assignment literally requires three separate databases rather than three tables, confirm that with your lecturer; this project follows the supplied schema.

## Features
- Add, view, edit and delete patients.
- Add, view, edit and delete doctors.
- Search doctors by name and specialization; filter by specialization.
- Book appointments by selecting an existing patient and doctor.
- Update appointment status: Pending, Confirmed, Completed or Cancelled.
- View appointment details with patient and doctor names.
- Dashboard counts and responsive layout.

## Requirements
Install Node.js (LTS), MySQL Server and Visual Studio Code.

## Step-by-step setup in VS Code

1. Extract `Hospital_Appointment_Management_System.zip`.
2. Open VS Code → **File → Open Folder** → select the extracted `Hospital_Appointment_Management_System` folder.
3. Start MySQL Server. Open MySQL Workbench or the MySQL command line.
4. Run the complete contents of `database.sql`. In MySQL Workbench: open the file, click the lightning bolt, and confirm that the `hospital` database and its three tables are created.
5. In VS Code, open **Terminal → New Terminal**. Make sure the terminal is in the project folder (the folder containing `server.js`).
6. Install packages:
   ```bash
   npm install
   ```
7. Create your local environment file:
   - Copy `.env.example`.
   - Rename the copy to `.env` (exactly `.env`, not `.env.txt`).
   - Set `DB_USER`, `DB_PASSWORD` and other values to match your MySQL setup. Example:
     ```env
     DB_HOST=localhost
     DB_USER=root
     DB_PASSWORD=your_actual_mysql_password
     DB_NAME=hospital
     PORT=3000
     ```
   - If your MySQL root account has no password, leave `DB_PASSWORD=` blank.
8. Start the server:
   ```bash
   npm start
   ```
9. Open a browser and visit **http://localhost:3000**.
10. Add patients and doctors first. Then book appointments. Use the Edit/Delete buttons and appointment status dropdown to test CRUD operations.

## Check the connection
Open `http://localhost:3000/api/health`. A successful response is:
```json
{"message":"API and MySQL connected"}
```
If you see a connection error, check that MySQL is running and that `.env` contains the correct username and password.

## CRUD API routes

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/patients` | List patients |
| POST | `/api/patients` | Add patient |
| PUT | `/api/patients/:id` | Update patient |
| DELETE | `/api/patients/:id` | Delete patient |
| GET | `/api/doctors` | List doctors |
| GET | `/api/doctors?specialization=cardio` | Search doctors |
| POST | `/api/doctors` | Add doctor |
| PUT | `/api/doctors/:id` | Update doctor |
| DELETE | `/api/doctors/:id` | Delete doctor |
| GET | `/api/appointments` | List appointments |
| POST | `/api/appointments` | Book appointment |
| PUT | `/api/appointments/:id` | Update appointment/status |
| DELETE | `/api/appointments/:id` | Delete appointment |

## Upload project to GitHub

1. Create/sign in to your GitHub account.
2. Click **New repository**. Name it `Hospital-Appointment-Management-System`.
3. Choose Public or Private, then click **Create repository**. Do not initialize another README if you plan to push this existing project.
4. In VS Code open the project terminal and run:
   ```bash
   git init
   git add .
   git commit -m "Initial hospital appointment management system"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/Hospital-Appointment-Management-System.git
   git push -u origin main
   ```
5. Replace `YOUR-USERNAME` with your GitHub username. Refresh the repository page to verify the files.

### Important GitHub safety
- `.gitignore` excludes `.env`, `node_modules` and other local-only files. Never upload your MySQL password.
- If Git is not recognized, install Git for Windows, restart VS Code, and run `git --version`.
- If GitHub asks you to authenticate, complete the browser sign-in prompt.

## Troubleshooting
- **ER_ACCESS_DENIED_ERROR**: check MySQL username/password in `.env`.
- **Unknown database 'hospital'**: run `database.sql`.
- **ECONNREFUSED**: start MySQL Server and verify host/port.
- **Cannot find module**: run `npm install` in the same folder as `package.json`.
- **Port 3000 in use**: change `PORT=3001` in `.env`, restart, then visit `http://localhost:3001`.

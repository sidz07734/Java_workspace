Java Workspace - Coding Environment for Students
A web-based coding environment designed for students to submit and analyze their Java code with real-time feedback. This platform facilitates learning by providing an intuitive interface for code submission, execution, and instructor feedback.
Features

Code Editing: Browser-based code editor with syntax highlighting and autocompletion
File Management: Upload, save, and organize Java files
Code Execution: Run Java code directly in the browser
Teacher Dashboard: Monitor student submissions and provide feedback
Responsive Design: Works on desktop and mobile devices

Tech Stack

Frontend: HTML, CSS, JavaScript
Backend: Node.js
CI/CD: GitHub Actions

Project Structure
JAVA_WORKSPACE/
├── .github/workflows/      # CI/CD configuration
├── codespace-backend/      # Backend server code
│   └── node_modules/       # Node.js dependencies
├── public/                 # Frontend assets
│   ├── codespace.css       # Main stylesheet
│   ├── codespace.html      # Code editor page
│   ├── codespace.js        # Frontend JavaScript
│   ├── index.html          # Landing page
│   ├── script.js           # General JavaScript
│   └── styles.css          # Additional styles
├── Data/                   # Data storage
└── Uploads/                # User uploads
Setup Instructions

Clone the repository
bashgit clone https://github.com/sidz07734/Java_workspace.git
cd Java_workspace

Install backend dependencies
bashcd codespace-backend
npm install

Install frontend dependencies
bashcd ../public
npm install

Start the server
bashcd ..
node codespace-backend/server.js

Access the application
Open http://localhost:8080 in your browser


Continuous Integration/Continuous Deployment
This project uses GitHub Actions for CI/CD pipeline:

Automated testing on code changes
Continuous deployment to production on main branch updates
Quality assurance through linting and unit tests

Contributing
Contributions are welcome! Please feel free to submit a Pull Request.
License
MIT

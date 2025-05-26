# CodeSpace - Java Code Learning Platform

A web-based platform for students to write, analyze, and learn Java programming with AI-powered code analysis using Ollama.

## Features

- 🎓 Student portal for writing and analyzing Java code
- 🤖 AI-powered code analysis using Ollama (Phi-3.5 model)
- 👨‍🏫 Teacher dashboard for monitoring student progress
- 💾 Code submission history and tracking
- 🔐 Secure authentication system
- 🐳 Docker support for easy deployment

## Prerequisites

- Node.js 18+ 
- MySQL 8.0+
- Ollama (for AI code analysis)
- Docker & Docker Compose (optional, for containerized deployment)

## Quick Start (Local Development)

1. **Clone the repository and navigate to backend**
   ```bash
   cd codespace-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Set up the database**
   ```bash
   mysql -u root -p
   # Run the SQL commands from database/init.sql
   ```

5. **Install and start Ollama**
   ```bash
   # Install Ollama
   curl -fsSL https://ollama.ai/install.sh | sh
   
   # Start Ollama service
   ollama serve
   
   # Pull the Phi-3.5 model
   ollama pull phi3.5
   ```

6. **Start the application**
   ```bash
   npm start
   # Or for development with auto-reload
   npm run dev
   ```

7. **Access the application**
   - Student Portal: http://localhost:3001
   - Login with:
     - Teacher: `Teacher` / `Password01`
     - Students: `1ms22cs143` / `password143` (or other student accounts)

## Docker Deployment (Recommended)

1. **Build and start all services**
   ```bash
   docker-compose up -d
   ```

   This will automatically:
   - Build the Node.js application
   - Start MySQL with the database schema
   - Start Ollama and pull the Phi-3.5 model
   - Link all services together

2. **View logs**
   ```bash
   docker-compose logs -f
   ```

3. **Stop all services**
   ```bash
   docker-compose down
   ```

## CI/CD Pipeline

The project includes GitHub Actions workflow that:
- Runs tests on every push/PR
- Builds Docker images
- Deploys to production (when configured)

### Setting up CI/CD

1. Add these secrets to your GitHub repository:
   - `DOCKER_USERNAME`: Docker Hub username
   - `DOCKER_PASSWORD`: Docker Hub password
   - `DEPLOY_HOST`: Production server IP/hostname
   - `DEPLOY_USER`: SSH username
   - `DEPLOY_KEY`: SSH private key

2. Push to main branch to trigger deployment

## Project Structure

```
codespace-backend/
├── .github/workflows/    # CI/CD pipeline
├── database/            # Database schema
├── public/              # Frontend files
│   ├── index.html       # Login page
│   ├── codespace.html   # Student interface
│   └── teacher-dashboard.html # Teacher interface
├── .env                 # Environment variables (create from .env.example)
├── .gitignore          # Git ignore rules
├── docker-compose.yml   # Docker composition
├── Dockerfile          # Docker image definition
├── package.json        # Node.js dependencies
├── README.md           # This file
└── server.js           # Main application server
```

## Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start development server with auto-reload
- `npm test` - Run tests
- `npm run lint` - Run code linting

## API Endpoints

### Authentication
- `POST /login` - User login
- `GET /logout` - User logout
- `GET /check-admin` - Check admin status

### Student Routes
- `POST /analyze-code` - Analyze Java code with AI
- `POST /save-code` - Save code submission
- `GET /get-saved-code` - Get user's saved codes
- `GET /get-code/:id` - Get specific code entry
- `DELETE /delete-code/:id` - Delete code entry

### Teacher/Admin Routes
- `GET /admin/dashboard-stats` - Dashboard statistics
- `GET /admin/students` - List all students
- `GET /admin/search-student` - Search students
- `GET /admin/student-codes/:studentId` - View student's codes

## Troubleshooting

### Ollama not responding
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Restart Ollama
ollama serve

# Ensure Phi-3.5 model is installed
ollama list
ollama pull phi3.5
```

### Database connection issues
- Check MySQL is running: `sudo systemctl status mysql`
- Verify credentials in `.env` file
- Ensure database `codespace_db` exists

### Port conflicts
- Change port in `.env` file if 3001 is already in use
- Update `docker-compose.yml` port mapping if needed

## Security Considerations

- Change default passwords before deploying to production
- Use strong `SESSION_SECRET` in production
- Enable HTTPS in production
- Regularly update dependencies: `npm audit fix`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the ISC License.
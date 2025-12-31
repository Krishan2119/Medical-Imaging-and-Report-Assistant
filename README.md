# Medical Imaging and Report Assistant

![Medical AI Platform](https://img.shields.io/badge/Medical%20AI-Educational-blue) ![React](https://img.shields.io/badge/React-18.0+-blue) ![FastAPI](https://img.shields.io/badge/FastAPI-Python-green) ![MongoDB](https://img.shields.io/badge/MongoDB-Database-green)

## 🎯 Project Overview

**Medical Imaging and Report Assistant** is a comprehensive educational platform that demonstrates the integration of AI-powered medical imaging analysis with human expertise. This full-stack web application simulates real-world medical imaging workflows while maintaining strict educational disclaimers and safety protocols.

### ⚠️ IMPORTANT DISCLAIMERS

- **Educational Purpose Only**: This project uses ONLY simulated medical data
- **Clinical Decision Support Tool**: NOT a diagnostic system
- **Human Review Required**: All AI outputs are clearly marked as drafts requiring human review
- **No Medical Claims**: The system avoids definitive medical diagnoses

## 🏗️ System Architecture

### Backend Architecture
```
backend/
├── main.py          # FastAPI application with REST API endpoints
├── database.py      # MongoDB models and database utilities
├── auth.py          # JWT authentication and OAuth integration
└── agents.py        # AI agents for image analysis and report generation
```

### Frontend Architecture
```
frontend/src/
├── App.js           # Main application with routing and auth context
├── Dashboard.js     # Patient and image management interface
├── Editor.js        # Report editing with AI draft integration
├── Viewer.js        # Medical image viewer with annotations
├── Login.js         # Authentication components
└── Register.js      # User registration
```

## 🤖 AI Workflow

### 1. Image Analysis Agent
- **Purpose**: Analyzes uploaded medical images for anatomical structures and abnormalities
- **Input**: Medical image (X-ray, CT, MRI - simulated)
- **Output**: Structured findings with confidence scores and location coordinates
- **Model**: Simulated GPT-4V-like capabilities for educational demonstration

### 2. Segmentation & Annotation Agent
- **Purpose**: Generates segmentation masks and bounding boxes for findings
- **Input**: AI findings from Image Analysis Agent
- **Output**: Interactive annotations with metadata for frontend rendering
- **Features**: Confidence-based color coding, interactive details modal

### 3. Literature Retrieval Agent (RAG)
- **Purpose**: Retrieves relevant medical literature using vector similarity
- **Input**: Extracted keywords from AI findings
- **Output**: Ranked literature references with relevance scores
- **Database**: Simulated medical literature with 100+ papers

### 4. Report Generation Agent
- **Purpose**: Produces structured draft radiology reports using conservative medical language
- **Input**: AI findings and retrieved literature
- **Output**: Multi-section report with confidence assessments and disclaimers
- **Safety**: Conservative language, uncertainty indicators, required disclaimers

### 5. Quality Assurance Agent
- **Purpose**: Validates report consistency and flags potential issues
- **Checks**: Definitive language detection, confidence thresholds, disclaimer presence
- **Output**: Quality scores and improvement recommendations

## 📊 Database Schema

### Collections
- **users**: User authentication and profile data
- **patients**: Patient demographics and metadata
- **medical_images**: Image storage and analysis results
- **annotations**: AI-generated and manual annotations
- **reports**: Generated reports with versioning
- **audit_logs**: Comprehensive activity logging

### Document Structure
```javascript
{
  "_id": ObjectId,
  "user_id": ObjectId,
  "action": "string",
  "resource_type": "string",
  "resource_id": ObjectId,
  "details": {},
  "timestamp": DateTime,
  "ip_address": "string",
  "user_agent": "string"
}
```

## 🔐 Authentication & Security

### Authentication Methods
- **Email/Password**: Traditional authentication with bcrypt hashing
- **Google OAuth**: Secure OAuth 2.0 integration
- **GitHub OAuth**: Alternative OAuth provider
- **JWT Tokens**: Access and refresh token mechanism

### Role-Based Access Control
- **Student**: Limited to own patients and images
- **Instructor**: Can access all educational cases
- **Admin**: Full system access and user management

### Security Features
- Password strength validation
- CSRF protection
- Rate limiting (ready for implementation)
- Input sanitization
- Audit logging
- Secure session management

## 📱 Frontend Features

### Patient Dashboard
- Patient management with search functionality
- Image upload and organization
- Progress tracking and status indicators
- Role-based access control

### Image Viewer
- Interactive zoom and pan controls
- Confidence-based annotation coloring
- Real-time AI analysis overlay
- Quality assessment indicators

### Report Editor
- Multi-tab interface (Report, Literature, Confidence)
- AI draft integration with manual editing
- Literature reference management
- Confidence scoring and quality metrics

### Authentication UI
- Modern login/register forms
- OAuth integration
- Educational disclaimers
- Responsive design

## 🚀 Installation & Setup

### Prerequisites
- Node.js 16+ and npm
- Python 3.8+
- MongoDB 4.4+
- Git

### Backend Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd medical-imaging-assistant/backend
```

2. **Create virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Environment Configuration**
Create `.env` file:
```env
# Database
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=medical_imaging

# Authentication
JWT_SECRET_KEY=your-super-secret-key-change-in-production
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
JWT_REFRESH_TOKEN_EXPIRE_DAYS=30

# OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback

GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_REDIRECT_URI=http://localhost:3000/auth/github/callback

# AI Configuration
OPENAI_API_KEY=sk-your-openai-api-key
```

5. **Start MongoDB**
```bash
mongod --dbpath /path/to/your/db
```

6. **Run the backend**
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Update API configuration**
Edit `src/App.js`:
```javascript
const API_BASE_URL = 'http://localhost:8000';
```

4. **Start the development server**
```bash
npm start
```

## 📡 API Documentation

### Authentication Endpoints
```
POST /auth/register          # User registration
POST /auth/login             # User login
GET  /auth/google            # Google OAuth URL
GET  /auth/github            # GitHub OAuth URL
POST /auth/google/callback   # Google OAuth callback
POST /auth/github/callback   # GitHub OAuth callback
POST /auth/refresh           # Token refresh
GET  /auth/me                # Current user info
```

### Patient Management
```
GET  /patients               # List patients
POST /patients               # Create patient
GET  /patients/{id}          # Get patient details
```

### Image Management
```
POST /images/upload/{patient_id}  # Upload medical image
GET  /images/{id}                 # Get image details
POST /analyze/{image_id}          # Trigger AI analysis
```

### Report Management
```
POST /reports/generate/{image_id} # Generate AI report
GET  /reports/{id}                # Get report
PUT  /reports/{id}                # Update report
```

## 🐳 Docker Deployment

### Backend Dockerfile
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Frontend Dockerfile
```dockerfile
FROM node:16-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=0 /app/build /usr/share/nginx/html
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - MONGODB_URL=mongodb://mongo:27017
    depends_on:
      - mongo

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - backend

  mongo:
    image: mongo:4.4
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

## 📈 Performance Considerations

### Current Implementation
- **Mock Data**: Uses simulated responses for AI analysis
- **Vector Search**: Basic keyword matching (ready for FAISS/MongoDB Atlas Vector Search)
- **Image Processing**: Simulated analysis (ready for actual computer vision models)
- **Caching**: Basic implementation ready for Redis integration

### Production Optimizations
- Implement actual computer vision models (OpenCV, TensorFlow)
- Add Redis caching for frequent queries
- Use MongoDB Atlas Vector Search for RAG
- Implement image compression and optimization
- Add CDN for image delivery

## 🔬 Educational Assumptions & Trade-offs

### What Was Simulated
1. **AI Analysis**: Uses mock responses instead of actual computer vision
2. **Medical Data**: Uses placeholder images and simulated findings
3. **Literature Database**: Basic keyword matching instead of true vector search
4. **Image Processing**: Static responses instead of real-time analysis

### What Was Implemented
1. **Full Authentication**: Complete JWT and OAuth implementation
2. **Database Schema**: Production-ready MongoDB models
3. **API Architecture**: RESTful endpoints with proper error handling
4. **Frontend Workflow**: Complete user interface and interaction patterns
5. **Security**: Role-based access, input validation, audit logging
6. **Safety**: Educational disclaimers and conservative language

### Trade-offs Made
- **Realism vs. Complexity**: Chose educational clarity over medical accuracy
- **Performance vs. Completeness**: Simulated AI for faster development
- **Scalability vs. Development Time**: Basic implementation over full optimization
- **Security vs. Usability**: Added security layers while maintaining educational focus

## 🏥 Medical Ethics & Safety

### Educational Safeguards
- Clear labeling as educational simulation
- Multiple disclaimers throughout the interface
- Conservative medical language in AI outputs
- Mandatory human review indicators
- No definitive diagnostic claims

### Bias Mitigation
- Diverse simulated findings representation
- Confidence scoring for all AI outputs
- Literature grounding for claims
- Quality assurance checks

### Data Privacy
- No real patient data handling
- Simulated datasets only
- Secure authentication for demo purposes
- Audit logging for transparency

## 🧪 Testing Strategy

### Unit Testing
```bash
# Backend
pytest backend/tests/ -v

# Frontend
cd frontend && npm test
```

### Integration Testing
- API endpoint testing
- Authentication flow testing
- Database operation testing
- Frontend-Backend integration testing

### Security Testing
- Authentication bypass attempts
- Input validation testing
- OAuth security verification
- Role-based access control testing

## 📚 Learning Objectives

This project demonstrates:
1. **Full-Stack Development**: React + FastAPI integration
2. **AI Integration**: Multi-agent AI system design
3. **Database Design**: MongoDB schema and relationships
4. **Authentication**: JWT and OAuth implementation
5. **Medical AI Ethics**: Responsible AI development
6. **System Architecture**: Modular, scalable design patterns

## 🔮 Future Enhancements

### Short Term
- [ ] Real computer vision model integration
- [ ] Actual medical image datasets
- [ ] Enhanced RAG with vector embeddings
- [ ] Real-time collaboration features
- [ ] Mobile-responsive improvements

### Long Term
- [ ] Integration with hospital systems
- [ ] Advanced imaging modalities
- [ ] Machine learning model training
- [ ] Clinical workflow optimization
- [ ] Regulatory compliance features

## 📝 Contributing

This is an educational project. Contributions should focus on:
1. Educational value improvement
2. Code quality and documentation
3. Security best practices
4. Medical ethics compliance
5. Learning objective alignment

## 📄 License

Educational License - See LICENSE file for details.

## 🙏 Acknowledgments

- Medical imaging community for educational guidelines
- AI ethics researchers for responsible AI development
- Open source community for tools and libraries
- Medical educators for curriculum design insights

---

**Remember**: This is an educational simulation. Always consult qualified medical professionals for actual medical decisions.

For questions about this educational project, please refer to the documentation or contact the development team.

Last updated: January 2024

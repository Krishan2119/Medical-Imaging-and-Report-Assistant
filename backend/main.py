from fastapi import FastAPI, UploadFile, File, Depends, HTTPException, status, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import database
import auth
import schemas
import agents
import shutil
import os
from datetime import datetime
from typing import List, Optional
from bson import ObjectId

app = FastAPI(title="Medical Imaging Assistant API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()

@app.on_event("startup")
async def startup():
    await database.db.connect_db()
    print("Database connected successfully")

@app.on_event("shutdown")
async def shutdown():
    await database.db.close_db()
    print("Database disconnected")

# Authentication endpoints
@app.post("/auth/register", response_model=schemas.APIResponse)
async def register_user(user_data: schemas.UserCreate):
    try:
        # Check if user already exists
        existing_user = await database.get_user_by_email(user_data.email)
        if existing_user:
            raise HTTPException(
                status_code=400, 
                detail="User with this email already exists"
            )
        
        # Create new user
        user_dict = user_data.dict()
        user_dict["created_at"] = datetime.utcnow()
        user_dict["is_active"] = True
        user_id = await database.create_user(user_dict)
        
        return schemas.APIResponse(
            success=True,
            message="User registered successfully",
            data={"user_id": user_id}
        )
    except Exception as e:
        return schemas.APIResponse(
            success=False,
            message="Registration failed",
            errors=[str(e)]
        )

@app.post("/auth/login", response_model=schemas.APIResponse)
async def login(login_data: schemas.LoginRequest):
    try:
        # Simple authentication for demo - in production, verify password hash
        user = await database.get_user_by_email(login_data.email)
        if not user:
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password"
            )
        
        # Create access token
        token_data = {
            "sub": user["email"],
            "user_id": str(user["_id"]),
            "role": user["role"]
        }
        token = auth.create_access_token(token_data)
        
        # Update last login
        await database.db.get_collection("users").update_one(
            {"_id": user["_id"]},
            {"$set": {"last_login": datetime.utcnow()}}
        )
        
        return schemas.APIResponse(
            success=True,
            message="Login successful",
            data={
                "access_token": token,
                "token_type": "bearer",
                "expires_in": 86400,
                "user": schemas.UserResponse(**{k: v for k, v in user.items() if k != "password"})
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        return schemas.APIResponse(
            success=False,
            message="Login failed",
            errors=[str(e)]
        )

# Patient management endpoints
@app.post("/patients/", response_model=schemas.APIResponse)
async def create_patient_record(
    patient_data: schemas.PatientCreate,
    current_user=Depends(auth.RoleChecker([schemas.UserRole.STUDENT, schemas.UserRole.INSTRUCTOR, schemas.UserRole.ADMIN]))
):
    try:
        # Check if patient ID already exists
        existing_patient = await database.get_patient_by_id(patient_data.patient_id)
        if existing_patient:
            raise HTTPException(
                status_code=400,
                detail="Patient with this ID already exists"
            )
        
        # Create patient record
        patient_dict = patient_data.dict()
        patient_dict["created_by"] = current_user["user_id"]
        patient_dict["created_at"] = datetime.utcnow()
        patient_id = await database.create_patient(patient_dict)
        
        # Create audit log
        await database.create_audit_log({
            "user_id": current_user["user_id"],
            "action": "create_patient",
            "resource_type": "patient",
            "resource_id": patient_id,
            "timestamp": datetime.utcnow(),
            "details": {"patient_id": patient_data.patient_id}
        })
        
        return schemas.APIResponse(
            success=True,
            message="Patient created successfully",
            data={"patient_id": patient_id}
        )
    except HTTPException:
        raise
    except Exception as e:
        return schemas.APIResponse(
            success=False,
            message="Failed to create patient",
            errors=[str(e)]
        )

@app.get("/patients/", response_model=schemas.APIResponse)
async def get_patients(
    skip: int = 0,
    limit: int = 100,
    current_user=Depends(auth.RoleChecker([schemas.UserRole.STUDENT, schemas.UserRole.INSTRUCTOR, schemas.UserRole.ADMIN]))
):
    try:
        patients = await database.get_patients_by_user(current_user["user_id"])
        return schemas.APIResponse(
            success=True,
            message="Patients retrieved successfully",
            data=patients[skip:skip + limit]
        )
    except Exception as e:
        return schemas.APIResponse(
            success=False,
            message="Failed to retrieve patients",
            errors=[str(e)]
        )

# Medical image endpoints
@app.post("/images/upload", response_model=schemas.APIResponse)
async def upload_medical_image(
    file: UploadFile = File(...),
    patient_id: str = Form(...),
    study_type: schemas.StudyType = Form(...),
    description: Optional[str] = Form(None),
    current_user=Depends(auth.RoleChecker([schemas.UserRole.STUDENT, schemas.UserRole.INSTRUCTOR, schemas.UserRole.ADMIN]))
):
    try:
        # Validate file type
        if not file.filename.lower().endswith(('.png', '.jpg', '.jpeg', '.tiff', '.dicom')):
            raise HTTPException(
                status_code=400,
                detail="Unsupported file type. Please upload PNG, JPG, TIFF, or DICOM files."
            )
        
        # Save file
        os.makedirs("uploads", exist_ok=True)
        file_path = f"uploads/{file.filename}"
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Create image record
        image_data = {
            "patient_id": patient_id,
            "study_type": study_type,
            "description": description,
            "file_name": file.filename,
            "file_type": file.content_type or "unknown",
            "file_size": file.size or 0,
            "image_url": f"http://localhost:8000/{file_path}",
            "uploaded_by": current_user["user_id"],
            "created_at": datetime.utcnow()
        }
        
        image_id = await database.create_medical_image(image_data)
        
        # Create audit log
        await database.create_audit_log({
            "user_id": current_user["user_id"],
            "action": "upload_image",
            "resource_type": "image",
            "resource_id": image_id,
            "timestamp": datetime.utcnow(),
            "details": {"filename": file.filename, "patient_id": patient_id}
        })
        
        return schemas.APIResponse(
            success=True,
            message="Image uploaded successfully",
            data={"image_id": image_id, "file_path": file_path}
        )
    except HTTPException:
        raise
    except Exception as e:
        return schemas.APIResponse(
            success=False,
            message="Failed to upload image",
            errors=[str(e)]
        )

@app.get("/images/patient/{patient_id}", response_model=schemas.APIResponse)
async def get_patient_images(
    patient_id: str,
    current_user=Depends(auth.RoleChecker([schemas.UserRole.STUDENT, schemas.UserRole.INSTRUCTOR, schemas.UserRole.ADMIN]))
):
    try:
        images = await database.get_images_by_patient(patient_id)
        return schemas.APIResponse(
            success=True,
            message="Images retrieved successfully",
            data=images
        )
    except Exception as e:
        return schemas.APIResponse(
            success=False,
            message="Failed to retrieve images",
            errors=[str(e)]
        )

# Report endpoints
@app.post("/reports/", response_model=schemas.APIResponse)
async def create_medical_report(
    report_data: schemas.ReportCreate,
    current_user=Depends(auth.RoleChecker([schemas.UserRole.STUDENT, schemas.UserRole.INSTRUCTOR, schemas.UserRole.ADMIN]))
):
    try:
        # Create report
        report_dict = report_data.dict()
        report_dict["created_by"] = current_user["user_id"]
        report_dict["created_at"] = datetime.utcnow()
        report_dict["status"] = "draft"
        report_dict["version"] = 1
        
        report_id = await database.create_report(report_dict)
        
        # Create audit log
        await database.create_audit_log({
            "user_id": current_user["user_id"],
            "action": "create_report",
            "resource_type": "report",
            "resource_id": report_id,
            "timestamp": datetime.utcnow(),
            "details": {"patient_id": report_data.patient_id, "image_id": report_data.image_id}
        })
        
        return schemas.APIResponse(
            success=True,
            message="Report created successfully",
            data={"report_id": report_id}
        )
    except Exception as e:
        return schemas.APIResponse(
            success=False,
            message="Failed to create report",
            errors=[str(e)]
        )

@app.get("/reports/patient/{patient_id}", response_model=schemas.APIResponse)
async def get_patient_reports(
    patient_id: str,
    current_user=Depends(auth.RoleChecker([schemas.UserRole.STUDENT, schemas.UserRole.INSTRUCTOR, schemas.UserRole.ADMIN]))
):
    try:
        reports = await database.get_reports_by_patient(patient_id)
        return schemas.APIResponse(
            success=True,
            message="Reports retrieved successfully",
            data=reports
        )
    except Exception as e:
        return schemas.APIResponse(
            success=False,
            message="Failed to retrieve reports",
            errors=[str(e)]
        )

@app.put("/reports/{report_id}", response_model=schemas.APIResponse)
async def update_medical_report(
    report_id: str,
    report_update: schemas.ReportUpdate,
    current_user=Depends(auth.RoleChecker([schemas.UserRole.STUDENT, schemas.UserRole.INSTRUCTOR, schemas.UserRole.ADMIN]))
):
    try:
        update_data = {k: v for k, v in report_update.dict().items() if v is not None}
        update_data["updated_at"] = datetime.utcnow()
        
        success = await database.update_report(report_id, update_data)
        
        if not success:
            raise HTTPException(status_code=404, detail="Report not found")
        
        # Create audit log
        await database.create_audit_log({
            "user_id": current_user["user_id"],
            "action": "update_report",
            "resource_type": "report",
            "resource_id": report_id,
            "timestamp": datetime.utcnow(),
            "details": update_data
        })
        
        return schemas.APIResponse(
            success=True,
            message="Report updated successfully"
        )
    except HTTPException:
        raise
    except Exception as e:
        return schemas.APIResponse(
            success=False,
            message="Failed to update report",
            errors=[str(e)]
        )

# AI Analysis endpoint (enhanced)
@app.post("/analyze", response_model=schemas.APIResponse)
async def analyze_image(
    file: UploadFile = File(...),
    study_type: str = Form("general"),
    patient_id: Optional[str] = Form(None),
    current_user=Depends(auth.RoleChecker([schemas.UserRole.STUDENT, schemas.UserRole.INSTRUCTOR, schemas.UserRole.ADMIN]))
):
    try:
        # Save file temporarily for analysis
        os.makedirs("uploads", exist_ok=True)
        file_path = f"uploads/temp_{file.filename}"
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Generate AI analysis
        analysis_result = await agents.ai_assistant.generate_report(
            f"http://localhost:8000/{file_path}", 
            study_type
        )
        
        # Clean up temporary file
        if os.path.exists(file_path):
            os.remove(file_path)
        
        return schemas.APIResponse(
            success=True,
            message="Analysis completed successfully",
            data={
                "analysis": analysis_result,
                "study_type": study_type,
                "patient_id": patient_id
            }
        )
    except Exception as e:
        return schemas.APIResponse(
            success=False,
            message="Analysis failed",
            errors=[str(e)]
        )

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

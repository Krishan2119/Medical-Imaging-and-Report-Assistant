from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    STUDENT = "student"
    INSTRUCTOR = "instructor"
    ADMIN = "admin"

class ReportStatus(str, Enum):
    DRAFT = "draft"
    FINALIZED = "finalized"
    REVIEWED = "reviewed"

class StudyType(str, Enum):
    CHEST_XRAY = "chest_xray"
    ABDOMINAL_CT = "abdominal_ct"
    BRAIN_MRI = "brain_mri"
    SPINE_MRI = "spine_mri"
    MAMMOGRAPHY = "mammography"
    GENERAL = "general"

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    role: UserRole = UserRole.STUDENT
    institution: Optional[str] = None
    is_active: bool = True

class UserCreate(UserBase):
    password: str
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters')
        return v

class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    institution: Optional[str] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None

class UserResponse(UserBase):
    id: str
    created_at: datetime
    last_login: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Authentication Schemas
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int

class TokenData(BaseModel):
    email: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

# Patient Schemas
class PatientBase(BaseModel):
    patient_id: str
    first_name: str
    last_name: str
    date_of_birth: Optional[datetime] = None
    gender: Optional[str] = None
    medical_history: Optional[str] = None

class PatientCreate(PatientBase):
    pass

class PatientResponse(PatientBase):
    id: str
    created_by: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Medical Image Schemas
class MedicalImageBase(BaseModel):
    patient_id: str
    study_type: StudyType
    description: Optional[str] = None
    file_name: str
    file_type: str
    file_size: int
    image_url: Optional[str] = None

class MedicalImageCreate(MedicalImageBase):
    pass

class MedicalImageResponse(MedicalImageBase):
    id: str
    uploaded_by: str
    created_at: datetime
    ai_analysis: Optional[Dict[str, Any]] = None
    annotations: Optional[List[Dict[str, Any]]] = []
    
    class Config:
        from_attributes = True

# Report Schemas
class AnalysisFinding(BaseModel):
    finding: str
    confidence: float
    location: Optional[str] = None
    severity: Optional[str] = None

class AIAnalysis(BaseModel):
    findings: List[AnalysisFinding]
    impression: str
    confidence_score: float
    recommendations: Optional[List[str]] = None
    literature_references: Optional[List[str]] = None

class ReportBase(BaseModel):
    patient_id: str
    image_id: str
    study_type: StudyType
    findings: str
    impression: str
    ai_analysis: Optional[AIAnalysis] = None

class ReportCreate(ReportBase):
    pass

class ReportUpdate(BaseModel):
    findings: Optional[str] = None
    impression: Optional[str] = None
    status: Optional[ReportStatus] = None
    reviewed_by: Optional[str] = None
    review_notes: Optional[str] = None

class ReportResponse(ReportBase):
    id: str
    created_by: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    status: ReportStatus
    reviewed_by: Optional[str] = None
    review_notes: Optional[str] = None
    version: int = 1
    
    class Config:
        from_attributes = True

# Audit Log Schemas
class AuditLogBase(BaseModel):
    user_id: str
    action: str
    resource_type: str
    resource_id: Optional[str] = None
    details: Optional[Dict[str, Any]] = None

class AuditLogResponse(AuditLogBase):
    id: str
    timestamp: datetime
    ip_address: Optional[str] = None
    
    class Config:
        from_attributes = True

# API Response Schemas
class APIResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Any] = None
    errors: Optional[List[str]] = None

class PaginatedResponse(BaseModel):
    success: bool
    data: List[Any]
    total: int
    page: int
    per_page: int
    has_next: bool
    has_prev: bool

# Search and Filter Schemas
class PatientFilter(BaseModel):
    search: Optional[str] = None
    created_by: Optional[str] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None

class ReportFilter(BaseModel):
    patient_id: Optional[str] = None
    study_type: Optional[StudyType] = None
    status: Optional[ReportStatus] = None
    created_by: Optional[str] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None

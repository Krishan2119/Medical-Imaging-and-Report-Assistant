from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
import os
from dotenv import load_dotenv
from typing import Dict, Any, List, Optional
from datetime import datetime
from bson import ObjectId

load_dotenv()

class Database:
    client: AsyncIOMotorClient = None
    db: AsyncIOMotorDatabase = None

    @classmethod
    async def connect_db(cls):
        """Connect to MongoDB and initialize collections"""
        cls.client = AsyncIOMotorClient(os.getenv("MONGO_URI", "mongodb://localhost:27017"))
        cls.db = cls.client.medical_imaging_db
        
        # Initialize collections with indexes
        await cls.initialize_collections()

    @classmethod
    async def close_db(cls):
        """Close MongoDB connection"""
        if cls.client:
            cls.client.close()

    @classmethod
    async def initialize_collections(cls):
        """Initialize database collections and indexes"""
        # Users collection
        await cls.db.users.create_index("email", unique=True)
        await cls.db.users.create_index("role")
        
        # Patients collection
        await cls.db.patients.create_index("patient_id", unique=True)
        await cls.db.patients.create_index("created_by")
        await cls.db.patients.create_index("created_at")
        
        # Medical images collection
        await cls.db.medical_images.create_index("patient_id")
        await cls.db.medical_images.create_index("uploaded_by")
        await cls.db.medical_images.create_index("created_at")
        await cls.db.medical_images.create_index("file_type")
        
        # Reports collection
        await cls.db.reports.create_index("patient_id")
        await cls.db.reports.create_index("image_id")
        await cls.db.reports.create_index("created_by")
        await cls.db.reports.create_index("status")
        await cls.db.reports.create_index("created_at")
        
        # Audit logs collection
        await cls.db.audit_logs.create_index("user_id")
        await cls.db.audit_logs.create_index("action")
        await cls.db.audit_logs.create_index("timestamp")

    @classmethod
    def get_collection(cls, name: str):
        """Get database collection"""
        if cls.db is None:
            raise Exception("Database not connected")
        return cls.db[name]

# Database instance
db = Database()

# Utility functions for MongoDB operations
async def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    """Get user by email"""
    user = await db.get_collection("users").find_one({"email": email})
    return user

async def create_user(user_data: Dict[str, Any]) -> str:
    """Create new user"""
    result = await db.get_collection("users").insert_one(user_data)
    return str(result.inserted_id)

async def get_patient_by_id(patient_id: str) -> Optional[Dict[str, Any]]:
    """Get patient by ID"""
    patient = await db.get_collection("patients").find_one({"patient_id": patient_id})
    return patient

async def create_patient(patient_data: Dict[str, Any]) -> str:
    """Create new patient"""
    result = await db.get_collection("patients").insert_one(patient_data)
    return str(result.inserted_id)

async def get_patients_by_user(user_id: str) -> List[Dict[str, Any]]:
    """Get all patients for a user"""
    cursor = db.get_collection("patients").find({"created_by": user_id})
    patients = await cursor.to_list(length=100)
    return patients

async def create_medical_image(image_data: Dict[str, Any]) -> str:
    """Create medical image record"""
    result = await db.get_collection("medical_images").insert_one(image_data)
    return str(result.inserted_id)

async def get_images_by_patient(patient_id: str) -> List[Dict[str, Any]]:
    """Get all images for a patient"""
    cursor = db.get_collection("medical_images").find({"patient_id": patient_id})
    images = await cursor.to_list(length=100)
    return images

async def create_report(report_data: Dict[str, Any]) -> str:
    """Create medical report"""
    result = await db.get_collection("reports").insert_one(report_data)
    return str(result.inserted_id)

async def get_reports_by_patient(patient_id: str) -> List[Dict[str, Any]]:
    """Get all reports for a patient"""
    cursor = db.get_collection("reports").find({"patient_id": patient_id})
    reports = await cursor.to_list(length=100)
    return reports

async def update_report(report_id: str, update_data: Dict[str, Any]) -> bool:
    """Update medical report"""
    result = await db.get_collection("reports").update_one(
        {"_id": ObjectId(report_id)}, 
        {"$set": update_data}
    )
    return result.modified_count > 0

async def create_audit_log(log_data: Dict[str, Any]) -> str:
    """Create audit log entry"""
    result = await db.get_collection("audit_logs").insert_one(log_data)
    return str(result.inserted_id)

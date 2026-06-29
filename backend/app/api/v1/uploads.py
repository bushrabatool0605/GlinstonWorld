# app/api/v1/upload.py  — NEW FILE
# Cloudinary free tier: 25GB storage, 25GB bandwidth/month
# Sign up free at: https://cloudinary.com

import cloudinary
import cloudinary.uploader
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from app.core.config import settings
from app.core.dependencies import require_admin
from app.models.common import success

router = APIRouter(prefix="/uploads",tags=["Upload"])

# Configure Cloudinary once on startup
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True,
)

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_SIZE_MB   = 5


@router.post("/image", dependencies=[Depends(require_admin)])
async def upload_image(file: UploadFile = File(...)):
    """
    Upload a product image to Cloudinary.
    Returns the image URL to save in product.images array.
    Only admin can upload images.
    """

    # Validate file type
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"File type '{file.content_type}' not allowed. Use JPEG, PNG, or WebP."
        )

    # Validate file size
    contents = await file.read()
    size_mb   = len(contents) / (1024 * 1024)
    if size_mb > MAX_SIZE_MB:
        raise HTTPException(
            status_code=400,
            detail=f"File too large ({size_mb:.1f}MB). Maximum size is {MAX_SIZE_MB}MB."
        )

    try:
        # Upload to Cloudinary
        result = cloudinary.uploader.upload(
            contents,
            folder="ecommerce/products",
            transformation=[
                {"width": 800, "height": 800, "crop": "limit"},   # Resize to max 800x800
                {"quality": "auto"},                                # Auto optimize quality
                {"fetch_format": "auto"},                          # Auto best format (WebP etc)
            ],
            resource_type="image",
        )

        return success(
            data={
                "url":       result["secure_url"],
                "public_id": result["public_id"],
                "width":     result.get("width"),
                "height":    result.get("height"),
                "size_kb":   round(result.get("bytes", 0) / 1024, 1),
            },
            message="Image uploaded successfully"
        )

    except cloudinary.exceptions.Error as e:
        print(f"CLOUDINARY ERROR: {str(e)}") # Ye terminal mein print hoga
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@router.delete("/image/{public_id:path}", dependencies=[Depends(require_admin)])
async def delete_image(public_id: str):
    """Delete an image from Cloudinary when product is deleted."""
    try:
        cloudinary.uploader.destroy(public_id)
        return success(message="Image deleted")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Delete failed: {str(e)}")

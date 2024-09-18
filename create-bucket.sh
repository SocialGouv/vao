#!/bin/sh

# Configure the alias for MinIO
mc alias set minio http://minio:9000 ${S3_BUCKET_ACCESS_KEY} ${S3_BUCKET_SECRET_KEY}

# Check if the bucket exists
if mc ls minio/${S3_BUCKET_NAME}; then
    echo "Bucket already exists"
else
    # Create the bucket if it doesn't exist
    mc mb minio/${S3_BUCKET_NAME}
    echo "Bucket created successfully"
fi

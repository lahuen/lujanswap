#!/bin/bash
set -e

# Configuration
AWS_REGION="us-east-1"
AWS_PROFILE="lahuen-devops-adm"
ACCOUNT_ID="672527945707"
BACKEND_REPO="medusa-marketplace-backend"
STOREFRONT_REPO="medusa-marketplace-storefront"
ALB_URL="http://medusa-marketplace-alb-2120830124.us-east-1.elb.amazonaws.com"

echo "Logging in to ECR..."
aws ecr get-login-password --region $AWS_REGION --profile $AWS_PROFILE | podman login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

echo "Building Backend..."
cd backend/lujan-store
podman build --platform linux/amd64 -t $BACKEND_REPO .
podman tag $BACKEND_REPO:latest $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$BACKEND_REPO:latest
echo "Pushing Backend..."
podman push $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$BACKEND_REPO:latest
cd ../..

# NOTE: You need to generate a Publishable Key in Medusa Admin -> Settings -> Publishable API Keys
# For the first build, we can use a placeholder if you don't have one yet, but the storefront might not fetch products correctly.
PUBLISHABLE_KEY="pk_dummy_placeholder"

echo "Building Storefront..."
cd storefront
podman build --platform linux/amd64 --network host \
  --build-arg NEXT_PUBLIC_MEDUSA_BACKEND_URL=$ALB_URL \
  --build-arg NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=$PUBLISHABLE_KEY \
  -t $STOREFRONT_REPO .
podman tag $STOREFRONT_REPO:latest $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$STOREFRONT_REPO:latest
echo "Pushing Storefront..."
podman push $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$STOREFRONT_REPO:latest
cd ..

echo "Deployment images pushed successfully!"

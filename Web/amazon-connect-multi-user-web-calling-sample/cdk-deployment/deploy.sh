#!/bin/bash
#
# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0
#
#=============================================================================
# This script deploys the Amazon Connect Multi-User Web and Video Calling Sample to AWS, including:
# - CDK stack with DynamoDB, Lambda, API Gateway, S3, CloudFront
# - Frontend assets to S3
# - CloudFront invalidation to update the distribution
#
# Usage:
#   ./deploy.sh             # Deploy full stack (backend and frontend)
#   ./deploy.sh --backend   # Deploy only backend AWS stack
#   ./deploy.sh --frontend  # Deploy only frontend assets to CloudFront
#=============================================================================

# Parse command line arguments
DEPLOY_BACKEND=true
DEPLOY_FRONTEND=true

for arg in "$@"; do
  case $arg in
    --backend)
      DEPLOY_BACKEND=true
      DEPLOY_FRONTEND=false
      shift
      ;;
    --frontend)
      DEPLOY_BACKEND=false
      DEPLOY_FRONTEND=true
      shift
      ;;
    --help)
      echo "Usage:"
      echo "  ./deploy.sh             # Deploy full stack (backend and frontend)"
      echo "  ./deploy.sh --backend   # Deploy only backend AWS stack"
      echo "  ./deploy.sh --frontend  # Deploy only frontend assets to CloudFront"
      exit 0
      ;;
    *)
      # Unknown option
      echo "Unknown option: $arg"
      echo "Use --help for usage information"
      exit 1
      ;;
  esac
done

# Enable strict error handling
set -e  # Exit immediately if a command exits with a non-zero status
trap 'echo "❌ Error occurred at line $LINENO. Command: $BASH_COMMAND"' ERR

# Print a step header with timestamp
print_step() {
    local step_num=$1
    local step_desc=$2
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "STEP $step_num: $step_desc"
    echo "$(date '+%Y-%m-%d %H:%M:%S')"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

# Print a message with status
print_message() {
    local status=$1
    local message=$2
    
    case $status in
        "info")
            echo "ℹ️  $message"
            ;;
        "success")
            echo "✅ $message"
            ;;
        "warning")
            echo "⚠️  $message"
            ;;
        "error")
            echo "❌ $message"
            ;;
        *)
            echo "$message"
            ;;
    esac
}

#=============================================================================
# STEP 1: Check prerequisites
#=============================================================================
print_step "1" "Checking prerequisites"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    print_message "error" "AWS CLI is not installed. Please install it first."
    exit 1
else
    print_message "success" "AWS CLI is installed."
fi

# Check if CDK is installed
if ! command -v cdk &> /dev/null; then
    print_message "warning" "AWS CDK is not installed. Installing it globally..."
    npm install -g aws-cdk
    print_message "success" "AWS CDK installed successfully."
else
    print_message "success" "AWS CDK is installed."
fi

# Check AWS credentials
print_message "info" "Checking AWS credentials..."
if ! aws sts get-caller-identity &> /dev/null; then
    print_message "error" "AWS credentials not configured or invalid. Please run 'aws configure' first."
    exit 1
else
    AWS_ACCOUNT=$(aws sts get-caller-identity --query "Account" --output text)
    AWS_REGION=$(aws configure get region)
    print_message "success" "AWS credentials are valid. Account: $AWS_ACCOUNT, Region: $AWS_REGION"
fi

#=============================================================================
# STEP 2: Read configuration values
#=============================================================================
print_step "2" "Reading configuration values"

# Read values from constants.ts
CONSTANTS_FILE="./lib/constants.ts"
if [ ! -f "$CONSTANTS_FILE" ]; then
    print_message "error" "Constants file not found at $CONSTANTS_FILE"
    exit 1
fi

print_message "info" "Extracting values from $CONSTANTS_FILE..."
CONNECT_INSTANCE_ID=$(grep "export const CONNECT_INSTANCE_ID =" "$CONSTANTS_FILE" | cut -d'"' -f2)
CONNECT_CONTACT_FLOW_ID=$(grep "export const CONNECT_CONTACT_FLOW_ID =" "$CONSTANTS_FILE" | cut -d'"' -f2)
STACK_NAME=$(grep "export const STACK_NAME =" "$CONSTANTS_FILE" | cut -d'"' -f2)

# Check if values are empty or placeholder values
if [ -z "$CONNECT_INSTANCE_ID" ] || [ "$CONNECT_INSTANCE_ID" == "your-connect-instance-id" ]; then
    print_message "error" "CONNECT_INSTANCE_ID is not set in $CONSTANTS_FILE"
    print_message "info" "Please update the CONNECT_INSTANCE_ID value in $CONSTANTS_FILE and try again."
    exit 1
fi

if [ -z "$CONNECT_CONTACT_FLOW_ID" ] || [ "$CONNECT_CONTACT_FLOW_ID" == "your-contact-flow-id" ]; then
    print_message "error" "CONNECT_CONTACT_FLOW_ID is not set in $CONSTANTS_FILE"
    print_message "info" "Please update the CONNECT_CONTACT_FLOW_ID value in $CONSTANTS_FILE and try again."
    exit 1
fi

if [ -z "$STACK_NAME" ]; then
    STACK_NAME="multi-user-calling-sample"
    print_message "warning" "STACK_NAME not found in constants.ts, using default: $STACK_NAME"
else
    print_message "success" "Found STACK_NAME: $STACK_NAME"
fi

# Confirm the values
print_message "info" "Using the following values for deployment:"
echo "STACK_NAME: $STACK_NAME"
echo "CONNECT_INSTANCE_ID: $CONNECT_INSTANCE_ID"
echo "CONNECT_CONTACT_FLOW_ID: $CONNECT_CONTACT_FLOW_ID"
read -p "Press Enter to continue or Ctrl+C to cancel..."

# Display deployment mode
if [ "$DEPLOY_BACKEND" = true ] && [ "$DEPLOY_FRONTEND" = true ]; then
    print_message "info" "Deploying full stack (backend and frontend)"
elif [ "$DEPLOY_BACKEND" = true ]; then
    print_message "info" "Deploying backend only"
else
    print_message "info" "Deploying frontend only"
fi

#=============================================================================
# STEP 3: Install backend dependencies
#=============================================================================
if [ "$DEPLOY_BACKEND" = true ]; then
    print_step "3" "Installing backend dependencies"

    print_message "info" "Installing npm packages for CDK project..."
    npm install
    print_message "success" "CDK dependencies installed."

    print_message "info" "Installing Lambda layer dependencies..."
    npm run install:layer
    print_message "success" "Lambda layer dependencies installed."
else
    print_step "3" "Skipping backend dependencies (frontend-only deployment)"
fi

#=============================================================================
# STEP 4: Deploy CDK stack
#=============================================================================
if [ "$DEPLOY_BACKEND" = true ]; then
    print_step "4" "Deploying CDK stack"

    # Bootstrap CDK (if not already done)
    print_message "info" "Bootstrapping CDK in account $AWS_ACCOUNT region $AWS_REGION..."
    cdk bootstrap
    print_message "success" "CDK bootstrapped successfully."

    # Synthesize CloudFormation template
    print_message "info" "Synthesizing CloudFormation template..."
    npm run synth
    print_message "success" "CloudFormation template synthesized successfully."

    # Deploy the stack
    print_message "info" "Deploying the stack $STACK_NAME..."
    npm run deploy
    print_message "success" "Stack $STACK_NAME deployed successfully."
else
    print_step "4" "Skipping CDK stack deployment (frontend-only deployment)"
fi

#=============================================================================
# STEP 5: Get deployment outputs
#=============================================================================
print_step "5" "Getting deployment outputs"

# Get the S3 bucket name from the stack outputs
print_message "info" "Getting S3 bucket name from stack outputs..."
BUCKET_NAME=$(aws cloudformation describe-stacks --stack-name "$STACK_NAME" --query "Stacks[0].Outputs[?OutputKey=='WebsiteBucketName'].OutputValue" --output text)

if [ -z "$BUCKET_NAME" ]; then
    print_message "error" "Failed to get S3 bucket name from stack outputs."
    exit 1
else
    print_message "success" "S3 bucket name: $BUCKET_NAME"
fi

# Get the CloudFront distribution domain name
print_message "info" "Getting CloudFront distribution domain name..."
DISTRIBUTION_DOMAIN=$(aws cloudformation describe-stacks --stack-name "$STACK_NAME" --query "Stacks[0].Outputs[?OutputKey=='DistributionDomainName'].OutputValue" --output text)

if [ -z "$DISTRIBUTION_DOMAIN" ]; then
    print_message "error" "Failed to get CloudFront distribution domain name from stack outputs."
    exit 1
else
    print_message "success" "CloudFront distribution domain: $DISTRIBUTION_DOMAIN"
fi

# Get the CloudFront distribution ID
print_message "info" "Getting CloudFront distribution ID..."
DISTRIBUTION_ID=$(aws cloudfront list-distributions --query "DistributionList.Items[?DomainName=='$DISTRIBUTION_DOMAIN'].Id" --output text)
if [ -z "$DISTRIBUTION_ID" ]; then
    print_message "error" "Failed to get CloudFront distribution ID."
    exit 1
else
    print_message "success" "CloudFront distribution ID: $DISTRIBUTION_ID"
fi

#=============================================================================
# STEP 6: Build frontend assets
#=============================================================================
if [ "$DEPLOY_FRONTEND" = true ]; then
    print_step "6" "Building frontend assets"

    # Navigate to client directory
    print_message "info" "Changing to client directory..."
    cd ../client
    print_message "success" "Now in client directory."

    # Install frontend dependencies
    print_message "info" "Installing frontend dependencies..."
    npm install
    print_message "success" "Frontend dependencies installed."

    # Build the frontend
    print_message "info" "Building frontend application..."
    npm run build
    print_message "success" "Frontend built successfully."

    # Copy HTML and CSS files to dist directory
    print_message "info" "Copying HTML and CSS files to dist directory..."
    mkdir -p dist/css
    cp css/styles.css dist/css/
    print_message "success" "CSS files copied."

    # Create a modified index.html with correct bundle.js path
    print_message "info" "Creating modified index.html with correct bundle.js path..."
    sed 's|src="dist/bundle.js"|src="bundle.js"|g' index.html > dist/index.html
    print_message "success" "Modified index.html created."
else
    print_step "6" "Skipping frontend build (backend-only deployment)"
fi

#=============================================================================
# STEP 7: Deploy frontend assets
#=============================================================================
if [ "$DEPLOY_FRONTEND" = true ]; then
    print_step "7" "Deploying frontend assets"

    # Upload frontend assets to S3
    print_message "info" "Uploading frontend assets to S3 bucket: $BUCKET_NAME"
    aws s3 sync dist/ s3://$BUCKET_NAME/ --delete
    print_message "success" "Frontend assets uploaded to S3."

    # Create CloudFront invalidation to clear cache
    print_message "info" "Creating CloudFront invalidation to clear cache..."
    INVALIDATION_ID=$(aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*" --query "Invalidation.Id" --output text)
    print_message "success" "CloudFront invalidation created. ID: $INVALIDATION_ID"
else
    print_step "7" "Skipping frontend deployment (backend-only deployment)"
fi

#=============================================================================
# STEP 8: Deployment complete
#=============================================================================
print_step "8" "Deployment complete"

print_message "success" "Deployment completed successfully!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Your application is available at: https://$DISTRIBUTION_DOMAIN"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Stack name: $STACK_NAME"
echo "S3 bucket: $BUCKET_NAME"
echo "CloudFront distribution ID: $DISTRIBUTION_ID"
echo ""
echo "To clean up resources, run: ./cleanup.sh"

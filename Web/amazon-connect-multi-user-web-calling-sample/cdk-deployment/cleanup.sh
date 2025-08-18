#!/bin/bash
#
# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0
#
#=============================================================================
# This script cleans up the Amazon Connect Multi-User Web and Video Calling Sample resources from AWS:
# - Destroys the CDK stack (which deletes DynamoDB, Lambda, API Gateway, etc.)
# - Removes local build artifacts and temporary files
# - Optionally removes node_modules directories
#=============================================================================

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
# STEP 2: Read stack name from constants
#=============================================================================
print_step "2" "Reading stack name from constants"

# Read stack name from constants.ts
CONSTANTS_FILE="./lib/constants.ts"
if [ -f "$CONSTANTS_FILE" ]; then
    print_message "info" "Reading stack name from $CONSTANTS_FILE..."
    STACK_NAME=$(grep "STACK_NAME =" "$CONSTANTS_FILE" | cut -d'"' -f2)
    
    if [ -n "$STACK_NAME" ]; then
        print_message "success" "Found stack name: $STACK_NAME"
    else
        STACK_NAME="MultipartySampleStack"
        print_message "warning" "Stack name not found in constants.ts, using default: $STACK_NAME"
    fi
else
    STACK_NAME="MultipartySampleStack"
    print_message "warning" "Constants file not found, using default stack name: $STACK_NAME"
fi

#=============================================================================
# STEP 3: Check if stack exists
#=============================================================================
print_step "3" "Checking if stack exists"

print_message "info" "Checking if stack '$STACK_NAME' exists..."
if ! aws cloudformation describe-stacks --stack-name "$STACK_NAME" &> /dev/null; then
    print_message "warning" "Stack '$STACK_NAME' does not exist. Nothing to clean up."
    STACK_EXISTS=false
else
    STACK_EXISTS=true
    read -p "Do you want to proceed with destroying the stack $STACK_NAME? (y/N): " confirm_destroy
    if [[ "$confirm_destroy" != "y" && "$confirm_destroy" != "Y" ]]; then
        print_message "info" "Stack destruction cancelled by user."
        exit 0
    fi
fi

#=============================================================================
# STEP 4: Destroy CDK stack
#=============================================================================
print_step "4" "Destroying CDK stack"

if [ "$STACK_EXISTS" = true ]; then
    print_message "info" "Starting stack destruction process..."
    print_message "info" "Note: With the updated stack configuration, S3 buckets will be automatically emptied and deleted"
    print_message "info" "when the stack is destroyed (due to removalPolicy: DESTROY and autoDeleteObjects: true)"
    
    # Destroy the CDK stack
    print_message "info" "Destroying the CDK stack '$STACK_NAME'..."
    cdk destroy --force
    print_message "success" "Stack '$STACK_NAME' destroyed successfully."
else
    print_message "info" "Skipping stack destruction as no stack exists."
fi

#=============================================================================
# STEP 5: Clean up local files
#=============================================================================
print_step "5" "Cleaning up local files"

# Remove the CDK context file
if [ -f "cdk.context.json" ]; then
    print_message "info" "Removing CDK context file..."
    rm -f cdk.context.json
    print_message "success" "CDK context file removed."
else
    print_message "info" "No CDK context file found."
fi

# Run npm clean to remove build artifacts and cdk.out
print_message "info" "Running npm clean to remove build artifacts..."
npm run clean
print_message "success" "Build artifacts cleaned."

# Clean up node_modules if requested
print_message "info" "Do you want to clean up node_modules directories? This will remove:"
echo "  - ./node_modules"
echo "  - ./lambda-layer/nodejs/node_modules"
read -p "Clean up node_modules? (y/n): " clean_modules

if [[ "$clean_modules" == "y" || "$clean_modules" == "Y" ]]; then
    print_message "info" "Cleaning up node_modules directories..."
    
    if [ -d "node_modules" ]; then
        print_message "info" "Removing ./node_modules..."
        rm -rf node_modules
        print_message "success" "Main node_modules directory removed."
    fi
    
    print_message "info" "Removing lambda layer node_modules..."
    npm run clean:layer
    print_message "success" "Lambda layer node_modules directory removed."
    
    print_message "success" "All node_modules directories removed."
else
    print_message "info" "Skipping node_modules cleanup."
fi

#=============================================================================
# STEP 6: Cleanup complete
#=============================================================================
print_step "6" "Cleanup complete"

print_message "success" "Cleanup completed successfully!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧹 All resources have been cleaned up"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "To deploy the application again, run: ./deploy.sh"

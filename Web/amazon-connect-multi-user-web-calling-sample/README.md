# Amazon Connect Multi-User Web and Video Calling Sample

A sample application for end customers to join web and video calling with multiple participants. This application demonstrates how to integrate Amazon Connect and Amazon Chime SDK to create a multi-user web and video calling experience.

## Project Structure

The project is organized into client, server, and CDK deployment components with a clean architecture:

### Client

The client-side code follows an MVC (Model-View-Controller) architecture with clear separation of concerns:

```
client/
├── controllers/          # Controllers that handle business logic
│   ├── JoinFormController.js  # Handles join form interactions
│   └── SessionController.js   # Manages session lifecycle
├── css/                  # Stylesheets
│   └── styles.css        # Main stylesheet
├── managers/             # Managers for application state and views
│   ├── StateManager.js   # Centralized state management
│   └── ViewManager.js    # Manages view rendering and updates
├── models/               # Data models
│   ├── EngagementModel.js     # Engagement data structure
│   ├── MediaModel.js          # Media configuration model
│   └── ParticipantModel.js    # Participant data structure
├── services/             # Service layer for external interactions
│   ├── ApiService.js          # Handles API calls
│   ├── EventBus.js            # Event pub/sub system
│   ├── EventTypes.js          # Event type definitions
│   ├── MediaService.js        # Handles audio/video devices
│   ├── ParticipantService.js  # Manages participants
│   └── SessionService.js      # Manages meeting session
├── views/                # View components
│   ├── JoinFormView.js        # Join form UI
│   └── SessionView.js         # Session UI
├── index.html            # Main HTML file
├── index.js              # Main application entry point
├── esbuild.mjs           # Build configuration
└── package.json          # Dependencies and scripts
```

### Server

The server-side code maintains a clean separation of concerns:

```
server/
├── config/               # Configuration files
│   └── config.js         # Application configuration
├── repositories/         # Data access layer
│   └── EngagementRepository.js  # DynamoDB engagement data operations
├── routes/               # API routes
│   └── engagementRoutes.js  # Engagement API endpoints
├── services/             # Business logic services
│   ├── ConnectService.js      # Amazon Connect service integration
│   ├── EngagementService.js   # Core engagement business logic
│   └── EngagementHelpers.js   # Helper functions and constants
└── index.js              # Main server entry point
```

### CDK Deployment

The project includes AWS CDK code for deploying the application to AWS:

```
cdk-deployment/
├── bin/                  # CDK app entry point
│   └── cdk-app.ts        # Main CDK application
├── lib/                  # CDK stack definition
│   ├── constants.ts      # Configuration constants
│   └── multiparty-sample-stack.ts  # Main stack definition
├── lambda/               # Lambda function implementations
│   ├── attendee/         # Attendee Lambda function
│   ├── createOrJoinEngagement/  # Create/join engagement Lambda function
│   └── search/           # Search engagement Lambda function
├── lambda-layer/         # Shared code for Lambda functions
│   └── nodejs/           # Node.js Lambda layer code
│       ├── connectService.js      # Service for Amazon Connect
│       ├── dynamoDbService.js     # DynamoDB data access utilities
│       ├── utils.js               # Common utility functions
└── README.md             # CDK deployment documentation
```

## Architecture Overview

The application uses a modern, event-driven architecture with the following key components:

1. **Client-Side MVC Architecture**: Clean separation between Models (data), Views (UI), and Controllers (logic)
2. **Event-Driven Communication**: Using EventBus for decoupled component communication
3. **Service Layer Pattern**: Well-defined services with single responsibilities
4. **Repository Pattern**: Data access abstraction with DynamoDB integration
5. **AWS Integration**: Seamless integration with Amazon Connect and Amazon Chime SDK
6. **Infrastructure as Code**: AWS CDK for deploying the application to AWS

## Key Features

- **Multi-User Video Calling**: Support for up to 5 end user participants
- **Screen Sharing**: Dedicated screen sharing capabilities
- **Audio/Video Controls**: Mute/unmute, video on/off controls
- **Real-Time Communication**: WebRTC-based communication through Amazon Connect
- **Engagement Management**: Create and join engagements with unique IDs
- **Participant Management**: Display names and participant tracking
- **Scalable Architecture**: Both local development and AWS cloud deployment options

## Deployment Options

### Prerequisites

- Node.js (v22 or higher)
- npm (v10 or higher)
- AWS CLI configured with appropriate credentials
- AWS CDK CLI latest version, install via `npm install -g aws-cdk@latest` if not


### Node.js Version Management

This project requires Node.js v22 or higher. We recommend using Node Version Manager (nvm) to manage Node.js versions:

```bash
# Install nvm (if not already installed)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Install Node.js v22
nvm install 22

# Use Node.js v22
nvm use 22
```

### Option 1: AWS Deployment

For deployment to AWS using CDK, refer to the [CDK Deployment README](./cdk-deployment/README.md). This approach provides:

- Scalable serverless architecture with Lambda functions
- CloudFront distribution for global content delivery
- DynamoDB for persistent data storage with TTL (24 hours)
- API Gateway for REST API endpoints
- Automated deployment and cleanup scripts

### Option 2: Local Development

For local development and testing, follow the instructions below.

## Local Development Setup

### Step 1: Install Dependencies

```bash
npm run install:all
```

### Step 2: Configure Environment

Update the `.env` file in the root directory with your AWS Connect settings:

```env
# AWS Connect Configuration
CONNECT_INSTANCE_ID=your-connect-instance-id
CONNECT_CONTACT_FLOW_ID=your-connect-contact-flow-id
```

**Important Configuration Notes**:

- Replace placeholder values with your actual AWS Connect instance details
- Ensure your AWS credentials are configured (via AWS CLI, environment variables, or IAM roles)
- The application uses DynamoDB for engagement storage and will create the table automatically
- Ensure your AWS credentials have permissions for:
  - Amazon Connect (StartWebRTCContact, CreateParticipant, DescribeContact, CreateParticipantConnection)
  - DynamoDB (CreateTable, GetItem, PutItem, UpdateItem)

### Step 3: Run the Application

```bash
# Run both server and client concurrently
npm run dev
```

The application will be available at http://127.0.0.1:8000/

### Available Scripts

- `npm start`: Start the server in production mode
- `npm run dev`: Run both server and client in development mode with hot reload
- `npm run server:dev`: Run only the server in development mode
- `npm run client:dev`: Run only the client in development mode with watch
- `npm run client:build`: Build the client for production
- `npm run client:clean`: Clean the client build directory
- `npm run install:all`: Install dependencies for both server and client
- `npm run clean:all`: Clean all build directories and node_modules

## Testing

### Manual Testing

To manually test the application:

1. Open the application in a browser at http://127.0.0.1:8000/
2. **Create a new engagement**:
   - Enter your display name
   - Optionally enter an engagement ID (auto-generated if empty)
   - Select desired capabilities (Video, Screen Share)
   - Click the `Create` button
3. **Wait for agent connection**: An agent must accept the engagement in Amazon Connect
4. **Test multi-user functionality**:
   - Open a second browser tab/window
   - Navigate to http://127.0.0.1:8000/?engagementId=YOUR_ENGAGEMENT_ID
   - Or manually enter the engagement ID and display name
   - Click the `Join` button
5. **Verify functionality**:
   - Test audio/video controls (mute, video on/off)
   - Test screen sharing capabilities
   - Verify multiple participants can join and communicate

### Testing Features

The application supports:

- **Video calling** with up to 5 end user participants
- **Screen sharing** with dedicated viewer
- **Audio controls** (mute/unmute)
- **Video controls** (start/stop video)
- **Multi-user engagement** with real-time communication
- **Engagement persistence** with DynamoDB storage

## API Endpoints

The server provides the following REST API endpoints:

- `POST /api/join` - Create new engagement or join existing engagement
- `GET /api/search` - Search for engagement and participant details
- `GET /api/attendee` - Get attendee information by engagement ID and attendee ID

## Troubleshooting

### Common Issues

1. **Connection Issues**:

   - Verify AWS credentials are correctly configured
   - Check that `CONNECT_INSTANCE_ID` and `CONNECT_CONTACT_FLOW_ID` are correct in `.env`
   - Ensure network connectivity to AWS services
   - Verify the Connect instance is in the correct region

2. **Build Issues**:

   - Clear dependencies and reinstall: `rm -rf node_modules client/node_modules && npm run install:all`
   - Ensure you're using Node.js v22 or higher: `node --version`

3. **Local Development Issues**:

   - Check that port 3000 is available
   - Verify the client build completed successfully: `npm run client:build`
   - Check browser console for JavaScript errors
   - Ensure `.env` file is properly configured

4. **Database Issues**:

   - Ensure AWS credentials have DynamoDB permissions
   - Check CloudWatch logs for DynamoDB errors
   - Verify the DynamoDB table is created successfully (check server logs)

5. **Permission Issues**:
   - Verify AWS credentials have the required permissions:
     - `connect:StartWebRTCContact`
     - `connect:CreateParticipant`
     - `connect:DescribeContact`
     - `connectparticipant:CreateParticipantConnection`
     - `dynamodb:CreateTable`
     - `dynamodb:DescribeTable`
     - `dynamodb:GetItem`
     - `dynamodb:PutItem`
     - `dynamodb:UpdateItem`

### Development Tips

- **Hot Reload**: The `npm run dev` command provides hot reload for both client and server
- **Client Only**: Use `npm run client:dev` when only working on frontend changes
- **Production Build**: Always run `npm run client:build` before production deployment
- **Logs**: Check browser console and server terminal for detailed error information
- **DynamoDB**: The application automatically creates the `engagements` table on first run

### AWS Deployment Issues

For AWS deployment issues, refer to the [CDK Deployment README](./cdk-deployment/README.md) troubleshooting section.

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript (ES6 modules), Amazon Chime SDK
- **Backend**: Node.js, Express.js
- **Build Tools**: esbuild for fast client bundling
- **AWS Services**: Amazon Connect, Amazon DynamoDB, AWS Lambda, Amazon API Gateway, Amazon S3, Amazon CloudFront
- **Infrastructure**: AWS CDK for cloud deployment
- **Development**: Nodemon for server hot reload, Concurrently for parallel processes

## License

This project is licensed under the MIT-0 License. See the LICENSE file for details.

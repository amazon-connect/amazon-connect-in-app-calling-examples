# Amazon Connect In-App Calling iOS Sample

This sample iOS app demonstrates how to interact with Amazon Connect APIs to start an in-app call with Amazon Connect and send DTMF. This iOS sample app works together with the serverless solution deployed by the `Amazon Connect In-App Calling API Sample` to deliver an in-app calling experience. Please make sure you deploy the `Amazon Connect In-App Calling API Sample` first.

> NOTE: this sample is for demo purposes.

## Setup
 1. Git clone the repo.
 1. Make sure Cocoapods is installed on your computer.
 1. `Amazon Connect In-App Calling API Sample` has been deployed.
 1. Under project root directory , run `pod install`
 1. Open `AmazonConnectInAppCallingIOSSample.xcworkpsace` file with Xcode
 1. Open `Config.swift file`, set the Connect instance ID, contact flow ID, and proxy APIs endpoints.
 1. The project is ready to build and run now.

### Key files and methods in the sample code

**Config.swift**: file that contains the Amazon Connect configurations (e.g., contact flow ID, Connect Instance ID)

**CallManager**: Contains methods to: 1) start the call, 2) manage the call session, 3) call controls (e.g., mute, unmute) 

**DTMFSender**: Utilizes the Amazon Connect participant service APIs to send DTMF messages. 

**CallViewController**: Main UI for manipulating the call session

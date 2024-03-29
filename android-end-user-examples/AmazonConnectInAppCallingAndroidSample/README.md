# Amazon Connect In-App Calling Sample - Android

This sample Android app demonstrates how to interact with Amazon Connect APIs to start an in-app call
with Amazon Connect and send DTMF.

This sample app works together with the serverless solution deployed
by the `Amazon Connect In-App Calling API Sample`
to deliver an in-app calling experience. Please make sure you follow the `README` and deploy the serverless demo first, and note down the output.

> NOTE: this sample is for demo purposes.

## Setup
1. `Amazon Connect In-App Calling API Sample` has been deployed.
2. Git clone the repo
3. Open the project from [Android Studio](https://developer.android.com/studio)
4. Make sure Android SDK location has been properly configured by clicking *File* -> *Project Structure* -> *SDK Location*, or go to `<Project root path>/local.properties`, there should be `sdk.dir` property
5. Connect a physical Android device, make sure developer mode is on by following [this guide](https://developer.android.com/studio/debug/dev-options)
   1. Fill in required configurations in `CallConfiguration.kt`
      ```kotlin
      data class CallConfiguration(
      // ...
      val connectInstanceId: String = "", // your Amazon Connect instance Id
      val contactFlowId: String = "", // your contact flow Id that you want to associated with the calls
      val startWebrtcEndpoint: String = "", // the endpoint URL of startWebrtcContact API deployed by the serverless demo
      val createParticipantConnectionEndpoint: String = "", // the endpoint URL of createParticipantConnection API deployed by the serverless demo
      val sendMessageEndpoint: String = "", // the endpoint URL of sendMessage API deployed by the serverless demo
      // ...
      )
      ```
6. In Android Studio, choose your connected device, and target `app`, click run

### Key files and methods in the sample code

**CallManager**: Contains methods to: 1) manage the call session, 2) send DTMF 3) audio / video controls (e.g., mute, unmute, start, stop video) 4) handle SDK meeting events (e.g., meeting started / ende, attendee joined, dropped)

**Call Sheet**: Main UI for hosting the call session

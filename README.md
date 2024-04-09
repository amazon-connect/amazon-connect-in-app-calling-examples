# Amazon Connect In-App Calling Examples

This repo contains examples on how to implement Amazon Connect in-app, web and video calling capabilities on both the customer and agent sides. Please refer to the README under each solution to see the complete details as to what each solution does and how to deploy it.

**New to Amazon Connect and looking to onboard with in-app calling capabilities?** Refer to [“Set up in-app, web, and video calling capabilities”](https://docs.aws.amazon.com/connect/latest/adminguide/inapp-calling.html).


## Examples

At the moment, there are 4 the examples in this repository:

1. **[iOS Customer Integration Example](https://github.com/amazon-connect/amazon-connect-in-app-calling-examples/iOS/AmazonConnectInAppCallingIOSSample)**
   This example demonstrates how to interact with Amazon Connect api for placing an inbound in-app, web or video call to a contact, and eatablishing the underlying audio/video call connection between customer and agent by utilizing [Amazon Chime SDK for iOS](https://github.com/aws/amazon-chime-sdk-ios).

2. **[Android Customer Integration Example](https://github.com/amazon-connect/amazon-connect-in-app-calling-examples/Android/AmazonConnectInAppCallingAndroidSample)**
   This example demonstrates how to interact with Amazon Connect api for placing an inbound in-app, web or video call to a contact, and eatablishing the underlying audio/video call connection between customer and agent by utilizing [Amazon Chime SDK for Android](https://github.com/aws/amazon-chime-sdk-android).

3. **[CCP Web Calling Example](https://github.com/amazon-connect/amazon-connect-in-app-calling-examples/Web/amazon-connect-ccp-web-calling-example)**
   This example demonstrates how to integrate video calling into your custom agent desktop by leverageing the capabilities of [Amazon Connect Streams](https://github.com/amazon-connect/amazon-connect-streams) and [Amazon Connect SDK for Javascript](https://github.com/aws/amazon-chime-sdk-js). It utilizes the pre-built CCP UI offered by [amazon-connect-streams](https://github.com/amazon-connect/amazon-connect-streams) as an engine, handling the agent and contact events, and integrating the WebRTC video calling using [amazon-chime-sdk-js](https://github.com/aws/amazon-chime-sdk-js).

4. **[StartWebRTCContact Example](https://github.com/amazon-connect/amazon-connect-in-app-calling-examples/Web/amazon-connect-ccp-web-calling-example)**
   This example demonstrates how to invoke Amazon Connect [StartWebRTCConnect](https://docs.aws.amazon.com/connect/latest/APIReference/API_StartWebRTCContact.html) API from AWS Lambda, an Amazon API Gateway is also to integrate with the Lambda, in order to serve as the backend for the iOS/Android customer integration examples, for placing inbound in-app, web or video calls to a contact.

## Use Cases
Below are the common use cases can be referenced using those examples:

1. ``I want to enable in-app calling in my mobile applications, so that users can reach out to our customer support while staying in the app, and the app is able to send needed information(such as user info or current page) to customer support along the call.``

The iOS/Android integration examples and StartWebRTCContact example are needed to acheive this use case: iOS/Android examples demonstrates the mobile application part including invoke StartWebRTCContact api(through StartWebRTC example), sending contact attributes, start audio/video call session, as well as sending DTMF; StartWebRTCContact example acts as a proxy API, relaying the StartWebRTCContact request from mobile applications to Amazon Connect.

2. ``I have my web application for agents, I would like to enable video capablity on my agent application so that agents can send/receive videos while supporting customers.``

CCP Web Calling Example demonstrates how this can be achieved in 2 ways: embed the pre-built CPP UI or create custom UI based on amazon-connect-streams.

## Setup
Those examples run on various platforms, please follow the README under each example for detail setup instructions.

## Resources

Here are a few resources to help you implement in-app, web or video calls in your applications:

- [Set up in-app, web, and video calling capabilities](https://docs.aws.amazon.com/connect/latest/adminguide/inapp-calling.html)
- [Amazon Connect Streams](https://github.com/aws/amazon-connect-streams)
- [Amazon Chime SDK for JavaScript](https://github.com/aws/amazon-chime-sdk-js)
- [Amazon Chime SDK for iOS](https://github.com/aws/amazon-chime-sdk-ios)
- [Amazon Chime SDK for Android](https://github.com/aws/amazon-chime-sdk-android)
- [Amazon Connect Service SDK](https://docs.aws.amazon.com/connect/latest/APIReference/Welcome.html) (Download the SDK [here](https://github.com/aws/))
- [Amazon Connect Participant Service SDK](https://docs.aws.amazon.com/connect-participant/latest/APIReference/Welcome.html) (Download the SDK [here](https://github.com/aws/))

## Troubleshooting and Support

Review the resources given in the README files for guidance on how to setup those examples. Additionally, search our [issues database](hhttps://github.com/amazon-connect/amazon-connect-in-app-calling-examples/issues) to see if your issue is already addressed. If not please cut us an [issue](https://github.com/amazon-connect/amazon-connect-in-app-calling-examples/issues/new/choose) using the provided templates.

If you have more questions, or require support for your business, you can reach out to [AWS Customer support](https://aws.amazon.com/contact-us). You can review our support plans [here](https://aws.amazon.com/premiumsupport/plans/?nc=sn&loc=1).

## License Summary

This sample code is made available under the MIT-0 license. See the LICENSE file.
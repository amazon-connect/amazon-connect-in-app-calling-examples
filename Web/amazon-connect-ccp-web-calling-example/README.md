# AmazonConnectCCPWebCallingSample

## Getting Started

1. `npm install`
2. Update `CCP_URL` in `ContactManager.js` to your own URL, such as `"https://my-instance-domain.awsapps.com/connect/ccp-v2/"`
   1. You can get it from the Contact Control Panel in the top of your connect instance page
3. `npm run start`
4. The demo is running at `http://localhost:5500`
   1. `http://localhost:5500` must be added to [Approved origins](https://docs.aws.amazon.com/connect/latest/adminguide/app-integration.html) in Amazon Connect console

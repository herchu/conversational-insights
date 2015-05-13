# Conversational Insights

This demo is part of a Drop In Lab during World of Watson 2015 at NYC.
You can **[download the lab instructions](https://github.com/herchu/watson-message-assistant/raw/master/Watson%20Lab%20Instructions%20-%20Conversational%20Insights.pdf)** to run the lab yourself.
You may also want to follow the other labs to learn about different services:  [Image Analysis](https://github.com/aldelucca1/image-analysis) and [Personalized recommendations](https://github.com/germanattanasio/personalized-recommendations)

  Conversational Insights helps you write a Twitter direct message by telling you information about the recipient and the tone of your message. It uses the Tone Analyzer and [Personality Insights][service_url] Watson services.

Give it a try! Click the button below to fork into IBM DevOps Services and deploy your own copy of this application on Bluemix.

Lab Instructions: [INSTRUCTIONS](INSTRUCTIONS.md)

Demo: http://message-assistant.mybluemix.net/

[![Deploy to Bluemix](https://bluemix.net/deploy/button.png)](https://bluemix.net/deploy?repository=https://github.com/herchu/watson-message-assistant)


## Running locally
  The application uses [Node.js](http://nodejs.org/) and [npm](https://www.npmjs.com/) so you will have to download and install them as part of the steps below.

1. Open a terminal and run:  
    `git clone git@github.com:herchu/watson-message-assistant.git`
2. Change the directory to travel-concierge 
    `cd travel-concierge`
3. Copy the credentials from your services in Bluemix to `app.js`, you can see the credentials by going to your app in Bluemix and cliking on "See credentials".
4. Install [Node.js](http://nodejs.org/) and [npm](https://github.com/npm/npm)
5. Go to the project folder in a terminal and run:  
    `npm install`
6. Start the application
7.  `node app.js`
8. Go to `http://localhost:3000`


## License

  This sample code is licensed under Apache 2.0. Full license text is available in [COPYING](LICENSE).

## Contributing

  See [CONTRIBUTING](CONTRIBUTING.md).

## Open Source @ IBM
  Find more open source projects on the [IBM Github Page](http://ibm.github.io/)

[service_url]: http://www.ibm.com/smarterplanet/us/en/ibmwatson/developercloud/personality-insights.html

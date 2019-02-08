# pva-automation

OVERVIEW:

This project includes all the code needed to create accounts in an automated way for the following account types:

    - Office 365

There is a related process that instantiates this script, passing in mock data to use for filling in the various form fields.
This process is documented {{to be added}}. Also, there are steps in this project that interact with a set of web services 
maintained as a seperate web application. Full documentation of that application is {{to be added}}.
    
REQUIREMENTS:

In order to run the code, you need to install the following:

- node.js (npm install)
- selenium-webdriver (https://www.npmjs.com/package/selenium-webdriver) 
- ChromeDriver, a standalone server which implements WebDriver's wire protocol. Here is a link with information on ChromeDriver - https://github.com/SeleniumHQ/selenium/wiki/ChromeDriver
- A couple other dependencies: require-promise (https://www.npmjs.com/package/request-promise), and moment (https://www.npmjs.com/package/moment)


DETAILS:

There are 2 files in the repository, o365_account_creation.js and checkforcode.js. The first file uses WebDriver to automate 
the steps for signing up for an office 365 premium trial account. As part of the automation, there is the need for phone 
verification where a code is sent to a provided phone number as a text message. The second file, checkforcode.js, implements
an asynchronous request process that is account type agnostic to hit a webservice in order to get the code sent in the text
message and return it to the calling program in a matter of seconds in order to fill in the form field during the signup 
process. 

NOTE: currently, the logic contained in checkforcode.js is replicated in o365_account_creation.js. some minor 
refactoring can be done in order to support code reuse across multiple account creation scripts.

Here is the high-level logic flow of the script o365_account_creation.js: 

Step 1 - the script is run using a command like the following:

"node o365_account_creation.js fname=Jane lname=Deavers email=sananim25@gmail.com phone=7757274911 vphone=3103443700 
company=E2Chold password=Fourten14! proxy=proxy"

Step 2 - an instance of the WebDriver object is created called "driver"

Step 3 - using the get method of WebDriver, the script loads the initial URL for the account signup screen

Step 4 - using the wait method of WebDriver, the script waits for 1 minute to locate and click on the premium try free link

Step 5 - the first form field filling call is made using the javscript setTimeout function with a delay of 5 seconds

Step 6 - the remaining series of form field filling calls and clicks on elements cascade off the initial call using the same 
approach with a setTimeout function using a 5 second delay

Step 7 - finally, the script gets to the function clickTextMe(), where the code calls the checkforcode logic

Step 8 - the checkforcode logic polls the server waiting to receive the code sent in the test message for the provided 
phone number

Step 9 - the received code is returned to the function setChallengeCode(), which puts the code into the form field and kicks 
off the next step in the account creation process, clickNextAgain(), passing along the response from the checkforcode call

Step 10 - clickNextAgain() then calls clickReadyToGo() which is effectively the final step in the account creation process

Step 11 - clickReadyToGo() waits for a minute (as o365 is completing the account creation) and calls updateAccountInfo

Step 12 - updateAccountInfo uses the original response from checkforcode along with the mock account values passed into the 
script at initialization to update the account info in mongodb using the provided web service endpoint /phoneinfo/

Step 13 - finally, updateAccountInfo calls driverCleanup which calls the quit method on the WebDriver instance

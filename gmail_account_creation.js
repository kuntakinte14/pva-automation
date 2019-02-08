const webdriver = require('selenium-webdriver');
const By = webdriver.By;
const until = webdriver.until;
const chrome = require("selenium-webdriver/chrome");
const async_request = require('request-promise');
const moment = require('moment');

const options = new chrome.Options();
options.addArguments('--headless');

const args = process.argv;
var fName, lName, email, phone, vphone, company, uId, domain, pWord, proxy;

var acctDataUrl = "149.28.244.189:8000"; //localhost:8000

for(var i=2;i<args.length;i++){
      curValues = args[i].split('=');
      if (curValues[0] == "fname") {
          fName = curValues[1];
      }
      else if (curValues[0] == "lname") {
          lName = curValues[1];
      }
      else if (curValues[0] == "email") {
          email = curValues[1];
      }
      else if (curValues[0] == "phone") {
          phone = curValues[1];
      }
      else if (curValues[0] == "vphone") {
          vphone = curValues[1];
          vphoneTest = "+12138250202";
      }
      else if (curValues[0] == "company") {
          company = curValues[1];
      }
      else if (curValues[0] == "password") {
          pWord = curValues[1];
      }
      else if (curValues[0] == "proxy") {
          proxy = curValues[1];
      }
//Gmail additions - can these be randomized below so we do not need to pull from a DB?
         else if (curValues[0] == "month") {
          proxy = curValues[1];
      }
         else if (curValues[0] == "day") {
          proxy = curValues[1];
      }
         else if (curValues[0] == "year") {
          proxy = curValues[1];
      }
         else if (curValues[0] == "gender") {
          proxy = curValues[1];
      }

}
uId = fName + "." + lName;
domain = company;
fullUId = uId + "@" + domain + ".gmail.com";

var creationDate = moment.utc().format("MM-DD-YYYY");
var getOptions = {
        uri: 'http://' + acctDataUrl  + '/phoneinfo/host_number/' + vphoneTest + '/creation_date/' + creationDate,
        json: true
};

function checkForCode() {
      var poller = new async_request(getOptions)
        .then(function (response) {
            console.log("poller executed");
            if (!response) {
                console.log("nothing returned");
                //need to execute call again
                setTimeout(checkAgain, 1000);
            }
            else {
                if (!response.message) {
                    console.log("no message returned");
                    //need to execute call again
                    setTimeout(checkAgain, 1000);
                }
                else {
                    console.log("verification code returned");
                    //update database
                    //updateAccountInfo(response);
                    //return response;
                    setChallengeCode(response);
                }
            }
        })
        .catch(function (err) {
            // API call failed...
            console.log("error is:" + err);
        });
}

function checkAgain() {
    console.log("in checkAgain");
    checkForCode();
}

function updateAccountInfo(accountInfo) {
    var bodyString = {
            "first_name": fName,
            "last_name": lName,
            "email_address": email,
            "phone_number": vphoneTest,
            "company_name": company,
            "user_id": fullUId,
            "domain_name": domain,
            "password": pWord,
            "challenge_code": accountInfo.message
    };

    var headers = {
            'Content-Type': 'application/json',
            'Content-Length': bodyString.length
    };

    var options = {
        uri: 'http://149.28.244.189:8000/phoneinfo/' + accountInfo._id,
        method: 'PUT',
        headers: headers,
        form: bodyString,
        json: true
    };
    //console.log(bodyString);

    var updater = new async_request(options)
        .then(function (response) {
            //var obj = JSON.parse(response);
            console.log("update executed");
            console.log(response);
            //call driver cleanup
            driverCleanup(response);
        })
        .catch(function (err) {
            // API call failed...
            console.log("error is:" + err);
        });

}


/* WEBDRIVER PROXY CODE
var proxy = require('selenium-webdriver/proxy');
const driver = new webdriver
    .Builder()
    .usingServer()
    .withCapabilities(webdriver.Capabilities.chrome())
    .setProxy(proxy.manual({
    	http: '127.0.0.1:9000'
    }))
    .build();
*/
/*
const driver = new webdriver
    .Builder()
    .withCapabilities(webdriver.Capabilities.chrome())
    .build();
 */

const driver = new webdriver
.Builder()
.forBrowser('chrome')
.setChromeOptions(options)
.build();

driver.get('https://accounts.google.com/signup/v2/webcreateaccount?continue=https%3A%2F%2Faccounts.google.com%2FManageAccount&flowName=GlifWebSignIn&flowEntry=SignUp');

driver.wait(until.elementLocated(By.id('accountDetailsNext')), 60000).click();
//driver.findElement(By.id('accountDetailsNext')).click();

var typeTimeout = 5000;
var clickTimeout = 1000;
//setTimeout(setCountry, 5000);
setTimeout(setFirstName, typeTimeout);
//setTimeout(setLastName, 15000);
//setTimeout(setEmailAddress, 20000);
//setTimeout(setPassword, 55000);
//setTimeout(setRePassword, 60000);
//setTimeout(clickNext, 40000);
//setTimeout(setPhoneNumber, 70000);
//setTimeout(setRecoveryEmail, 25000);
//setTimeout(setBDayMonth, 30000);
//setTimeout(setBDayDay, 30000);
//setTimeout(setBDayYear, 30000);
//setTimeout(setGender, 30000);
//setTimeout(clickNext2, 40000);
//setTimeout(setTermsNext, 30000);
//setTimeout(setOpenGmail, 35000);
//setTimeout(clickNext3, 40000);
//setTimeout(clickNext4, 40000);
 //driver.quit();

//Page 1

function setCountry() {
    var country = driver.wait(until.elementLocated(By.id('StepsData_SelectedRegion')));
    country.sendKeys('US');
}

function setFirstName() {
    var firstName = driver.wait(until.elementLocated(By.id('firstName')));
    firstName.sendKeys(fName).then(
            function(returnData) {
                console.log("setFirstName completed");
                setTimeout(setLastName, typeTimeout);
            }
    );
}

function setLastName() {
    var lastName = driver.wait(until.elementLocated(By.id('lastName')));
    lastName.sendKeys(lName).then(
            function(returnData) {
            	console.log("setLastName completed");
                setTimeout(setEmailAddress, typeTimeout);
            }
    );
}

//Auto sets an user name (defaul email address) for you or can type in own
function setEmailAddress() {
    var emailAddress = driver.wait(until.elementLocated(By.id('username')));
    emailAddress.sendKeys(email).then(
            function(returnData) {
            	console.log("setEmailAddress completed");
                setTimeout(setPassword, typeTimeout);
            }
    );
}

function setPassword() {
    var password = driver.wait(until.elementLocated(By.name('Passwd')));
    password.sendKeys(pWord).then(
            function(returnData) {
            	console.log("setPassword completed");
                setTimeout(setRePassword, typeTimeout);
            }
    );
}

function setRePassword() {
    var repassword = driver.wait(until.elementLocated(By.name('ConfirmPasswd')));
    repassword.sendKeys(pWord).then(
            function(returnData) {
            	console.log("setRePassword completed");
                setTimeout(clickNext, clickTimeout);
            }
    );
}

function clickNext() {
    var nextLink = driver.wait(until.elementLocated(By.id('accountDetailsNext')));
    nextLink.click().then(
            function(returnData) {
            	console.log("clickNext completed");
                setTimeout(setPhoneNumber, typeTimeout);
            }
    );
}

//Page 2

// display is Phone Number Optional
function setPhoneNumber() {
    var phoneNumber = driver.wait(until.elementLocated(By.id('phoneNumberId')));
    phoneNumber.sendKeys(phone).then(
            function(returnData) {
            	console.log("setPhoneNumber completed");
                setTimeout(setBDayMonth, typeTimeout);
            }
    );
}

//New Function - Recovery email address Optional
// function setRecoveryEmail() {
//     var RecoveryEmail = driver.wait(until.elementLocated(By.aria-label('Recovery email address (optional)')));
//     RecoveryEmail.sendKeys(company).then(
//             function(returnData) {
//                 console.log(returnData);
//                 setTimeout(setCompanySize, typeTimeout);
//             }
//     );
// }

//New Function - select box -  Month
function setBDayMonth() {
    var BDayMonth = driver.wait(until.elementLocated(By.id('month')));
    //console.log("is BDayMonth present?");
    //console.log(BDayMonth);
    BDayMonth.sendKeys('1').then(
            function(returnData) {
            	console.log("setBDayMonth completed");
                setTimeout(setBDayDay, typeTimeout);
            }
    );
}

//New Function
function setBDayDay() {
    var BDayDay = driver.wait(until.elementLocated(By.id('day')));
    BDayDay.sendKeys('01').then(
            function(returnData) {
            	console.log("setBDayDay completed");
                setTimeout(setBDayYear, typeTimeout);
            }
    );
}

//New Function
function setBDayYear() {
    var setBDayYear = driver.wait(until.elementLocated(By.id('year')));
    setBDayYear.sendKeys('2000').then(
            function(returnData) {
            	console.log("setBDayYear completed");
                setTimeout(setGender, typeTimeout);
            }
    );
}

//New Function - select box - M/F
function setGender() {
    var Gender = driver.wait(until.elementLocated(By.id('gender')));
    Gender.sendKeys('2').then(
            function(returnData) {
            	console.log("setGender completed");
                setTimeout(clickNext2, typeTimeout);
            }
    );
}

function clickNext2() {
    var nextLink = driver.wait(until.elementLocated(By.id('personalDetailsNext')));
    nextLink.click().then(
            function(returnData) {
            	console.log("clickNext2 completed");
                setTimeout(setTermsNext, typeTimeout);
            }
    );
}

//Page 3  - Long scrool with I agrree

function setTermsNext() {
    var TermsNext = driver.wait(until.elementLocated(By.id('termsofserviceNext')));
    TermsNext.click().then(
            function(returnData) {
            	console.log("setTermsNext completed");
                setTimeout(setOpenGmail, typeTimeout);
            }
    );
}

//Page 4   - Logged in Welcome page - go to Gmail
//New Function - Open Gmail
function setOpenGmail() {
    var OpenGmai = driver.wait(until.elementLocated(By.data-pid('23')));
        OpenGmai.click().then(
                        function(returnData) {
                                console.log(returnData);
                                setTimeout(clickNext3, typeTimeout);
                        }
        );
}

//Page 5   - Welcome - Email by Google popover -> next

function clickNext3() {
    var nextLink = driver.wait(until.elementLocated(By.name('welcome_dialog_next')));
    nextLink.click().then(
            function(returnData) {
                console.log(returnData);
                setTimeout(clickNext4, typeTimeout);
            }
    );
}

//Page 6   -  Chose a View  - default selected - ranodmize? Default Cofortable Compact

function clickNext4() {
    var nextLink = driver.wait(until.elementLocated(By.name('ok')));
    nextLink.click().then(
            function(returnData) {
                console.log(returnData);
                setTimeout(clickNextAgain, typeTimeout);
            }
    );
}


//o365  spcific code?

function clickNextAgain(response) {
    console.log("in clickNextAgain function");
    var nextAgainLink = driver.wait(until.elementLocated(By.id('MultiPageLayout_Next')));
    nextAgainLink.click().then(
            function(returnData) {
                console.log(returnData);
                //clickReadyToGo(response);
                setTimeout(clickReadyToGo, clickTimeout, response);
            }
    );
    // Add code here to confirm completion of the account creation process and update the database
    // with all the info for the account just created. May also need to exit the program for efficiency.
    //updateAccountInfo(response);
    //driverCleanup();
    // driver.quit();
}

function clickReadyToGo(response) {
    console.log("in clickReadyToGo function");
    setTimeout(updateAccountInfo, 60000, response);
    //var readyToGoLink = driver.wait(until.elementLocated(By.id('MultiPageLayout_Next')), 30000);
    //readyToGoLink.click().then(
    //		function(returnData) {
    //			console.log(returnData);
    //			updateAccountInfo(response);
    //		}
    //);
}

function driverCleanup(response) {
    console.log("in driverCleanup function");
    // do some logging
    driver.quit();
}

//"You’re ready to go…" - #MultiPageLayout_Next
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
}
uId = fName + "." + lName;
domain = company;
fullUId = uId + "@" + domain + ".onmicrosoft.com";

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

/* old webdriver object creation code
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

driver.get('https://products.office.com/en-us/compare-all-microsoft-office-products?tab=2');

driver.wait(until.elementLocated(By.id('pmg-office-biz-premium-try-free-link')), 60000).click();
//driver.findElement(By.id('pmg-office-biz-premium-try-free-link')).click();

var typeTimeout = 5000;
var clickTimeout = 1000;
//setTimeout(setCountry, 5000);
setTimeout(setFirstName, typeTimeout);
//setTimeout(setLastName, 15000);
//setTimeout(setEmailAddress, 20000);
//setTimeout(setPhoneNumber, 25000);
//setTimeout(setCompanyName, 30000);
//setTimeout(setCompanySize, 35000);
//setTimeout(clickNext, 40000);
//setTimeout(setUserId, 45000);
//setTimeout(setDomainName, 50000);
//setTimeout(setPassword, 55000);
//setTimeout(setRePassword, 60000);
//setTimeout(clickCreateAccount, 65000);
//setTimeout(setSMSPhoneNumber, 70000);
//setTimeout(clickTextMe, 75000);

//driver.quit();

function setCountry() {
	var country = driver.wait(until.elementLocated(By.id('StepsData_SelectedRegion')));
	country.sendKeys('US');	
}

function setFirstName() {
	var firstName = driver.wait(until.elementLocated(By.id('FirstName')));
	firstName.sendKeys(fName).then(
			function(returnData) {
				console.log(returnData);
				setTimeout(setLastName, typeTimeout);
			}
	);
}

function setLastName() {
	var lastName = driver.wait(until.elementLocated(By.id('LastName')));
	lastName.sendKeys(lName).then(
			function(returnData) {
				console.log(returnData);
				setTimeout(setEmailAddress, typeTimeout);
			}
	);
}

function setEmailAddress() {
	var emailAddress = driver.wait(until.elementLocated(By.id('StepsData_EmailAddress')));
	emailAddress.sendKeys(email).then(
			function(returnData) {
				console.log(returnData);
				setTimeout(setPhoneNumber, typeTimeout);
			}
	);
}

function setPhoneNumber() {
	var phoneNumber = driver.wait(until.elementLocated(By.id('PhoneNumber')));
	phoneNumber.sendKeys(phone).then(
			function(returnData) {
				console.log(returnData);
				setTimeout(setCompanyName, typeTimeout);
			}
	);
}

function setCompanyName() {
	var companyName = driver.wait(until.elementLocated(By.id('StepsData_OrganizationName')));
	companyName.sendKeys(company).then(
			function(returnData) {
				console.log(returnData);
				setTimeout(setCompanySize, typeTimeout);
			}
	);
}

function setCompanySize() {
	var companySize = driver.wait(until.elementLocated(By.id('StepsData_OrgSize')));
	companySize.sendKeys('50-249').then(
			function(returnData) {
				console.log(returnData);
				setTimeout(clickNext, clickTimeout);
			}
	);
}

function clickNext() {
	var nextLink = driver.wait(until.elementLocated(By.id('MultiPageLayout_Next')));
	nextLink.click().then(
			function(returnData) {
				console.log(returnData);
				setTimeout(setUserId, typeTimeout);
			}
	);
}

function setUserId() {
	var userId = driver.wait(until.elementLocated(By.id('StepsData_UserId')));
	userId.sendKeys(uId).then(
			function(returnData) {
				console.log(returnData);
				setTimeout(setDomainName, typeTimeout);
			}
	);
}

function setDomainName() {
	var domainName = driver.wait(until.elementLocated(By.id('StepsData_DomainName')));
	domainName.sendKeys(domain).then(
			function(returnData) {
				console.log(returnData);
				setTimeout(setPassword, typeTimeout);
			}
	);
}

function setPassword() {
	var password = driver.wait(until.elementLocated(By.id('Password')));
	password.sendKeys(pWord).then(
			function(returnData) {
				console.log(returnData);
				setTimeout(setRePassword, typeTimeout);
			}
	);
}

function setRePassword() {
	var repassword = driver.wait(until.elementLocated(By.id('RePassword')));
	repassword.sendKeys(pWord).then(
			function(returnData) {
				console.log(returnData);
				setTimeout(clickCreateAccount, clickTimeout);
			}
	);
}

function clickCreateAccount() {
	var createAccountLink = driver.wait(until.elementLocated(By.id('MultiPageLayout_Next')));
	createAccountLink.click().then(
			function(returnData) {
				console.log(returnData);
				setTimeout(setSMSPhoneNumber, typeTimeout);
			}
	);
}

function setSMSPhoneNumber() {
	var smsPhoneNumber = driver.wait(until.elementLocated(By.id('SMSPhoneNumber')));
	vphone = 3103443700; //4152908694 7755375021 3102929898
	smsPhoneNumber.sendKeys(vphone).then(
			function(returnData) {
				console.log(returnData);
				setTimeout(clickTextMe, clickTimeout);
			}
	);
}

function clickTextMe() {
	var textMeLink = driver.wait(until.elementLocated(By.id('SendSMSButton_Link')));
	textMeLink.click();
	// Add code here to poll webservice to get challenge code and then call setChallengeCode()
	console.log("checking for code");
	//var responseWithCode = checkForCode();
	checkForCode();
	//console.log(responseWithCode);
	//setChallengeCode(responseWithCode);
}

function setChallengeCode(response) {
	console.log("in setChallengeCode function");
	var code = response.message;
	console.log("challenge code: "+code);
	var challengeCode = driver.wait(until.elementLocated(By.id('VerifyChallengeInput')));
	challengeCode.sendKeys(code);
	clickNextAgain(response);
}

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

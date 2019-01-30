const async_request = require('request-promise');
const generator = require('generate-password');
const moment = require('moment');

const args = process.argv;

//console.log(args);
var firstName, lastName, emailAddress, phoneNumber, companyName, userId, domainName, password, proxy, challengeCode;
for(var i=2;i<args.length;i++){
	  curValues = args[i].split('=');
	  if (curValues[0] == "fname") {
		  firstName = curValues[1];
	  }
	  else if (curValues[0] == "lname") {
		  lastName = curValues[1];	  
	  }
	  else if (curValues[0] == "email") {
		  emailAddress = curValues[1];		  
	  }
	  else if (curValues[0] == "cphone") {
		  phoneNumber = curValues[1];		  
	  }
	  else if (curValues[0] == "company") {
		  companyName = curValues[1];		  
	  }
	  else if (curValues[0] == "password") {
		  password = curValues[1];
	  }
	  else if (curValues[0] == "proxy") {
		  proxy = curValues[1];
	  }
}

//var creationDate = new Date().toDateString();
var creationDate = moment.utc().format("MM-DD-YYYY");
console.log(creationDate);

var getOptions = {
	//http://localhost:8000
	uri: 'http://149.28.244.189:8000/phoneinfo/host_number/' + phoneNumber + '/creation_date/' + creationDate,
	json: true
};

userId = firstName + "." + lastName;
//console.log(userId);
domainName = companyName;

if (!password) {
	password = generator.generate({
	    length: 16,
	    numbers: true,
	    symbols: true,
	    uppercase: true,
	    strict: true,
	    exclude: '{}<>'
	});	
}

//console.log(password);

function checkForCode() {
  var poller = new async_request(getOptions)
	.then(function (response) {
		//var obj = JSON.parse(response);
		console.log("poller executed");
		if (!response) {
			console.log("nothing returned");
			//need to execute call again
			//console.log(poller);
			//console.log(options);
			setTimeout(checkAgain, 1000);
		}
		else {
			//console.log(response);
			if (!response.message) {
				console.log("no message returned");
				//need to execute call again
				setTimeout(checkAgain, 1000);
			}
			else {
				console.log("verification code: "+response.message);
				console.log("row id: "+response._id);
				console.log(response);
				//challengeCode = response.message;
				//rowId = response._id;
				updateAccountInfo(response);
			}
		}
	})
	.catch(function (err) {
		// API call failed...
		console.log("error is:" + err);
	});
}

function updateAccountInfo(accountInfo) {
	var bodyString = {
			"first_name": firstName,
			"last_name": lastName,
			"email_address": emailAddress,
			"phone_number": phoneNumber,
			"company_name": companyName,
			"user_id": userId,
			"domain_name": domainName,
			"password": password,
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

checkForCode();

/*
var dateValue = new Date();
console.log("Date(): "+dateValue);
console.log("Date().toDateString(): "+dateValue.toDateString());
console.log("Date().toISOString(): "+dateValue.toISOString());
console.log("Date().toJSON(): "+dateValue.toJSON());
console.log("Date().toLocaleDateString(): "+dateValue.toLocaleDateString());
console.log("Date().toLocaleTimeString(): "+dateValue.toLocaleTimeString());
console.log("Date().toLocaleString(): "+dateValue.toLocaleString());
console.log("Date().toString(): "+dateValue.toString());
console.log("Date().toTimeString(): "+dateValue.toTimeString());
console.log("Date().toUTCString(): "+dateValue.toUTCString());
console.log(moment.utc().format("MM-DD-YYYY"));
console.log(moment.utc().format());
*/
//console.log(dateValue.toLocaleDateString());

/*
request({
  "method":"GET", 
  "uri": "https://api.github.com/",
  "json": true,
  "headers": {
    "User-Agent": "My little demo app"
  }
}).then(console.log, console.log);
*/
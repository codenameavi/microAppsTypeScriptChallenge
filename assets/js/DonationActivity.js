/**        
	Class DonationActivity
	Handles all after-AJAX activity
	DOM manipulations, redirects, write-localStorage
**/
export class DonationActivity {
	constructor() {
		this.payOnScriptHost = "https://test.oppwa.com/v1/paymentWidgets.js";
		this.bindElementActivity();
	}
	
	// bind all events
	bindElementActivity() {	
	
		// clicking on DOnate Again button- Show first screen with Donation-form
		document.body.addEventListener('click', (event)=>{
			if (event.target.id.toLowerCase() === 'donateagain') {
				this.goNextBreadCrumb(1).goNextScreen(1);
			}
		});
		
		return this;	// enabling method chaining
	}
	
	// Prepared Checkout successfully
	startDonationSuccess(response) {
		// Adding PayonScript to the Head
		var payOnScript = document.createElement("script");
		payOnScript.type = "text/javascript";
		payOnScript.src = this.payOnScriptHost+"?checkoutId="+response.id;
		document.querySelector('head').appendChild(payOnScript);
		
		this.goNextBreadCrumb().goNextScreen();	// method chaining
	}
	
	// Got Payment status successfully
	getDonationStatusSuccess(response) {
		//console.log(response);
		
		document.querySelector('#processingScreen h3').innerHTML = 'Donation Status';
		document.querySelector('#processingScreen p').innerHTML = response.result.description;
		
		// checking if Payment is successful
		let [statusCode1, statusCode2, statusCode3] = response.result.code.split(".");		// de-structuring array
		//console.log(statusCode1, statusCode2, statusCode3);
		
		if(statusCode1 == '000' ){	// need to add more verifications
			localStorage.setItem('lastPaymentResp', JSON.stringify(response));	// if donation success, set response
			// go to next screen after few seconds
			setTimeout(()=>{
				// remove parameters from URL- without reloading.
				// So that- if user refreshes- it will not check Payment-status again
				window.history.pushState({}, document.title, window.location.pathname);
				// show Thank You & history
				this.goNextBreadCrumb().goNextScreen().showThankYouText().showHistoryBlock();
			}, 3000);
			
		} else {
			// dont go to next screen
			
		}
	}
	
	donationError(err) {
		alert('There is an error: '+err+'. Please reload the App.');
	}
	
	// if no argument, Activate next breadcrumb in top pane
	// if argument, activate breadcrumb for that screen
	goNextBreadCrumb(screenNumber = 0) {
		let activateNextFlag = false;	// flag to make the next item active
		let breadCrumbArr = document.querySelectorAll('nav a.breadcrumb');
		//console.log(breadCrumbArr.length);
		
		for(let i=0; i<breadCrumbArr.length; i++) {
			let eachItem = breadCrumbArr[i];
			//console.log(eachItem);
			
			// if screenNumber set, activate that item
			if(screenNumber && screenNumber==(i+1)) {
				activateNextFlag = true;
			}
			
			if(activateNextFlag){
				// making the Next step Active
				eachItem.classList.add('active');
				activateNextFlag = false;
			} else {
				if(eachItem.classList.contains('active')){
					if(!screenNumber){
						// found the current Active step
						activateNextFlag = true;
					}
					eachItem.classList.remove('active');
				}
			}
		}
		
		return this;
	}
	
	// if no argument, Activate next screen
	// if argument, activate that screen
	goNextScreen(screenNumber = 0) {
		let activateNextFlag = false;	// flag to make the next screen active
		let screenArr = document.querySelectorAll('div.screen');
		//console.log(screenArr.length);
		
		for(let i=0; i<screenArr.length; i++) {
			let eachItem = screenArr[i];
			//console.log(eachItem);
			
			// if screenNumber set, activate that item
			if(screenNumber && screenNumber==(i+1)) {
				activateNextFlag = true;
			}
			
			if(activateNextFlag){
				// making the Next screen Active
				eachItem.classList.add('active');
				activateNextFlag = false;
			} else {
				if(eachItem.classList.contains('active')){
					if(!screenNumber){
						// found the current Active step
						activateNextFlag = true;
					}
					eachItem.classList.remove('active');
				}
			}
		}
		
		return this;
	}
	
	// set Thank You message in Screen
	showThankYouText() {
		let thanksHtml = '<h3 class="donationHeader center-align">Thank you for donation</h3>';
		let currentScreen = document.querySelector('.screen.active');
		currentScreen.insertAdjacentHTML('beforeend', thanksHtml);
		return this;
	}
	
	// show payment-history block
	showHistoryBlock() {
		let lastPaymentRespStr = localStorage.getItem('lastPaymentResp');
		if(lastPaymentRespStr){
			let lastPaymentRespObj = JSON.parse(lastPaymentRespStr);
			
			let lastDetailsHtml = '<table id="historyTable" class="striped">'
									+'<tr><th colspan="2" class="center-align">Last Donation Details</th></tr>';
			// Payment amount
			lastDetailsHtml += '<tr><td><strong>Amount</strong></td>'
								+'<td>'+lastPaymentRespObj.amount+' '+lastPaymentRespObj.currency+'</td></tr>';
			//Payment-time 
			lastDetailsHtml += '<tr><td><strong>Time</strong></td>'
								+'<td id="paymentTime"></td></tr>';
			//populate Donate-Again button
			lastDetailsHtml += '<tr><td colspan="2" id="donateAgainBlock" class="center-align"></td></tr>';
			lastDetailsHtml += '</table>';
		   
			let currentScreen = document.querySelector('.screen.active');
			currentScreen.insertAdjacentHTML('beforeend', lastDetailsHtml);
			
			// populating & refreshing Payment-time & remaining-time to be able to Donate-again
			this.donateAgainBlock(lastPaymentRespObj.timestamp);
			this.donateAgainInterval = setInterval(()=>{
				this.donateAgainBlock(lastPaymentRespObj.timestamp);
			}, 1000);
		}
		return this;
	}
	
	// populate Last-Payment-time & Donate-Again-Button
	donateAgainBlock(lastPaymentTimestamp) {
		//console.log('donateAgainBlock called');
		let timeDiffDetails = this.getTimeDiffDetails(lastPaymentTimestamp);
		
		let paymentTimeHtml = timeDiffDetails.timeDiffStr;
		let donateAgainHtml = '';
		// insert 'Donate again' button- if more than 1 hour
		if(timeDiffDetails.donateAgain) {
			donateAgainHtml = '<button id="donateAgain" class="btn-large waves-effect waves-light">Donate Again</button>';
			clearInterval(this.donateAgainInterval);	// if able to donate again, stop interval
		} else {
			donateAgainHtml = '<button class="btn-large disabled">Donate Again in '+timeDiffDetails.ableToDonateTime+'</button>';
		}
		
		let paymentTimeCell = document.querySelector('#paymentTime');
		paymentTimeCell.innerHTML = paymentTimeHtml;
		
		let donateAgainCell = document.querySelector('#donateAgainBlock');
		donateAgainCell.innerHTML = donateAgainHtml;
		
		return false;
	}
	
	// return better formatted time difference
	getTimeDiffDetails(paymentTimeUnix) {
		let unixPaymentTime = Math.floor(Date.parse(paymentTimeUnix)/1000);	// payment Unix UTC time
		let currentUtcUnixTime = Math.floor(Date.now()/1000);              // Current UTC time
	   
		let timeDiffInSecond = currentUtcUnixTime-unixPaymentTime;
		//console.log(timeDiffInSecond);
		let timeDiffHr = Math.floor(timeDiffInSecond/3600);
		let timeDiffMin = Math.floor((timeDiffInSecond%3600)/60);
		let timeDiffSec = Math.floor((timeDiffInSecond%3600)%60);
		//console.log(timeDiffHr+' , '+timeDiffMin+' , '+timeDiffSec);
	   
		let timeDiffStr = '';
		let donateAgain = false;
		let ableToDonateTime = '';	// will be able to to donate again- remaining time
		if(timeDiffHr>=1){
			donateAgain = true;
			timeDiffStr = timeDiffHr+' hour(s) ago';
		} else {
			ableToDonateTime = (60-timeDiffMin-1)+' min(s) '+(60-timeDiffSec-1)+' sec(s)';
			timeDiffStr = (timeDiffMin>0) ? timeDiffMin+' minute(s) ago' : 'Just now';
		}
		
		let timeDiffDetails = {'timeDiffStr':timeDiffStr, 'donateAgain':donateAgain, 'ableToDonateTime':ableToDonateTime};
		return timeDiffDetails;
	}
}
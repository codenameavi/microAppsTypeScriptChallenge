 /**       
	Class Activity
	Handles all synchronous activity with view
	Event-bindings, redirects, read-localstorage
**/
import {Donation} from './Donation.js';
import {DonationActivity} from './DonationActivity.js';

export class Activity {
	constructor() {
		this.donation = new Donation();
		this.donationActivity = new DonationActivity();
	}
	
	// initializing
	init() {
		this.bindElementActivity().setPaymentFormAction().checkIfJustPaid();
	}
	
	// checking if redirected back - after a payment 
	checkIfJustPaid() {
		let actionString = window.location.href;
		if(actionString.indexOf('#processPayment') !== -1){
			// redirected back after payment 
			// get query string parameter
			let queryString = window.location.search;	// ?id=40C477...sbg-vm-tx01&resourcePath=%2Fv1%2Fcheckouts%2F40...
			// check if resourcePath exists
			let resourcePathPos = queryString.indexOf('resourcePath=');
			if(resourcePathPos != -1){
				let resourceParam = queryString.substring(resourcePathPos);
				// just checking & trimming, if there is any other parameter at end
				if(resourceParam.indexOf('&') !== -1){
					resourceParam = queryString.substring(resourcePathPos, resourceParam.indexOf('&'));
				}
				let [resourceKey, resourcePath] = resourceParam.split("=");		// destructuring param name, value		
				// if a valid resourcePath available
				if(resourcePath.length >0){
					// activating Process breadcrumb & screen 
					this.donationActivity.goNextBreadCrumb(3).goNextScreen(3);
				
					// get payment status
					this.donation.getDonationStatus(resourcePath);
					return false;
				}
			}
		}
		
		// Not redirected after a payment, show first page
		// checking if Donated before 1 hour
		let activateFirstScrn = true;
		let lastPaymentRespStr = localStorage.getItem('lastPaymentResp');
		if(lastPaymentRespStr){
			let lastPaymentRespObj = JSON.parse(lastPaymentRespStr);
			let timeDiffDetails = this.donationActivity.getTimeDiffDetails(lastPaymentRespObj.timestamp);
			if(!timeDiffDetails.donateAgain) {
				// activating Last(Thank You) breadcrumb & screen 
				this.donationActivity.goNextBreadCrumb(4).goNextScreen(4);
				this.donationActivity.showThankYouText().showHistoryBlock();
				activateFirstScrn = false;
			}
		}
		
		// activating First breadcrumb & screen 
		if(activateFirstScrn){
			this.donationActivity.goNextBreadCrumb(1).goNextScreen(1);
		}
		
		return true;
	}
	
	// bind all events
	bindElementActivity() {
		let donateFormElem = document.querySelector('#makeDonationForm');	
		donateFormElem.addEventListener('submit', this.makeDonationActivity);
		
		return this;	// enabling method chaining
	}
	
	// preparing the checkout
	// form submitted
	makeDonationActivity(event) {
		// disable form submit
		let submitBttn = document.querySelector('#makeDonationForm button[type=submit]');
		submitBttn.setAttribute('disabled', 'disabled');
		
		let errorFlag = false;
		// validate Amount
		let amountElem = document.querySelector('#amount');
		amountElem.classList.remove('invalid');
		let amount = parseFloat(amountElem.value);
		if(isNaN(amount) || !amount || amount<=0) {
			alert('Please enter a valid amount');
			errorFlag = true;
		} else {
			if(amount>100){
				alert('Please donate an amount lesser than 100');
				errorFlag = true;
			}
		}
		if(errorFlag){
			amountElem.classList.add('invalid');
			submitBttn.removeAttribute('disabled');
			event.preventDefault();
			return false;
		}
		
		// validate Currency
		let validCurrencyArr = ['USD', 'EUR'];
		let currency = document.querySelector('#currency').value;
		//console.log(currency);
		if(!currency || validCurrencyArr.indexOf(currency)==-1){
			alert('Please select a valid currency');
			errorFlag = true;
		}
		if(errorFlag){
			document.querySelector('#makeDonationForm .select-dropdown').classList.add('invalid');
			submitBttn.removeAttribute('disabled');
			event.preventDefault();
			return false;
		}
		
		let donation = new Donation();
		donation.makeDonation(amount, currency);
		event.preventDefault();
	}
	
	
	// Setting form action
	// Adding a flag from our end- to make sure once paid & redirected back
	setPaymentFormAction() {
		let actionString = window.location.protocol+'//'+window.location.hostname+window.location.pathname + '#processPayment';		// getting up-to file name
		//console.log(actionString);
		document.querySelector('#paymentForm').setAttribute('action', actionString);
		return this;
	}
};


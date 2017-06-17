/*
	Class: Donation
	Handles all API AJAX calls
*/
import {DonationActivity} from './DonationActivity.js';

export class Donation {
	constructor() {
		this.checkoutUrl = './donation/checkout.php';
		this.getStatusUrl = './donation/getPaymentStatus.php';
		
	}
	
	checkAvailability() {
		// check last donation time
		// 1 hour past or not  
		this.message = '123';
	}
	
	makeDonation(amount, currency) {
		// AJAX call to start a donation
		// step 1: preparing checkout
		let donationActivity = new DonationActivity();
		this.checkoutUrl += '?amount='+amount+'&currency='+currency;
		fetch(this.checkoutUrl, {
			method: 'get',
			headers: {  
				"Content-type": "application/x-www-form-urlencoded; charset=UTF-8"  
			},
			mode: 'no-cors'
		}).then((response)=>{
			return response.json();
			
		}).then((resObj)=>{
			//console.log(resObj);
			donationActivity.startDonationSuccess(resObj);
			
		}).catch((err)=>{
			// Error :(
			console.warn(err);
			donationActivity.donationError(err);
		});
	}
	
	getDonationStatus(resourcePath){
		// AJAX call to get a donation status
		// step 3: Get the payment status
		let donationActivity = new DonationActivity();
		this.getStatusUrl += '?resourcePath='+resourcePath;
		fetch(this.getStatusUrl, {
			method: 'get',
			headers: {  
				"Content-type": "application/x-www-form-urlencoded; charset=UTF-8"  
			},
			mode: 'no-cors'
		}).then((response)=>{
			return response.json();
			
		}).then((resObj)=>{
			//console.log(resObj);
			donationActivity.getDonationStatusSuccess(resObj);
			
		}).catch((err)=>{
			// Error :(
			console.warn(err);
			donationActivity.donationError(err);
		});
	}
	
	getLastDonationDetails() {
		// returns last donation data from local-storage
		this.message = '123';
	}
	
};
const DigestFetch = require('digest-fetch');
const colors = require('colors');

const myEnergiConfig = {
	api: 'https://myenergi.net/cgi-jstatus-*',
	eddiUrl : 'cgi-jstatus-E'
}

module.exports = class MyEnergi{

	constructor(username, password){
		this.username = username;
		this.password = password;

		this.refreshInterval = 1000 * 60;
		this.client = null;
		this.intervalTick = null;
		this.asn = null;
		this.currentPowerUsage = {
			"date": null,
			"time" : null,
			"grid": 0,
			"generation": 0,
			"frequency": 0,
			"volatage": 0,
			"exccess" : 0,
			"consumption" : 0
		};

		this.eddieCallbackFun = null;
	}

	init () {		

		return new Promise((resolve,reject) => {
			this.client = new DigestFetch(this.username, this.password);
			this.client.fetch(myEnergiConfig.api, {})
				.then(resp => resp.json())
				.then(data => {
					data.forEach((item) => {
						if(('asn' in item)) {
							this.asn = item.asn;
							resolve(true);
						}
					});

					if(!this.asn) {
						reject('ASN not found');
					}
				})
				.catch((e) => {
					reject(e);
				})
		})
		
	}

	dispose () {
		clearInterval(this.intervalTick);
	}

	eddieCallback (callback, refreshInterval) {

		this.eddieCallbackFun = callback;
		if(!this.intervalTick) {
			if(refreshInterval) {
				this.refreshInterval = refreshInterval;
			}
			this._startScheduledTasks();
		}

	}

	_startScheduledTasks () {		
		this._scheduledTasks();
		this.intervalTick = setInterval(() => {
			this._scheduledTasks();
		}, this.refreshInterval);
	}

	_scheduledTasks() {				
		if(this.eddieCallback) {
			this.client.fetch(`https://${this.asn}/${myEnergiConfig.eddiUrl}`, {})
				.then(resp => resp.json())
				.then(data => this._setEddiePowerUsageStatus(data))
				.catch(e=>console.error(e))
		}

	}

	_setEddiePowerUsageStatus (data) {
		
		let usageData = data.eddi[0];

		if(this.currentPowerUsage.date !== usageData.dat){
			this.currentPowerUsage.date = usageData.dat;
		}

		if(this.currentPowerUsage.time !== usageData.tim){
			this.currentPowerUsage.time = usageData.tim;
		}

		if(this.currentPowerUsage.grid !== usageData.grd){
			this.currentPowerUsage.grid = usageData.grd;
		}

		if(this.currentPowerUsage.generation !== usageData.gen){
			this.currentPowerUsage.generation = usageData.gen;
			
		}

		if(this.currentPowerUsage.frequency !== usageData.frq){
			this.currentPowerUsage.frequency = usageData.frq;
		}

		if(this.currentPowerUsage.volatage !== usageData.vol){
			this.currentPowerUsage.volatage = usageData.vol;
		}

		this.currentPowerUsage.consumption = this.currentPowerUsage.grid + this.currentPowerUsage.generation;

		if(usageData.div) {
			this.currentPowerUsage.exccess = usageData.div;		
		}else{
			this.currentPowerUsage.exccess = 0;
		}
		
		this.eddieCallbackFun(this.currentPowerUsage);
	}



	_logUsageSummary() {
		console.log(`Power Usage.`.grey.underline);
		console.log(`Current Grid Power : ${this.currentPowerUsage.grid}`.red);
		console.log(`Current Grid Generation : ${this.currentPowerUsage.generation}`.red);
		console.log(`Excess power : ${this.currentPowerUsage.exccess}`.red);
		console.log(`Total Compustion : ${this.currentPowerUsage.consumption}`.red);
		console.log(`Current Grid Volatage : ${this.currentPowerUsage.volatage}`.red);
		console.log(`Current Grid Frequency : ${this.currentPowerUsage.frequency}`.red);
	}

}
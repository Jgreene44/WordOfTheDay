
//We need to register the module with the MagicMirror code
Module.register("WordOfTheDay",{
	// Default module config, we have our header text and how often we should update the module
	defaults: {
		updateInterval: 120000,
		headerText: "Word Of The Day"
	},
	
	//We want at least this version. This is what the Github Howto docs said
	requiresVersion: "2.1.0",

	start: function() {
		var self = this;
		var dataNotification = null;

		// Make an update timer that is going to call updateDom to draw to screen when the updateInterval is reached.
		this.getData();
		setInterval(function() {
			self.updateDom();
		}, this.config.updateInterval);
	},
	
	
	//Load our CSS styles that we want to work with to style the elements of the module
	getStyles: function() {
		return [
			this.file('style.css'), 
		]
	},

	//We need this script so we can convert XML to JSON easily since Merriam-Webster data is returned in XML format.
	getScripts: function() {
		return [
			'xml2json.min.js',
		]
	},
	
	//This is our API call that is using node_helper to grab data.
	getData: function() {
		var self = this;
		this.sendSocketNotification("WordOfTheDay_Update", null);
	},
	
	//This is a timing system that schedules updates for the system so we can redraw the frontend.
	scheduleUpdate: function(intervalDelay) {
		//Grab the interval time from the config file
		var nextInterval = this.config.updateInterval;
		//Error checking to see if the parameter is valid, worse case we just use the original value
		if (typeof intervalDelay !== "undefined" && intervalDelay >= 0) {
			nextInterval = intervalDelay;
		}
		nextInterval = nextInterval ;
		var self = this;

		//We then run getData to get API data after the interval is reached
		setTimeout(function() {
			self.getData();
		}, nextInterval);
	},


	//When the API data is received we are going to clean it and update the DOM with it's findings
	socketNotificationReceived: function (notification, payload) {
		var self = this;
		//make sure we get the correct notification
		if(notification === "WordOfTheDay_Update") {
			var xml2json = new X2JS();
			var json = xml2json.xml_str2json( payload );
			this.dataNotification = json;
			self.updateDom(self.config.animationSpeed);
		}
	},

	// This is how we draw to the screen. We use DOM elements and fill them in dynamically with HTML and CSS
	getDom: function() {
		var self = this;
		var wrapper = document.createElement("div");
		var Word = document.createElement("div");
		Word.setAttribute('class', 'WordOfTheDay-Word');
		var moduleHeader = document.createElement("header");
		moduleHeader.setAttribute('class', 'WordOfTheDay-Header module-header');
		moduleHeader.innerHTML = "<span style=\"text-decoration: underline;\">" + this.config.headerText + "</span>";
		var definition = document.createElement("span");
		definition.setAttribute('class', 'WordOfTheDay-Definition');
		if(this.dataNotification != null){
			Word.innerHTML = this.dataNotification.rss.channel.item[0].Word;
			definition.innerHTML = this.dataNotification.rss.channel.item[0].shortdef;
		}
		wrapper.appendChild(moduleHeader);
		wrapper.appendChild(Word);
		wrapper.appendChild(definition);
		return wrapper;
	},
});
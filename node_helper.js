
//We need node helper and request before we can start the MM
var NodeHelper = require("node_helper");
var request = require('request');


module.exports = NodeHelper.create({

	//This is used to talk to the MM interface and use external calls to update the front end.
	//We are going to override socketNotificationReceived so that we can use our API to update front end

	socketNotificationReceived: function(notification, payload) {
		var self = this;

		//If we get a notification that is from out data update command
		// we are going to contact merriam websters rss feed and grab their word of the day
		if (notification === "WordOfTheDay_Update") {
			var urlApi = "https://www.merriam-webster.com/wotd/feed/rss2";
			//Request function to grab data from the API
			//We are going to pass in error, response, body so we can keep track of errors and content fetched
			request({ url: urlApi, method: 'GET' }, function (error, response, body) {
				//Making sure there are no errors and status code 200 means "OK" or request succeeded
				if (!error && response.statusCode == 200) {
					var result = body;
					//Overwriting result and sending that with another notification but this will update frontend
					self.sendNotificationUpdate(result);
					//Or else we are going to log the error we received to see what is wrong in debugging
				} else if (error) {
					console.log(error);
				}
			});
		}
	},

	sendNotificationUpdate: function(payload) {
		this.sendSocketNotification("WordOfTheDay_Update", payload);
	},
});
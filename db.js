var  mongoose = require('mongoose')
	,crypto = require('crypto')
	,models = require('./models');
	
module.exports = function(){
	var openCallbacks = [];
	var errorCallbacks = [];
	function onOpen(e){
		for(var i=0,length=openCallbacks.length; i<length; i++) {
			openCallbacks[i](e);
		}
	};
	function onError(e){
		for(var i=0,length=errorCallbacks.length; i<length; i++) {
			errorCallbacks[i](e);
		}
	};
	
	//db	
	return {
		category: void 0,
		offer: void 0,
		item: void 0,
		user: void 0,
		loginToken: void 0,
		open: function(host,dbName) {
			var self = this;
			var c = mongoose.createConnection(host,dbName);
			c.once('open', function(){
				models.defineModels(mongoose, crypto, function () {
					self.category = c.model('Category');
					self.offer = c.model('Offer');
					self.item = c.model('Item');
					self.user = c.model('User');
					self.loginToken = c.model('LoginToken');
					//fire
					onOpen();
				});
			});
			c.on('error', function(e){
				onError(e);
			});
		},
		on: function(eventName, callback) {
			switch(eventName){
				case 'open':
					openCallbacks.push(callback);
					break;		
				case 'error':
					errorCallbacks.push(callback);
					break;			
			}
		}
	}
} 


	

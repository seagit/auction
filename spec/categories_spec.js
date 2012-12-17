var  db = require('../db.js')()
	,categories
	,isConnected = false;

describe('test categories.js', function(){
	beforeEach(function () {
		db.on('open', function () {
			categories = require('../categories.js')(db.category);
			isConnected = true;
		});
		db.open('localhost', 'auction');
		waitsFor(function() {return isConnected;}, 5000);
	});
	//refresh
	it('refresh', function(done){
		if (isConnected) {
			categories.refresh(function(err,c) {
				if (err) {
					done('refresh is failed:'+err);
				} else {
					expect(c.all).toBeDefined();
					expect(c.main.length).toEqual(12);
					done();
				}
			});
		} else {
			done('database is not opened');
		}
	});
});

var express = require('express')
	,connect = require('connect')
	,jade = require('jade')
	,http 	= require('http')
	,path 	= require('path')
	,SessionStore = require('connect-mongo')(express)
	,db = require('./db')();
	
//Express
var app = express();

//helpers
app.locals({appName: 'Auction', version: '0.1'});

//db
db.open('localhost','auction');

//db connection is failed
db.on('error', function (e) {
	console.log('Database ' + e);
});

//db connection is successfull
db.on('open', function () {
	console.log('Database "auction" has been opened');
	
	//main objects : categories, users, items, offers
	app.categories = require('./categories')(db.category);
	app.categories.refresh(function(err,c) {
		if (err) {
			console.log("Refresh categories was failed: "+err);
			return;
		} 
		app.locals({categories: c});
	});
	app.users = require('./users')(db.user);
	app.items = require('./items')(db.item);
	app.offers = require('./offers')(db.offer);
	app.LoginToken = db.loginToken;
	
	//configuration
	app.configure(function(){
		app.set('port', process.env.PORT || 3000);
		app.set('views', __dirname + '/views');
		app.set('view engine', 'jade');
		app.use(express.favicon());
		app.use(express.logger('dev'));
		app.use(express.bodyParser());
		app.use(express.methodOverride());
		app.use(express.cookieParser('cookie secret'));
		app.use(express.session({
		secret: 'secret', 
		store: new SessionStore({
			  db: 'auction'
			})
		}));
		app.use(app.router);
		app.use(require('stylus').middleware(__dirname + '/public'));
		app.use(express.static(path.join(__dirname, 'public')));
	});

	app.configure('development', function(){
		app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
	});

	app.configure('production', function(){
		app.use(express.errorHandler()); 
	});
	
	//routes
	require('./routes')(app);

	//http server
	http.createServer(app).listen(app.get('port'), function(){
		console.log("Exchange auction listening on port %d, environment: %s",app.get('port'), app.settings.env);
		console.log('Using connect %s, Express %s, Jade %s', connect.version, express.version, jade.version);
	});
});


	

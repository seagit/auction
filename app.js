var express = require('express')
	,everyauth = require('everyauth')
	,connect = require('connect')
	,jade = require('jade')
	,http 	= require('http')
	,path 	= require('path')
	,SessionStore = require('connect-mongo')(express)
	,db = require('./db')();

everyauth.debug = true;
everyauth.facebook
	.appId('424733187608905')
	.appSecret('9ff74c70276c16452807c2a966f71b69')
	.handleAuthCallbackError( function (req, res) {
		// If a user denies your app, Facebook will redirect the user to
		// /auth/facebook/callback?error_reason=user_denied&error=access_denied&error_description=The+user+denied+your+request.
		// This configurable route handler defines how you want to respond to
		// that.
		// If you do not configure this, everyauth renders a default fallback
		// view notifying the user that their authentication failed and why.
	})
	.findOrCreateUser( function (session, accessToken, accessTokExtra, fbUserMetadata) {
		// find or create user logic goes here
	})
	.redirectPath('/');

everyauth.vkontakte
	.appId('3403773')
	.appSecret('0Tt4BcLG1ggW9FVdjkoP')
	.scope('photo')
	.findOrCreateUser( function (session, accessToken, accessTokenExtra, vkUserMetadata) {
		// find or create user logic goes here
		// Return a user or Promise that promises a user
		// Promises are created via
		//     var promise = this.Promise();
		// No need to fetch session from cookie. It already was fetched for you and is available via the incoming `session` parameter

		//session.whatever = 'foo'; // Just work directly with session's accessors
		// These assignments should be persisted for you automatically because of the way connect.session and connect-mongodb work together

		/*var userPromise = this.Promise(); // Remember, the point of this is to return a user object or user promise
		someMongoApi.collection('users').findOne({fbId: fbUserMetadata.id}, function (err, user) {
			if (err) return userPromise.fail(err);
			if (user) return userPromise.fulfill(user);
			// If we don't find a user, create one
			var userData = userDataFromFbMetadata(fbUserMetadata);
			someMongoApi.collection('users').insert(userData, function (err, createdUser) {
				if (err) return userPromise.fail(err);
				return userPromise.fulfill(createdUser);
			});
		});
		return userPromise;  */
	})
	.redirectPath('/');

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
		app.use(require('connect-flash')());
		// Expose the flash function to the view layer
		app.use(function(req, res, next) {
			res.locals.flash = function() { return req.flash() };
			next();
		})
		app.use(everyauth.middleware(app));
		app.use(app.router);
		app.use(require('stylus').middleware(__dirname + '/public'));
		app.use(express.static(path.join(__dirname, 'public')));
		app.use(express.limit('1mb'));
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


	

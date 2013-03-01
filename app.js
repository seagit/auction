var express = require('express')
	,everyauth = require('everyauth')
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
	
	//everyauth
	//everyauth.helpExpress(app);
	
	everyauth.debug = true;
	everyauth.facebook
	.appId('424733187608905')
	.scope('email')
	.fields('id,name,email,picture')
	.appSecret('9ff74c70276c16452807c2a966f71b69')
	.handleAuthCallbackError( function (req, res) {
		console.log('handleAuthCallbackError req:'+req);
		console.log('handleAuthCallbackError res:'+res);
	})
	.findOrCreateUser( function (session, accessToken, accessTokExtra, fbUserMetadata) {
		Users.findOne( { email: fbUserMetadata.email }, function(err, user) {
			
			//Data from Facebook
			// accessToken: AAAGCSubFkUkBAGGEyCGoQJAG2TPkiH61MT2kw3YSSjxTVqZANZACkKm22ZBaMevLVY5DVo3Oi3ISCeCIzFCrAdi2Er7uRXY1ySaKnWgKAZDZD
			// accessTokExtra: { expires: '5183505' }
			// fbUserMetadata:{ id: '100001433488760', name: 'John', email: 'john@gmail.com', picture:{{data: {url: http://profile.fgfr.re333.jpg} }} }
			
			var userPromise = this.Promise();
			
			if (err) {
				return userPromise.fail(err);
			}
			
			if (!user) {
				var userData = {};
				userData.name = fbUserMetadata.name;
				userData.email = fbUserMetadata.email;
				userData.picture = fbUserMetadata.picture.data.url;
				userData.token = accessToken;
				//userData.fbData = userData;
				app.users.add(userData, function(err,createdUser) {
					return user ? userPromise.fulfill(createdUser) : userPromise.fail(err);
				});
				
				/*
				req.session.user_id = user.id;
	            req.session.user_name = user.name;
				req.currentUser = user;
				res.send({ status: 'OK', msg: 'login is successful', uid: user.id });
				*/
			} 
			
			return userPromise.fulfill(user);
	  }); 
	})
	.redirectPath('/');
	
	/*	
	everyauth.everymodule.findUserById(function(userId, cb) {
		console.log('findByUserId called');
	});
	*/	
	
	/*
	everyauth.vkontakte
		.appId('3403773')
		.scope('email')
		.fields('id,name,email')
		.appSecret('0Tt4BcLG1ggW9FVdjkoP')
		.scope('photo')
		.findOrCreateUser( function (session, accessToken, accessTokenExtra, vkUserMetadata) {
			console.log('____session');
			console.log(session);
			console.log('____accessToken');
			console.log(accessToken);
			console.log('____accessTokExtra');
			console.log(accessTokExtra);
			console.log('____vkUserMetadata');
			console.log(vkUserMetadata);
		})
		.redirectPath('/');
	*/
});


	

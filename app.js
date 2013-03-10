var express = require('express')
	,FACEBOOK_APP_ID = '424733187608905'
	,FACEBOOK_APP_SECRET = '9ff74c70276c16452807c2a966f71b69'
	,passport = require('passport')
    ,FacebookStrategy = require('passport-facebook').Strategy
	,LocalStrategy = require('passport-local').Strategy
	,connect = require('connect')
	,jade = require('jade')
	,http 	= require('http')
	,path 	= require('path')
	,SessionStore = require('connect-mongo')(express)
	,db = require('./db')();

//PASSPORT

// Passport session setup.
passport.serializeUser(function(user, done) {
	done(null, user.id);
});

passport.deserializeUser(function(id, done) {
	app.users.findById(id, function(err, user) {
		done(err, user);
	});
});

// FacebookStrategy within Passport.
passport.use(new FacebookStrategy({
		clientID: FACEBOOK_APP_ID,
		clientSecret: FACEBOOK_APP_SECRET,
		profileURL: 'https://graph.facebook.com/me?fields=id,name,picture,email',//profileFields: ['emails', 'displayName', 'photos'],
		callbackURL: 'http://auction.vanukin.com:3000/auth/facebook/callback'
  },
  function(accessToken, refreshToken, profile, done) {
    app.users.findOne( { fbAccessToken: accessToken }, 
		function(err, user) {
			if (err || user) {
				console.log('The user/err has been found: ' + err + '/' + (user && user.id));
				return done(err, user);
			}
			
			var userData = {};
			userData.name = profile._json.name;
			userData.email = profile._json.email;
			userData.picture = profile._json.picture.data.url;
			userData.fbAccessToken = accessToken;
			
			app.users.add(userData, function(err, newUser) {
				console.log('The user has been created: ' + newUser.id );
				done(err, newUser);
			});
		}); 
}));

// LocalStrategy within Passport.
passport.use(new LocalStrategy({
		usernameField: 'email',
		passwordField: 'password'
	},
	function(username, password, done) {
		app.users.findOne({ email: username }, function(err, user) {
			if ( user && user.authenticate(password) ) {
				console.log('The user has been found: ' + user.id);
				return done(null, user);//res.send({ status: 'OK', msg: 'login is successful', uid: user.id });
			} else if (err) {
				console.log("Error: "+err.message);
				return done(err);
			} else {
				console.log("Invalid user. Incorrect credentials");
				return done(null, false, { message: 'Incorrect password.' });//res.send({status: 'ERR', msg: 'Incorrect credentials'});
			}
		});
	}
));

//Express
var app = express();

//helpers
app.locals({appName: 'Auction', version: '0.1'});

app.passport = passport;

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
		
		// Initialize Passport!  Also use passport.session() middleware, 
		// to support persistent login sessions (recommended).
		app.use(passport.initialize());
		app.use(passport.session());
		
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


	

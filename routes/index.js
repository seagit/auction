var util = require('util');

module.exports = function(app) 
{
	var Users = app.users,
		Items = app.items,
		Offers = app.offers,
		Categories = app.categories,
		LoginToken = app.LoginToken;
		
	//main page	
	app.get('/', function(req, res) {
		res.render('index', { title: 'Exchange auction', categories: Categories.main, currentUser: req.session.user_name });		
	});
	//development
	app.get('/dev', loadUser, function(req, res) {
		res.render('dev', {title: 'Development`s tools'});
	});
	
	// Sessions
	app.post('/login', function(req, res) {
		console.log("post /login; email:"+req.body.email);
		
		Users.findOne({ email: req.body.email }, function(err, user) {
			if ( user && user.authenticate(req.body.password) ) {
				console.log("Invalid user. Incorrect credentials");
				req.session.user_id = user.id;
	            req.session.user_name = user.name;
				req.currentUser = user;
				res.send({ status: 'OK', msg: 'login is successful', userId: user.id });
			} else {
				console.log("Invalid user. Incorrect credentials");
				res.send({status: 'ERR', msg: 'Incorrect credentials'});
			}
	  }); 
	});

	app.del('/login', loadUser, function(req, res) {
		console.log("try to logout...");
		if (req.session) {
			console.log("logout user: " + req.currentUser.email);
			var currUser =  req.currentUser.email;
			LoginToken.remove({ email: currUser }, function() {});
			res.clearCookie('logintoken');
			req.session.destroy(function() {});
			res.send({msg: 'Logout OK', currentUser: currUser});
		} else {
			res.send({status: 'ERR', msg: 'Logout is failed'});
		}
		
	});
	
	app.get('/search', function(req, res) {
		res.render('search', {title: 'Search', currentUser:req.session.user_name, categories: Categories.all});
	});
	
	function authenticateFromLoginToken(req, res, next) {
		var cookie = JSON.parse(req.cookies.logintoken);

		LoginToken.findOne({email: cookie.email, series: cookie.series, token: cookie.token}, (function(err, token) {
			if (!token) {
				res.redirect('/');
				return;
			}

			Users.findOne({ email: token.email }, function(err, user) {
				if (user) {
					req.session.user_id = user.id;
					req.currentUser = user;

					token.token = token.randomToken();
					token.save(function() {
						res.cookie('logintoken', token.cookieValue, { expires: new Date(Date.now() + 2 * 604800000), path: '/' });
						next();
					});
				} else {
					res.redirect('/');
				}
			});
		}));
	}
	
	function loadUser(req, res, next) {
		if (req.session.user_id) {
			console.log('loadUser user_id:'+req.session.user_id);
			Users.findById(req.session.user_id, function(err, user) {
				if (user) {
					req.currentUser = user;
					next();
				} else {
					res.redirect('/');
				}
			});
		} else if (req.cookies.logintoken) {
			console.log('loadUser logintoken:'+req.cookies.logintoken + '; => authenticateFromLoginToken');
			authenticateFromLoginToken(req, res, next);
		} else {
			console.log('loadUser redirect to /login:');
			res.redirect('/');
		}
	}
	
	// USERS
	
	// page of adding new user (temporary)
	app.get('/users/new', loadUser, function(req, res) {
		res.render('dev/new_user.jade',{});
	});

	// post user`s data(add new user)
	app.post('/users', loadUser, function(req, res) {
		Users.add(req.body.user, function(err,user) {
			// !!! add sending only public fields !!!
			user ? res.send(user.toObject()) : res.send({ status: 'ERR', msg: err.message });
		});
	});
	
	//get page of user(in read only mode) or json
	app.get('/users/:id.:format?', function(req, res) {
		Users.findById(req.params.id, function(err, user) {
			if (user) {
				req.params.format == 'json' ? res.send(user.toObject()) : res.render('dev/user.jade', {currentUser: user, user: user} );
			} else {
				res.send( {status: 'ERR', msg: err.message} );
			}
		});
	});
		
	// get page of user(edit mode or other)
	app.get('/users/:id/:operation', loadUser, function(req, res) {
		Users.findById(req.params.id, function(err, user) {
			if (user) {
				req.params.operation == 'edit' ? res.render( 'dev/edit_user.jade', {currentUser: user, user: user} ) 
											   : res.render( 'dev/user.jade', {currentUser: user, user: user} );
			} else {
				res.send({ status: 'ERR', msg: err.message });
			}
		});
	});
	
	// put user`s data(update user)
	app.put('/users/:id?', loadUser, function(req, res) {
		Users.updateById(req.params.id, req.body.user, function(err, user) {
			user ? res.send(user.toObject()) : res.send( { status: 'ERR', msg: err.message } );
		});
	});
	
	// delete user by id
	app.del('/users/:id.:format?', loadUser, function(req, res) {
		Users.removeById(req.params.id, function(err, user) {
			user ? res.send(user.toObject()) : res.send( {status: 'ERR', msg: err.message} );
		});
	});
	
	//get users in json or html
	app.get('/users.:format?', loadUser, function(req, res) {
		Users.find({}, function(err, users) {
			if (users) {
				req.params.format == 'json' ? res.send(users) : res.render( 'dev/users.jade', {users: users} );
			} else {
				res.send( {status: 'ERR', msg: err.message} );
			}
		});
	});
	
	//Items
	//list
	app.get('/items?', function(req, res) {
		console.log(req.query);
		Items.find(req.query,function(err, items) {
			items ? res.send(items) : res.send( {status: 'ERR', msg: err.message} );
		});
	});
	//page of creating item
	app.get('/items/new', loadUser, function(req, res) {
		res.render('items/new.jade', {currentUser: req.currentUser});
	});
	//create item
	app.post('/items', loadUser, function(req, res) {
		var data = req.body.item;
		data.user_id = req.currentUser.id;
		Items.add(data, function(err,item){
			item ? res.send(item.toObject()) : res.send({status: 'ERR', msg: err.message});
		});
	});
	//read item or page of item (dev)
	app.get('/items/:id.:format?', function(req, res, next) {
		Items.findOne({_id: req.params.id}, function(err, item) {
				if (!item) {
					return next(new NotFound('Item is not found'));
				}	
				req.params.format == 'json' ? res.send(item.toObject()) 
											: res.render('dev/item.jade', {currentUser:req.session.user_name/*Fix me*/, item: item, categories: []});
			});
	});
	//page of Edit
	app.get('/items/:id/:operation?', loadUser, function(req, res, next) {
		Items.findById(req.params.id, function(err, item) {
			if (!item) {
				return next(new NotFound('Item is not found'));
			}	
			switch (req.params.operation) {
				case 'edit':
					res.render('/dev/edit_item.jade', {currentUser:req.session.user_name, item: item, categories: []});
					break;
				
				default:
					res.render('/dev/item.jade', {currentUser:req.session.user_name, item: item, categories: []});
			}
		});
	});
	//update item
	app.put('/items/:id', loadUser, function(req, res,next) {
		Items.updateById(req.params.id, req.body, function(err, item) {
			item ? res.send(item.toObject()) : res.send({status: 'ERR', msg: err.message});
		});
	});
	
	//delete item
	app.del('/items/:id', loadUser, function(req, res,next) {
		Items.removeById(req.params.id, function(err, item) {
			item ? res.send(item.toObject()) : res.send({status: 'ERR', msg: err.message});
		});
	});
	
	//Offers
	//add offer
	app.post('/offers', loadUser, function(req, res) {
		var data = req.body.offer;
		//data.user_id = req.currentUser.id;
		//data.item_id = req.currentUser.id;
		Offers.add(data, function(err,item){
			item ? res.send(item.toObject()) : res.send({status: 'ERR', msg: err.message});
		});
	});
	//update offer
	app.put('/items/:id.:format?', function(req, res,next) {
		Offers.updateById(req.params.id, req.body, function(err, item) {
			item ? res.send(item.toObject()) : res.send({status: 'ERR', msg: err.message});
		});
	});
	//delete
	app.del('/offers/:id', loadUser, function(req, res) {
		Offers.removeById(req.params.id, function(err, offer) {
			offer ? res.send(offer.toObject()) : res.send({status: 'ERR', msg: err.message});
		});
	});
	
	//Categories
	//list json
	app.get('/categories.:format?', function(req, res) {
		switch (req.params.format) {
					case 'json':
						console.log(req.query);
						if (req.query) {
							Categories.find(req.query, function(err,cats){res.send(cats? cats: {});});
						} else {
							res.send(Categories.all);
						}
					break;

					default:
						console.log('Format not available,400');
						res.send('Format not available', 400);
		}
	});
	
	//for admin => add authenticate admin...loadAdmin instead od loadUser ????
	//page of creating category
	app.get('/categories/new', loadUser, function(req, res) {
		res.render('categories/new.jade', {currentUser: req.currentUser});
	});
	//create
	app.post('/categories.:format?', loadUser, function(req, res) {
		Categories.add(req.body.category, function(err,c){
			if (err) {
				console.log('error: SAVE category is failed:' + err);
				return res.render('categories/new.jade', {currentUser: req.currentUser, category: c});
			}
			
			switch (req.params.format) {
				case 'json':
					res.send(c.toObject());
					break;
				default:
					res.redirect('/');//??? show this category
			}
		});
	});
	
	app.get('/categories/:id?', function(req, res, next) {
		Categories.findById(req.params.id, function(err, category) {
			if (!category) return next(new NotFound('Category has not been found'));
			Categories.find({ parent_id:req.params.id}, function (err, subcat) {
				var subcat_ids = subcat.map(function (el) { return el._id });
				var search_arr = subcat_ids.concat(category._id);
				Items.find({category_id:{$in:search_arr}}, function (err, items) {
					if (err) return next(new NotFound('Items not found'));
					res.render('category', { currentUser:req.session.user_name, categories:[], subcat:subcat, curcat:category, items:items });
				});
			});
			//res.send(category.toObject());
		});
	});
	
	app.put('/categories/:id.:format?', function(req, res) {
		Categories.updateById(req.params.id, req.body, function(err, category) {
			if (!category) {
				return next(new NotFound('category is not updated'));
			}	
			switch (req.params.format) {
				case 'json':
					res.send(category.toObject());
					break;
				//case 'html':
					//break;
				default:
					res.redirect('/');//???
			}
		});
	});
	
	app.del('/categories/:id.:format?', function(req, res) {
		Categories.removeById(req.params.id, function(err, category) {
			if (!category) {
				return next(new NotFound('category is not removed'));
			}	
			switch (req.params.format) {
				case 'json':
					res.send(category.toObject());
					break;
				//case 'html':
					//break;
				default:
					res.redirect('/');//???
			}
		});
	});
	
	//Offers
	
	
	// Error handling
	function NotFound(msg) {
		this.name = 'NotFound';
		Error.call(this, msg);
		Error.captureStackTrace(this, arguments.callee);
	}

	(NotFound, Error);

	app.get('/404', function(req, res) {
		throw new NotFound;
	});

	app.get('/500', function(req, res) {
		throw new Error('An expected error');
	});
}



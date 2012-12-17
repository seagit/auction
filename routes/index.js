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
	app.get('/dev', function(req, res) {
		res.render('dev', {title: 'Development`s tools'});
	});
	
	// Sessions
        /*app.get('/login', function(req, res) {
	  res.render( 'login.jade', {currentUser: req.currentUser, user: new User()});
	});*/

	app.post('/login', function(req, res) {
		console.log("post /login; email:"+req.body.email);
		
		Users.findOne({ email: req.body.email }, function(err, user) {
			if ( user && user.authenticate(req.body.password) ) {
				req.session.user_id = user.id;
	            req.session.user_name = user.name;
				req.currentUser = user;
				res.redirect('/'); //TODO : stay on the current page !!!
				//res.render('users/user.jade', {currentUser: user, user: user});
			} else {
				console.log("Invalid user. Incorrect credentials");
				//TODO : open login modal form
				//res.redirect('/login');
			}
	  }); 
	});

	/*app.del('/login', loadUser, function(req, res) {
	
		console.log("try to logout...");
	  
		if (req.session) {
		
			console.log("logout user: " + req.currentUser.email);

			LoginToken.remove({ email: req.currentUser.email }, function() {});
			res.clearCookie('logintoken');
			req.session.destroy(function() {});
		}
		res.redirect('/login');
	}); */

	app.get('/logout', loadUser, function(req, res) {
		console.log("try to logout...");
		if (req.session) {
			console.log("logout user: " + req.currentUser.email);
			var currUser =  req.currentUser.email;
			LoginToken.remove({ email: currUser }, function() {});
			res.clearCookie('logintoken');
			req.session.destroy(function() {});
			res.send({msg: 'Logout OK', currentUser: currUser});
		}
	});

	app.get('/search', function(req, res) {
		res.render('search', {title: 'Search', currentUser:req.session.user_name, categories: Categories.all});
	});
	
	function authenticateFromLoginToken(req, res, next) {
		var cookie = JSON.parse(req.cookies.logintoken);

		LoginToken.findOne({email: cookie.email, series: cookie.series, token: cookie.token}, (function(err, token) {
			if (!token) {
				res.redirect('/login');
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
					res.redirect('/login');
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
					res.redirect('/login');
				}
			});
		} else if (req.cookies.logintoken) {
			console.log('loadUser logintoken:'+req.cookies.logintoken + '; => authenticateFromLoginToken');
			authenticateFromLoginToken(req, res, next);
		} else {
			console.log('loadUser redirect to /login:');
			res.redirect('/login');
		}
	}
	//users
	app.get('/users/new', function(req, res) {
		res.render('users/new.jade');
	});
	
	app.post('/users.:format?', function(req, res) {
		console.log("post /users.:format?; user.email:"+req.body.user.email);
		Users.add(req.body.user, function(err,user){
			if (err) {
				console.log('error: SAVE user is failed:'+err);
				res.render('users/new.jade', {user: user});
			}
		
			console.log('Your account has been created');
			//send email and ...
			
			switch (req.params.format) {
				case 'json':
					res.send(user.toObject());
					break;

				default:
					res.redirect('/');
			}
		});
	});
	
	app.get('/users/:id.:format?', function(req, res) {
		Users.findById(req.params.id, function(err, user) {
			if (user) {
				console.log('User has been found by id');
				switch (req.params.format) {
					case 'json':
						res.send(user.toObject());//send data without security data ???
					break;

					default:
						res.render('users/user.jade', {currentUser: user, user: user});
				}	
			} else {
				//????
				console.log('user '+req.params.id + ' has not been found');
				res.redirect('/');
			}
		});
	});
	app.put('/users/:id.:format?', loadUser, function(req, res) {
		Users.updateById(req.params.id, req.body, function(err, user) {
			if (user) {
				console.log('User '+req.params.id+' has been updated');
				switch (req.params.format) {
					case 'json':
						res.send(user.toObject());
						break;

					default:
						res.render('users/user.jade', {currentUser: user, user: user});
				}	
			} else {
				//????
				console.log('user '+req.params.id + ' has not been updated');
				res.redirect('/');
			}
		});
	});
	
	app.del('/users/:id.:format?', loadUser, function(req, res) {
		Users.removeById(req.params.id, function(err, user) {
			if (user) {
				console.log('User '+req.params.id+' has been removed');
				switch (req.params.format) {
					case 'json':
						res.send(user.toObject());
						break;

					default:
						res.render('/', {currentUser: user, user: user});
				}	
			} else {
				//????
				console.log('user '+req.params.id + ' has not been removed');
				res.redirect('/');
			}
		});
	});
	
	app.get('/users.:format?', loadUser, function(req, res) {
		Users.find({}, function(err, users) {
			if (users) {
				switch (req.params.format) {
					case 'json':
						res.send(users);
						break;

					default:
						res.render( 'users/users.jade', {users: users});
				}
			} else {
				res.redirect('/');//???
			}
		});
	});
	
	//Items
	//list
	app.get('/items.:format?', function(req, res) {
		console.log(req.query);
		Items.find(req.query,function(err, items) {
			if (items) {
				switch (req.params.format) {
					case 'json':
						res.send(items);
						break;

					default:
						console.log('Format not available,400');
						res.send('Format not available', 400);
				}
			}
		});
	});
	//page of creating item
	app.get('/items/new', loadUser, function(req, res) {
		res.render('items/new.jade', {currentUser: req.currentUser});
	});
	//create
	app.post('/items.:format?', loadUser, function(req, res) {
		var data = req.body.item;
		data.user_id = req.currentUser.id;
		Items.add(data, function(err,item){
			if (err) {
				console.log('error: SAVE item is failed: '+err);
				res.render('items/new.jade', {currentUser: req.currentUser, item: item});
			}
		
			switch (req.params.format) {
				case 'json':
					res.send(item.toObject());
					break;
				default:
					res.redirect('/users/'+req.session.user_id);//???
			}
		});
	});
	//read
	app.get('/items/:id.:format?', function(req, res, next) {
		Items.findOne({_id: req.params.id}, function(err, item) {
			if (!item) {
				return next(new NotFound('Item is not found'));
			}	
			switch (req.params.format) {
				case 'json':
					res.send(item.toObject());
					break;
				default:
					res.render('showlot.jade', {currentUser:req.session.user_name/*Fix me*/, item: item, categories: []});
			}
		});
	});
	//edit page ???
	app.get('/items/:id/:operation?', loadUser, function(req, res, next) {
		Items.findById(req.params.id, function(err, item) {
			if (!item) {
				return next(new NotFound('Item is not found'));
			}	
			switch (req.params.operation) {
				case 'edit':
					res.render('showlot.jade', {currentUser:req.session.user_name, item: item, categories: []});
					break;
				
				default:
					res.render('showlot.jade', {currentUser:req.session.user_name, item: item, categories: []});
			}
		});
	});
	//edit
	/*
	app.put('/items/:id.:format?', loadUser, function(req, res,next) {
		Items.updateById(req.params.id, req.body, function(err, item) {
			if (!item) {
				return next(new NotFound('Item is not updated'));
			}	
			switch (req.params.format) {
				case 'json':
					res.send(item.toObject());
					break;
				//case 'html':
					//break;
				default:
					res.render('showlot.jade', {currentUser:req.session.user_name, item: item, categories: []});
			}
		});
	});
	*/
	//add offer
	app.put('/items/:id.:format?', function(req, res,next) {
		Items.findById(req.params.id, function(err, item) {
			if (!item) {
				return next(new NotFound('Item is not updated'));
			}
			
			var offer = new Offer(req.body);
			offer.item_id = req.params.id;
			offer.user_id = req.currentUser && req.currentUser.id;
			item.offers.push(offer);
			
			////
			function itemSaveFailed(err) {
				console.log('error: SAVE item is failed: '+err);
				res.render('items/new.jade', {currentUser: req.currentUser, item: item});
			}
			item.save(function(err) {
				if (err) {
					return itemSaveFailed(err);
				}
				
				console.log('The item with new offer has been saved');
				/*
				switch (req.params.format) {
					case 'json':
						res.send(item.toObject());
						break;
					default:
						res.render('showlot.jade', {currentUser:req.session.user_name, item: item, categories: []});
				}
				*/
				
				//res.redirect('/');
				next(new NotFound('Item is not updated'));
				
			});
			////
		});
	});
	//delete
	app.del('/items/:id.:format?', loadUser, function(req, res,next) {
		Items.removeById(req.params.id, function(err, item) {
			if (!item) {
				return next(new NotFound('Item is not removed'));
			}	
			switch (req.params.format) {
				case 'json':
					res.send(item.toObject());
					break;
				//case 'html':
					//break;
				default:
					res.redirect('/');//???
			}
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



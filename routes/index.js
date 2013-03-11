var util = require('util'),
	fs = require('fs'),
	path = require('path');

module.exports = function(app) 
{
	var Users = app.users,
		Items = app.items,
		Offers = app.offers,
		Categories = app.categories,
		LoginToken = app.LoginToken;
		passport = app.passport;
		
	//main page	
	app.get('/', function(req, res) {
		res.render('index', { title: 'Exchange auction',
							  categories: Categories.main,
							  currentUser: req.user,
							  uid: req.user && req.user.id
							});		
	});
	//development
	app.get('/dev', ensureAuthenticated, function(req, res) {
		res.render('dev', {title: 'Development`s tools', user: req.user});
	});
	
	app.get('/dev/upload', ensureAuthenticated, function(req, res) {
		res.render('dev/upload', {title: 'Upload images'});
	});
	
	// Sessions
	app.del('/login', ensureAuthenticated, function(req, res) {
		console.log("try to logout...");
		var user = req.user;
		req.logout();
		res.send({status: 'OK', msg: 'Logout OK', currentUser: user});
	});
	
	// Passport-Local login
	app.post('/login', passport.authenticate('local', { failureRedirect: '/', failureFlash: true }),
		function(req, res) {
			res.send({ status: 'OK', msg: 'login is successful', uid: req.user.id });
		}
	);
	
	// Passport-Facebook login
	app.get('/auth/facebook',
	  passport.authenticate('facebook'),
	  function(req, res){
		console.log("The request will be redirected to Facebook for authentication, so this function will not be called.");
	  });

	// Passport-Facebook callback
	app.get('/auth/facebook/callback', 
		passport.authenticate('facebook', { failureRedirect: '/auth/facebook' }),
		function(req, res) {
			//res.send({ status: 'OK', msg: 'login is successful', uid: req.user.id });
			res.redirect('/users/'+req.user.id);
		}
	);
	// Passport Logout
	app.get('/logout', function(req, res){
		req.logout();
		res.redirect('/');
	});
	
	// Passport-VKontakte login
	app.get('/auth/vkontakte',
		passport.authenticate('vkontakte', { scope: ['emails', 'friends'] } ),
		function(req, res){
			console.log("The request will be redirected to vk.com for authentication, so this function will not be called.");
		});
		
	// Passport-VKontakte callback
	app.get('/auth/vkontakte/callback', 
		passport.authenticate('vkontakte', { failureRedirect: '/auth/vkontakte' }),
		function(req, res) {
			//res.send({ status: 'OK', msg: 'login is successful', uid: req.user.id });
			res.redirect('/users/'+req.user.id);
		});
	
	
	function ensureAuthenticated(req, res, next) {
		console.log('ensureAuthenticated:'+req.isAuthenticated());
		
		if (req.isAuthenticated()) { 
			return next(); 
		}
		
		res.redirect('/');
	}
	
	// search
	app.get('/search', function(req, res) {
		res.render('search', {	title: 'Search',
								currentUser: req.user,
								categories: Categories.main });
	});
	
	// load picture 
	function copyFile(req, dir, next) {
		var tmp_path = req.files.picture.path,
			basename = path.basename(tmp_path),
			newName = path.resolve(dir, basename);
				
		// copy and delete the temporary file
		fs.rename(tmp_path, newName, function(err) {
			if (err) {
				return next && next(err);
			}
			
			fs.unlink(tmp_path, function() { 
				next && next(err, basename);
			});
		});
	}
	
	
	// USERS
	
	// page of adding new user (temporary)
	app.get('/users/new', function(req, res) {
		res.render('dev/new_user.jade',{});
	});
	
	// post user`s data(add new user)
	//app.post('/users', ensureAuthenticated, function(req, res) {
	app.post('/users', function(req, res) {
		Users.add(req.body.user, function(err,user) {
			// !!! add sending only public fields !!!
			user ? res.send(user.toObject()) : res.send({ status: 'ERR', msg: err.message });
		});
	});
	
	//get page of user(in read only mode) or json
	app.get('/users/:id.:format?', function(req, res) {
		Users.findById(req.params.id, function(err, user) {
			if (user) {
				var user_items;
				Items.find({user_id: user.id}, function(err, items) {
					if (items) {
						user_items = items;
					}	
					
					req.params.format == 'json' ? res.send(user.toObject()) : res.render('showuser.jade', {
						currentUser: req.user,
						user: user,
						uid: req.user && req.user.id,//user or currentUser
						lots: user_items,
						categories: Categories.main
					});
				});
			} else {
				res.send( {status: 'ERR', msg: (err && err.message) || 'user has not been found'} );
			}
		});
	});
		
	// get page of user(edit mode or other)
	app.get('/users/:id/:operation', ensureAuthenticated, function(req, res) {
		Users.findById(req.params.id, function(err, user) {
			if (user) {
				req.params.operation == 'edit' ? res.render( 'dev/edit_user.jade', {currentUser: req.user, user: user} ) 
											   : res.render( 'dev/user.jade', {currentUser: req.user, user: user} );
			} else {
				res.send({ status: 'ERR', msg: err.message });
			}
		});
	});
	
	// put user`s data(update user)
	app.put('/users/:id?', ensureAuthenticated, function(req, res) {
		Users.updateById(req.params.id, req.body.user, function(err, user) {
			user ? res.send(user.toObject()) : res.send( { status: 'ERR', msg: err.message } );
		});
	});
	
	// delete user by id
	app.del('/users/:id.:format?', ensureAuthenticated, function(req, res) {
		Users.removeById(req.params.id, function(err, user) {
			user ? res.send(user.toObject()) : res.send( {status: 'ERR', msg: err.message} );
		});
	});
	
	//get users in json or html
	app.get('/users.:format?', ensureAuthenticated, function(req, res) {
		Users.find({}, function(err, users) {
			if (users) {
				req.params.format == 'json' ? res.send(users) : res.render( 'dev/users.jade', {users: users} );
			} else {
				res.send( {status: 'ERR', msg: err.message} );
			}
		});
	});
	
	// Set avatar of user (!!! PUT or PATCH) 
	app.post('/users/:id/picture', ensureAuthenticated, function(req, res) {
		copyFile(req, './public/i/users/', function(err, fileName) {
			Users.updateById(req.params.id, { $set: { picture: fileName }}, function(err, user) {
				res.send( err ? { status: 'ERR', msg: err.message } : user.toObject() );
			});
		});
	});
	
	//Items
	//list
	app.get('/items?', function(req, res) {
		var filter = {};
		
		//name or description
		if (req.query.text) {
			var regexpText = new RegExp(req.query.text,'i');
			filter['$or'] = [ {'name': regexpText}, { 'description': regexpText} ];
		}
		//wish
		if (req.query.wish) {
			filter.wish = new RegExp(req.query.wish,'i');
		}
		//value
		if (req.query.valueGte || req.query.valueLte) {
			filter.value = {};
			req.query.valueGte && (filter.value['$gte'] = +req.query.valueGte);
			req.query.valueLte && (filter.value['$lte'] = +req.query.valueLte);
		}
				
		console.log(filter);
		Items.find(filter,function(err, items) {
			items ? res.send(items) : res.send( {status: 'ERR', msg: err.message} );
		});
	});
	//page of creating item
	app.get('/items/new', ensureAuthenticated, function(req, res) {
		res.render('dev/new_item.jade', {currentUser: req.user});
		//res.render('items/new.jade', {currentUser: req.currentUser});
	});
	//create item
	app.post('/items', ensureAuthenticated, function(req, res) {
		
		console.log(req.user);
		
		var data = req.body;
		console.log(req.body);
		data.user_id = req.user && req.user._id;
		data.picture = 'default.jpg';// it needs to discuss !!!
		Items.add(data, function(err,item){
			item ? res.send(item.toObject()) : res.send({status: 'ERR', msg: (err && err.message) || 'Unknown error, the item has not been found'});
		});
	});
	//read item or page of item (dev)
	app.get('/items/:id.:format?', function(req, res, next) {
		Items.findById(req.params.id, function(err, item) {
				if (!item) {
					return next(new NotFound('Item is not found'));
				}	
				
				req.params.format == 'json' ? res.send(item.toObject()) 
											: res.render('showlot.jade', {
																			currentUser:req.user,
																			item: item,
																			categories: Categories.main,
																			uid: req.user && req.user.id
																		});
			});
	});
	//page of Edit
	app.get('/items/:id/:operation?', ensureAuthenticated, function(req, res, next) {
		Items.findById(req.params.id, function(err, item) {
			if (!item) {
				return next(new NotFound('Item is not found'));
			}
			var viewData = {
							currentUser: req.user, // req.user.name
							item: item,
							categories: Categories.main	};
							
			switch (req.params.operation) {
				case 'edit':
					res.render('dev/edit_item.jade', viewData);
					break;
				
				default:
					res.render('dev/item.jade', viewData);
			}
		});
	});
	//update item
	app.put('/items/:id', ensureAuthenticated, function(req, res,next) {
		Items.updateById(req.params.id, req.body, function(err, item) {
			item ? res.send(item.toObject()) : res.send({status: 'ERR', msg: err.message});
		});
	});
	
	// Set item`s image (!!! PUT or PATCH)
	app.post('/items/:id/picture', ensureAuthenticated, function(req, res) {
		copyFile(req, './public/i/lots/', function(err, fileName){
			Items.updateById(req.params.id, { $set: { picture: fileName }, $push: { pictures: fileName }}, function(err, item) {
				res.send( err ? { status: 'ERR', msg: err.message } : item.toObject() );
			});
		});
	});
	
	// Change item`s image (!!! PUT or PATCH) - "update item" is more general but it needs to discuss
	app.put('/items/:id/change_picture', ensureAuthenticated, function(req, res) {
		Items.updateById(req.params.id, { $set: { picture: req.params.picture }}, function(err, item) {
			res.send( err ? { status: 'ERR', msg: err.message } : item.toObject() );
		});
	});
	
	//delete item
	app.del('/items/:id.:format?', ensureAuthenticated, function(req, res,next) {
		Items.removeById(req.params.id, function(err, item) {
			item ? res.send(item.toObject()) : res.send({status: 'ERR', msg: err.message});
		});
	});
	
	//Offers
	//add offer
	app.post('/offers', ensureAuthenticated, function(req, res) {
		var data = req.body.offer;
		//data.user_id = req.user.id;
		//data.item_id = req.user.id;
		Offers.add(data, function(err,item){
			item ? res.send(item.toObject()) : res.send({status: 'ERR', msg: err.message});
		});
	});
	//update offer
	/*
	app.put('/offers/:id.:format?', function(req, res,next) {
		Offers.updateById(req.params.id, req.body, function(err, item) {
			item ? res.send(item.toObject()) : res.send({status: 'ERR', msg: err.message});
		});
	});
	*/
	
	//delete
	app.del('/offers/:id', ensureAuthenticated, function(req, res) {
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
	
	//for admin => add authenticate admin...loadAdmin instead od ensureAuthenticated ????
	//page of creating category
	app.get('/categories/new', ensureAuthenticated, function(req, res) {
		res.render('categories/new.jade', {currentUser: req.user});
	});
	//create
	app.post('/categories.:format?', ensureAuthenticated, function(req, res) {
		Categories.add(req.body.category, function(err,c){
			if (err) {
				console.log('error: SAVE category is failed:' + err);
				return res.render('categories/new.jade', {currentUser: req.user, category: c});
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
					res.render('category', { 
											currentUser: req.user, //or req.user.name ???
											categories: Categories.main,
											subcat:subcat,
											curcat: category,
											items: items,
											uid: req.user && req.user.id
											});
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



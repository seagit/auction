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
		
	//main page	
	app.get('/', function(req, res) {
		res.render('index', { title: 'Exchange auction',
							  categories: Categories.main,
							  currentUser: req.session.user_name,
							  uid: req.session.user_id
							});		
	});
	//development
	app.get('/dev', loadUser, function(req, res) {
		res.render('dev', {title: 'Development`s tools'});
	});
	
	app.get('/dev/upload', loadUser, function(req, res) {
		res.render('dev/upload', {title: 'Upload images'});
	});
	
	// Sessions
	app.post('/login', function(req, res) {
		console.log("post /login; email:"+req.body.email);
		
		Users.findOne({ email: req.body.email }, function(err, user) {
			if ( user && user.authenticate(req.body.password) ) {
				req.session.user_id = user.id;
	            req.session.user_name = user.name;
				req.currentUser = user;
				res.send({ status: 'OK', msg: 'login is successful', uid: user.id });
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
			res.send({status: 'OK', msg: 'Logout OK', currentUser: currUser});
		} else {
			res.send({status: 'ERR', msg: 'Logout is failed'});
		}
		
	});
	
	app.get('/search', function(req, res) {
		res.render('search', {	title: 'Search',
								currentUser: req.session.user_name,
								categories: Categories.main });
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
				var user_items;
				Items.find({user_id: user.id}, function(err, items) {
					if (items) {
						user_items = items;
					}	
					
					req.params.format == 'json' ? res.send(user.toObject()) : res.render('showuser.jade', {
						currentUser: user,
						user: user,
						uid: req.session.user_id,
						lots: user_items,
						categories: Categories.main
					});
				});
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
	
	// Set avatar of user (!!! PUT or PATCH) 
	app.post('/users/:id/picture', loadUser, function(req, res) {
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
	app.get('/items/new', loadUser, function(req, res) {
		res.render('dev/new_item.jade', {currentUser: req.currentUser});
		//res.render('items/new.jade', {currentUser: req.currentUser});
	});
	//create item
	app.post('/items', loadUser, function(req, res) {
		
		console.log(req.currentUser);
		var data = req.body;
		console.log(req.body);
		data.user_id = req.currentUser._id;
		data.picture = 'default.jpg';// it needs to discuss !!!
		Items.add(data, function(err,item){
			item ? res.send(item.toObject()) : res.send({status: 'ERR', msg: err.message});
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
																			currentUser:req.session.user_name/*Fix me*/,
																			item: item,
																			categories: Categories.main,
																			uid: req.session.user_id
																		});
			});
	});
	//page of Edit
	app.get('/items/:id/:operation?', loadUser, function(req, res, next) {
		Items.findById(req.params.id, function(err, item) {
			if (!item) {
				return next(new NotFound('Item is not found'));
			}
			var viewData = {
							currentUser: req.session.user_name, 
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
	app.put('/items/:id', loadUser, function(req, res,next) {
		Items.updateById(req.params.id, req.body, function(err, item) {
			item ? res.send(item.toObject()) : res.send({status: 'ERR', msg: err.message});
		});
	});
	
	// Set item`s image (!!! PUT or PATCH)
	app.post('/items/:id/picture', loadUser, function(req, res) {
		copyFile(req, './public/i/lots/', function(err, fileName){
			Items.updateById(req.params.id, { $set: { picture: fileName }, $push: { pictures: fileName }}, function(err, item) {
				res.send( err ? { status: 'ERR', msg: err.message } : item.toObject() );
			});
		});
	});
	
	// Change item`s image (!!! PUT or PATCH) - "update item" is more general but it needs to discuss
	app.put('/items/:id/change_picture', loadUser, function(req, res) {
		Items.updateById(req.params.id, { $set: { picture: req.params.picture }}, function(err, item) {
			res.send( err ? { status: 'ERR', msg: err.message } : item.toObject() );
		});
	});
	
	//delete item
	app.del('/items/:id.:format?', loadUser, function(req, res,next) {
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
	/*
	app.put('/offers/:id.:format?', function(req, res,next) {
		Offers.updateById(req.params.id, req.body, function(err, item) {
			item ? res.send(item.toObject()) : res.send({status: 'ERR', msg: err.message});
		});
	});
	*/
	
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
					res.render('category', { 
											currentUser: req.session.user_name,
											categories: Categories.main,
											subcat:subcat,
											curcat: category,
											items: items,
											uid: req.session.user_id
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



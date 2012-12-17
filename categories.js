module.exports = function(categoryModel) {
	var Category = categoryModel;
	return {
		all:undefined,
		main: undefined,
		refresh: function(callback) {
			var self = this;
			function storeTo(property, err, categories,next) {
				if (err) {
					callback(err);
				} else if (categories){
					self[property] = categories;
					if (next) {
						next();
					} else {
						callback(undefined,self);
					}
				}
			};
			
			function mainCategories() {
				self.find({ parent_id : undefined }, function(err,categories){
					storeTo('main',err,categories);
					
				});
			};
			
			function allCategories() {
				self.find({}, function(err,categories){
					storeTo('all',err,categories,mainCategories);
				});
			};
			
			allCategories();
			
		},
		add: function(data,callback) {
			Category.create(data, function(err,c) {
				if (err) {
					callback(err);
					return;
				}
				
				//update parent.children
				if (c.parent_id) {
					Category.findOne({ _id: c.parent_id}, function(err, parentCategory) {
						if (parentCategory) {
							parentCategory.children.push(c._id);
							parentCategory.save();
						}
					});
				}
				
				callback(undefined,c);
			});
		},
		remove: function(filter,callback) {
			Category.remove(filter,callback);
		},
		removeById: function(id,callback) {
			Category.findByIdAndRemove(id,callback);
		},
		find: function(filter,callback) {
			Category.find(filter,callback);
		},
		findById: function(id,callback) {
			Category.findById(id, callback);
		},
		updateById: function(id,update,callback) {
			Category.findByIdAndUpdate(id,update,callback);
		}
	}
}
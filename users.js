module.exports = function(userModel) {
	var User = userModel;
	return {
		add: function(data,callback) {
			User.create(data, callback);
		},
		remove: function(filter,callback) {
			User.remove(filter,callback);
		},
		removeById: function(id,callback) {
			User.findByIdAndRemove(id,callback);
		},
		find: function(filter,callback) {
			User.find(filter,callback);
		},
		findOne:function(filter,callback) {
			User.findOne(filter,callback);
		},
		findById: function(id,callback) {
			User.findById(id, callback);
		},
		updateById: function(id,update,callback) {
			User.findByIdAndUpdate(id,update,callback);
		}
	}
}
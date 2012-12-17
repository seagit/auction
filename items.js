module.exports = function(itemModel) {
	var Item = itemModel;
	return {
		add: function(data,callback) {
			Item.create(data, callback);
		},
		remove: function(filter,callback) {
			Item.remove(filter,callback);
		},
		removeById: function(id,callback) {
			Item.findByIdAndRemove(id,callback);
		},
		find: function(filter,callback) {
			Item.find(filter,callback);
		},
		findOne: function(filter,callback) {
			Item.find(filter,callback);
		},
		findById: function(id,callback) {
			Item.findById(id, callback);
		},
		updateById: function(id,update,callback) {
			Item.findByIdAndUpdate(id,update,callback);
		}
	}
}
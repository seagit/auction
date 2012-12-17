module.exports = function(offerModel) {
	var Offer = offerModel;
	return {
		add: function(data,callback) {
			Offer.create(data, callback);
		},
		remove: function(filter,callback) {
			Offer.remove(filter,callback);
		},
		removeById: function(id,callback) {
			Offer.findByIdAndRemove(id,callback);
		},
		find: function(filter,callback) {
			Offer.find(filter,callback);
		},
		findById: function(id,callback) {
			Offer.findById(id, callback);
		},
		updateById: function(id,update,callback) {
			Offer.findByIdAndUpdate(id,update,callback);
		}
	}
}
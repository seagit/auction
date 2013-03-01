var Category,
    Item,
    User,
	Offer,
    LoginToken;

function defineModels(mongoose, crypto, fn) {
	var Schema = mongoose.Schema,
		ObjectId = Schema.ObjectId;	

	function validatePresenceOf(value) {
		return value && value.length;
	}
	
	//Category
	Category = new Schema({
		name: { type: String, validate: [validatePresenceOf, 'a name is required'], index: { unique: true } },
		picture: String,
		parent_id: ObjectId,
		children:[ObjectId]
	})
	Category.virtual('id').get(function() {
		return this._id.toHexString();
	});
	
	//Offer
	Offer = new Schema({
		text: { type: String, validate: [validatePresenceOf, 'a name is required']},
		item_id: ObjectId,
		user_id: ObjectId,
		createDate: { type: Date, default: Date.now }
	})
	Category.virtual('id').get(function() {
		return this._id.toHexString();
	});
	
	//Item
	Item = new Schema({
		name: { type: String, validate: [validatePresenceOf, 'a name is required'], index: { unique: true } },
		description: String,
		picture: String,
		pictures: [String],
		wish: String,
		value: { type: Number, default: 0 },
		createdDate: { type: Date, default: Date.now },
		updatedDate: { type: Date, default: Date.now },
		startDate: { type: Date, default: Date.now },
		endDate: Date,
		category_id: ObjectId,
		isActive: {type : Boolean, default: true},
		offers:[Offer],
		user_id: ObjectId
	})
	Item.virtual('id').get(function() {
		return this._id.toHexString();
	});

	//FbData
	FbData = new Schema({
		email: { type: String, index: { unique: true } },
		name:  { type: String, index: { unique: true } },
		accessToken: String,
		picture: String
	});
	
	//vkData
	VkData = new Schema({
		email: { type: String, validate: [validatePresenceOf, 'an email is required'], index: { unique: true } },
		name:  { type: String, validate: [validatePresenceOf, 'a name is required'], index: { unique: true } },
		accessToken: String,
		picture: String
	});

	//User
	User = new Schema({
		email: { type: String, validate: [validatePresenceOf, 'an email is required'], index: { unique: true } },
		hashed_password: String,
		salt: String,
		name:  { type: String, validate: [validatePresenceOf, 'a name is required'], index: { unique: true } },
		location: String,
		picture: String,
		lastDateLogin: {type: Date},
		isAdmin: {type : Boolean, default: false},
		//fbData: FbData,
		//vkData: VkData
	});

	User.virtual('id').get(function() {
		return this._id.toHexString();
	});

	User.virtual('password').set(function(password) {
		this._password = password;
		this.salt = this.makeSalt();
		this.hashed_password = this.encryptPassword(password);
	})
	.get(function() { return this._password; });

	User.method('authenticate', function(plainText) {
		return this.encryptPassword(plainText) === this.hashed_password;
	});

	User.method('makeSalt', function() {
		return Math.round((new Date().valueOf() * Math.random())) + '1';
	});

	User.method('encryptPassword', function(password) {
		return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
	});

	User.pre('save', function(next) {
		if (!validatePresenceOf(this.password)) {
			next(new Error('Invalid password'));
		} else {
			next();
		}
	});
	
	User.on('error', function(e){
		console.log(e);
	});

	//LoginToken
	LoginToken = new Schema({
		email: { type: String, index: true },
		series: { type: String, index: true },
		token: { type: String, index: true }
	});

	LoginToken.method('randomToken', function() {
		return Math.round((new Date().valueOf() * Math.random())) + '2';
	});

	LoginToken.pre('save', function(next) {
		// Automatically create the tokens
		this.token = this.randomToken();

		if (this.isNew)
			this.series = this.randomToken();

		next();
	});

	LoginToken.virtual('id').get(function() {
		return this._id.toHexString();
	});

	LoginToken.virtual('cookieValue').get(function() {
		return JSON.Stringify({ email: this.email, token: this.token, series: this.series });
	});
    
	mongoose.model('Category', Category);
	mongoose.model('Offer', Offer);
	mongoose.model('Item', Item);
	mongoose.model('User', User);
	mongoose.model('LoginToken', LoginToken);

	fn();
}

exports.defineModels = defineModels; 
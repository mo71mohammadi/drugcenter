const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const priceSchema = new mongoose.Schema({
	product: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "product"
	},

	site: {type: String},
	irc: {type: String},
	gtn: {type: String},
	brandOwner: {type: String},
	enBrandName: {type: String},
	faBrandName: {type: String},
	packageCount: {type: String},
	enLicenceOwner: {type: String},
	faLicenceOwner: {type: String},
	faProducer: {type: String},
	enProducer: {type: String},
	isBulk: {type: String},
	genericName: {type: String},
	genericCode: {type: String},
	atc: {type: String},
	enName: {type: String},
	officialCode: {type: String},
	statusType: {type: String},
	category: {type: String},
	price: [{
		sPrice: {type: Number, require: true},
		dPrice: {type: Number, require: true},
		cPrice: {type: Number, require: true},
		_id: false
	}],
	date: [{type: Date}],

	// sPrice: {type: Number},
	// dPrice: {type: Number},
	// cPrice: {type: Number},
	// 0: تعیین وضعیت نشد. 1: محصول متناظر آپدیت شده. 2: محصول متناظر یافت نشد
	type: {type: Number}
})

priceSchema.index({
	site: 1,
	irc: 1
}, {unique: true});
priceSchema.plugin(uniqueValidator);


module.exports = mongoose.model('price', priceSchema);
const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const productSchema = new mongoose.Schema({
	eRx: {type: String, required: true},
	packageCode: {type: String, required: true},
	eRxGeneric: {type: String},
	sepasCode: {type: String},
	genericCode: {type: Number},
	packageCount: {type: Number},
	packageForm: {type: String},
	enGenericName: {type: String},
	faGenericName: {type: String},
	enBrandName: {type: String},
	faBrandName: {type: String},
	category: [{type: String}],
	// category : [B03A02, B04B01, A]
	gtn: [{type: String}],
	updateCode: String,
	irc: [{type: String}],
	nativeIrc: {type: String},
	price: [{
		sPrice: {type: Number, require: true},
		dPrice: {type: Number, require: true},
		cPrice: {type: Number, require: true},
	}],
	licenceOwner: {type: String},
	brandOwner: {type: String},
	producer: {type: String},
	countryBrandOwner: {type: String},
	countryProducer: {type: String},
	cName: [{type: String}],
	image: [{type: String}]
})

productSchema.index({
	eRx: 1,
	packageCode: 1
}, {unique: true});
productSchema.plugin(uniqueValidator);

module.exports = mongoose.model('product', productSchema);
const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const productSchema = new mongoose.Schema({
	eRx: {type: String, required: true},
	drugInfo: {type: mongoose.Schema.Types.ObjectId, ref: 'Drug'},
	// تغییر به کد eRx_Brand
	// packageCode: {type: String, required: true},
	eRxBrand: {type: String},
	//
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
	atcCode: [{type: String}],
	// atc: [{
	// 	code: {type: String},
	// 	ddd: {type: String}
	// }],
	// category : [B03A02, B04B01, A]
	gtn: [{type: String}],
	update: {
		from: String,
		code: String
	},
	irc: [{type: String}],
	nativeIrc: {type: String},
	price: [{
		sPrice: {type: Number, require: true},
		dPrice: {type: Number, require: true},
		cPrice: {type: Number, require: true},
		// _id: false
	}],
	// dates: [{type: Date}],
	licenceOwner: {type: String},
	licenceOwnerId: {type: Number},
	brandOwner: {type: String},
	producer: {type: String},
	countryBrandOwner: {type: String},
	countryProducer: {type: String},
	cName: [{type: String}],
	videos: [{type: String}],
	image: [{type: String}],
	medScapeId: {type: String},
	upToDateId: {type: String},
	// موقتا اضافه شده
	enName: {type: String},
	faName: {type: String},
	strength: {type: String},
	volume: {type: String},
	enForm: {type: String},
	faForm: {type: String},
	enRoute: {type: String},
	faRoute: {type: String},
	// .........
	properties: [{
		key: String,
		value: String
	}]
})

productSchema.index({
	eRx: 1,
	packageCode: 1
}, {unique: true});
productSchema.plugin(uniqueValidator);

module.exports = mongoose.model('product', productSchema);
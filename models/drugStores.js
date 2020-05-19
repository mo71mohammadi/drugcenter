const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const drugStoreSchema = new mongoose.Schema({
	id: {type: String, required: true},
	nationalCode: {type: String},
	hix: {type: String},
	gln: {type: String},
	contact: {
		work: {type: String},
		phone: {type: String}
	},
	licenseNumber: {type: String},
	postalCode: {type: Number},
	founder: {type: String},
	name: {type: String},
	organization: {type: String},
	category: {type: String},
	type: {type: String},
	serviceType: {type: String},
	selected: {type: Boolean},
	province: {type: String},
	city: {type: String},
	town: {type: String},
	address: {type: String},
	latitude: {type: String},
	longitude: {type: String},
	// distributor: [{
	// 	name: {type: String},
	// 	code: {type: Number},
	// 	branch: {type: String},
	// 	line: {type: Number}
	// }]
});

drugStoreSchema.index({
	id: 1
}, {unique: true});

drugStoreSchema.plugin(uniqueValidator);
module.exports = mongoose.model('drugStore', drugStoreSchema);
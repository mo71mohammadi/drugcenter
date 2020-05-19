const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const distributorSchema = new mongoose.Schema({
	name: {type: String},
	branch: {type: String},
	line: {type: Number},
	customers: [{
		drugStore: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "drugStore",
			required: true
		},
		code: {type: Number},
		active: {type: Boolean},

	}]
});

const Distributor = mongoose.model('Distributor', distributorSchema);
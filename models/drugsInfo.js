const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const drugSchema = new mongoose.Schema({
	atc: [{
		code: {type: String},
		ddd: {type: String}
	}],
	edl: {type: Boolean},
	enName: {type: String},
	faName: {type: String},
	strength: {type: String},
	volume: {type: String},
	enForm: {type: String},
	faForm: {type: String},
	enRoute: {type: String},
	faRoute: {type: String},
	medScape: {
		interaction: [{type: String}],
		info: [{type: String}]
	},
	upToDate: {
		interaction: [{type: String}],
		info: [{type: String}]
	},
	genericNames: [{
		enName: String,
		faName: String
	}]
});

// drugSchema.index({
// 	enName: 1,
// 	enRoute: 1
// }, {unique: true});

drugSchema.plugin(uniqueValidator);
module.exports = mongoose.model('Drugs', drugSchema);
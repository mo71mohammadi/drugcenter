const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const distributorSchema = new mongoose.Schema({
	name: {type: String},
	branch: {type: String},
	// line: {type: Number},
	customers: [{
		drugStore: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "drugStore",
			// required: true
		},
		code: {type: Number},
		line: {type: Number},
		active: {type: Boolean},
	}],
	products: [{
		eRx: {type: String, required: true}, // دلیل عدم استفاده از reference: یکسان نبودن کالکشن محصولات
		code: {type: Number}, // کد محصول در پخش
		gift: {type: String}, // جایزه محصول
		respite: {type: Number}, // فرجه محصول در پخش
		expire: {type: Date} // انقضای محصول
	}]
});

// distributorSchema.index({
// 	id: 1
// }, {unique: true});
//
// distributorSchema.plugin(uniqueValidator);
module.exports = mongoose.model('Distributor', distributorSchema);
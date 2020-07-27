const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const categorySchema = new mongoose.Schema({
	// L1: {
	// 	name: {type: String},
	// 	shortName: {type: String},
	// },
	// L2: {
	// 	name: {type: String},
	// 	shortName: {type: String},
	// },
	// L3: {
	// 	name: {type: String},
	// 	shortName: {type: String},
	// },
	// L4: {
	// 	name: {type: String},
	// 	shortName: {type: String},
	// }
	level: {type: String},
	id: {type: String, unique: true},
	name: {type: String},
	fullName: {type: String},
})

categorySchema.index({
	level: 1,
	name: 1
}, {unique: true});
categorySchema.plugin(uniqueValidator);


module.exports = mongoose.model('category', categorySchema);
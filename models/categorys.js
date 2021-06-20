const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const categorySchema = new mongoose.Schema({
	level: {type: String},
	id: {type: String, unique: true},
	name: {type: String},
	fullName: {type: String},
})

categorySchema.index({
	level: 1,
	fullName: 1
}, {unique: true});
categorySchema.plugin(uniqueValidator);


module.exports = mongoose.model('category', categorySchema);
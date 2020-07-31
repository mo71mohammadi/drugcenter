const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const priceSchema = new mongoose.Schema({
	site: {type: String},
	irc: {type: String},
	gtn: {type: String},
	packageCount: {type: Number},
	sPrice: {type: Number},
	dPrice: {type: Number},
	cPrice: {type: Number},
	// 0: تعیین وضعیت نشد. 1: محصول متناظر آپدیت شده. 2: محصول متناظر یافت نشد
	type: {type: Number}
})

priceSchema.index({
	site: 1,
	irc: 1
}, {unique: true});
priceSchema.plugin(uniqueValidator);


module.exports = mongoose.model('price', priceSchema);
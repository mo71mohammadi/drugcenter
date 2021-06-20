const mongoose = require("mongoose");

const productStSchema = new mongoose.Schema({
	drugStore: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "drugStore",
		// required: true
	},
	products: [{
		product: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "product",
			// required: true
		},
		stock: {type: Number},
		expire: {type: Date}
	}]
});

model.exports = mongoose.model("productSt", productStSchema);
const express = require('express');
const query = require('url')
const excel = require('xlsx')
const mongoExcel = require('mongo-xlsx')
const fs = require('fs')
const Product = require("../models/products")
const Price = require("../models/prices")
let {PythonShell} = require('python-shell');


const Pagination = body => {
	let page;
	let size;
	if (body.page < 1 || !body.page) page = 0;
	else page = body.page - 1;
	if (body.size < 1 || !body.size) size = 1;
	else size = body.size;
	return {size, page}
};

exports.update = async (req, res) => {
	try {
		const {_id, sPrice, dPrice, cPrice} = req.body;
		const obj = {Date: `${new Date().toISOString()}`, sPrice: sPrice, cPrice: cPrice, dPrice: dPrice}
		Product.updateOne({
			_id: _id,
			$or: [{"price.sPrice": {$ne: sPrice}}, {"price.cPrice": {$ne: cPrice}}, {"price.dPrice": {$ne: dPrice}}]
		}, {$addToSet: {price: obj}}).then((result) => {
			if (result.n === 0) res.status(401).json({message: "_id Not Found or Price Add previously", result: null})
			else res.status(200).json({message: "Price Add Successfully", result})
		}).catch(err => {
			res.status(401).json({message: err.message, result: null})

		})
	} catch (err) {
		res.status(500).json(err.message)
	}
}
exports.delete = async (req, res) => {
	try {
		const {_id, priceId} = req.body;
		Product.updateOne({_id: _id}, {$pull: {price: {_id: priceId}}}).then(result => {
			res.status(200).json({message: result})
		})
	} catch (err) {
		res.status(500).json(err.message)
	}
}
exports.import = async (req, res) => {
	try {
		req.connection.setTimeout(1000 * 60 * 10);
		const wb = excel.read(req.files.price.data, {cellDates: true});
		const ws = wb.Sheets['Sheet1'];
		const jsonData = excel.utils.sheet_to_json(ws);
		console.log(jsonData);
		// Product.
	} catch (err) {
		res.status(500).json(err.message)
	}
}

exports.getAll = async (req, res) => {
	try {
		let {type, site, size, page} = query.parse(req.url, true).query;
		size = parseInt(size)
		page = parseInt(page)
		if (!size || size < 1) size = 1
		if (!page || page < 1) page = 1
		Price.find({site: site, type: type}).skip(size * page).limit(size).then(async prices => {
			const count = await Price.countDocuments({site: site, type: type});
			res.status(200).json({count, data: prices})
		})
	} catch (err) {
		res.status(500).json(err.message)
	}
};
exports.download = async (req, res) => {
	try {
		const {site} = req.body;
		if (site === "ttac") {
			let options = {
				pythonPath: '/home/ehrs/virtualenv/python/3.7/bin/python3.7',
				// pythonPath: '/home/mojtaba/PycharmProjects/DrugCenter_0/venv/bin/python',
				// scriptPath: '/home/mojtaba/WebstormProjects/api/routes/',
			};
			let test = new PythonShell('./routes/script.py', options);
			test.on('message', message => {
				let rawData = fs.readFileSync('data.json');
				let data = JSON.parse(rawData);
				const newData = []
				for (const item of data) {
					item.type = 0;
					item.site = "ttac";
					newData.push(item)
				}
				Price.deleteMany({site: "ttac"}).then(result => {
					Price.insertMany(newData)
				})
				res.status(200).json({message: message})
			})
		} else {
			res.status(401).json({message: "site name not found."})
		}
	} catch (err) {
		res.status(500).json(err.message)
	}
};
exports.updateFrom = async (req, res) => {
	try {
		req.connection.setTimeout(1000 * 60 * 10);
		const prices = await Price.find({site: "ttac"})
		const update = await Product.aggregate([{$match: {"update.type": "ttac"}}, {
			$group: {"_id": {}, update: {$addToSet: {code: "$update.code"}}}
		}])
		// const ircList = []
		// for (const item of update[0].update) if (item.code) ircList.push(item.code)

		let count = 0
		for (const irc of update[0].update) {
			const obj = prices.find(item => item.irc === irc.code)
			Price.updateOne({_id: obj._id}, {$set: {status: 1}})
			if (obj.cPrice || obj.sPrice || obj.dPrice) {
				count++
				console.log(count)
				const newPrice = {sPrice: obj.sPrice, dPrice: obj.dPrice, cPrice: obj.cPrice}
				await Product.updateOne({
					updateCode: obj.irc,
					$or: [{"price.sPrice": {$ne: newPrice.sPrice}}, {"price.cPrice": {$ne: newPrice.cPrice}}, {"price.dPrice": {$ne: newPrice.dPrice}}]
				}, {$addToSet: {price: newPrice}}).then(result => {

					// else console.log(obj.irc, result)
				})

				// await Product.findOne({updateCode: obj.irc}).then(async result => {
				// 	if (result) {
				// 		await Price.updateOne({_id: obj._id}, {$set: {status: 1}})
				// 		const newPrice = {}
				// 		let change = 0
				// 		if (obj.sPrice && obj.sPrice !== newPrice.sPrice) {
				// 			newPrice.sPrice = obj.sPrice;
				// 			change++
				// 		}
				// 		if (obj.dPrice && obj.dPrice !== newPrice.dPrice) {
				// 			newPrice.dPrice = obj.dPrice;
				// 			change++
				// 		}
				// 		if (obj.cPrice && obj.cPrice !== newPrice.cPrice) {
				// 			newPrice.cPrice = obj.cPrice;
				// 			change++
				// 		}
				// 		if (change !== 0) await Product.updateOne({
				// 			updateCode: obj.irc,
				// 			$or: [{"price.sPrice": {$ne: obj.sPrice}}, {"price.cPrice": {$ne: obj.cPrice}}, {"price.dPrice": {$ne: obj.dPrice}}]
				// 		}, {$addToSet: {price: newPrice}})
				// 	} else {
				// 		await Price.updateOne({_id: obj._id}, {$set: {type: 2}})
				// 	}
				// }).catch(err => {
				// 	res.status(401).json(err.message)
				// })
			}
		}
		res.status(200).json({message: 'updated successfully!'})
	} catch (err) {
		res.status(500).json(err.message)
	}
};


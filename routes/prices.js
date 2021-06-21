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

exports.create = async (req, res) => {
	try {
		const filter = req.body;
		if (!filter.irc || !filter.site) return res.status(401).json({message: "irc Not found!", result: null})
		Price.create(filter).then(result => {
			res.status(200).json({message: "Price insert Successfully.", result})
		}).catch(err => {
			res.status(401).json(err.message)
		})
	} catch (err) {
		res.status(500).json(err.message)
	}
};
exports.update = async (req, res) => {
	try {
		const filter = req.body;
		delete filter.price;
		delete filter.date
		console.log(filter)
		if (!filter._id) return res.status(401).json({message: "Price _id not found!", result: null})
		Price.updateOne({_id: filter._id}, filter).then((result) => {
			res.status(200).json({message: "Price Update Successfully.", result});
		}).catch(err => {
			if (err.path === '_id') res.status(500).json({message: "Price _id not found!", result: null});
			else res.status(500).json(err.message)
		})

	} catch (err) {
		res.status(500).json(err.message)
	}
};
exports.delete = async (req, res) => {
	try {
		Price.findByIdAndDelete(req.body._id).then(result => {
			if (result) res.status(200).json("Deleted Successfully");
			else res.status(401).json("_id Not Found!")
		})
	} catch (err) {
		res.status(500).json(err.message)
	}
};
exports.getAll = async (req, res) => {
	try {
		// let {type, site, size, page} = query.parse(req.url, true).query;
		let {size, page} = Pagination(req.body);
		const filter = req.body;
		delete filter.page;
		delete filter.size;
		let search = {};
		for (const item of Object.keys(filter)) {
			let regex = new RegExp(filter[item], 'i');
			if (filter[item]) search[item] = regex
		}
		// for (const item of Object.keys(filter)) if (filter[item]) search[item] = filter[item]
		size = parseInt(size)
		page = parseInt(page)

		Price.find(search).skip(size * page).limit(size).sort({_id: 1}).populate('product').then(async prices => {
			const newPrices = []
			for (let price of prices) {
				price = price.toObject()
				if (price.product) price.eRx = price.product.eRx
				delete price.product
				newPrices.push(price)
			}
			const count = await Price.countDocuments(filter);
			res.status(200).json({count, data: newPrices})
		})
	} catch (err) {
		res.status(500).json(err.message)
	}
};
exports.download = async (req, res) => {
	try {
		req.connection.setTimeout(1000 * 60 * 10);
		const {site} = req.body;
		if (site === "ttac") {
			let options = {
				// pythonPath: '/home/ehrs/virtualenv/python/3.7/bin/python3.7',
				pythonPath: '/media/mojtaba/6FA8893B6D355C17/1400.01.03/Home/PycharmProjects/DrugCenter_0/venv/bin/python3.7',
				// scriptPath: '/home/mojtaba/WebstormProjects/api/routes/',
			};
			let test = new PythonShell('./routes/script.py', options);
			test.on('message', async message => {
				let rawData = fs.readFileSync('data.json');
				let data = JSON.parse(rawData);
				// await Price.deleteMany({})
				for (const item of data) {
					item.type = 0;
					item.site = "ttac";
					item.price = {sPrice: item.sPrice, cPrice: item.cPrice, dPrice: item.dPrice}
					delete item.sPrice;
					delete item.dPrice;
					delete item.cPrice

					await Price.updateOne({
						irc: item.irc
					}, {$addToSet: {price: item.price}}, {rawResult: true}).then(async result => {
						if (result.nModified !== 0) {
							item.date = new Date().toISOString()
							await Price.updateOne({irc: item.irc}, {$push: {date: item.date}})
							result.data
						}
						if (result.n === 0) {
							item.date = new Date().toISOString()
							await Price.create(item)
						}
					})
				}
				res.status(200).json({message: message})
			})
		} else {
			res.status(401).json({message: "site name not found."})
		}
	} catch (err) {
		res.status(500).json(err.message)
	}
};
exports.updateFromTTAC = async (req, res) => {
	try {
		req.connection.setTimeout(1000 * 60 * 10);
		const prices = await Price.find({site: "ttac", product: {$ne: null}})
		// const update = await Product.aggregate([{$match: {"update.type": "ttac"}}, {
		// 	$group: {"_id": {}, update: {$addToSet: {code: "$update.code"}}}
		// }])
		// const ircList = []
		// for (const item of update[0].update) if (item.code) ircList.push(item.code)
		for (const price of prices) {
			const lastPrice = price.price[price.price.length - 1]
			await Product.updateOne({
				_id: price.product,
				$or: [{"price.sPrice": {$ne: lastPrice.sPrice}}, {"price.cPrice": {$ne: lastPrice.cPrice}}, {"price.dPrice": {$ne: lastPrice.dPrice}}]
			}, {$addToSet: {price: lastPrice}})
		}
		// let count = 0
		// for (const irc of update[0].update) {
		// 	const obj = prices.find(item => item.irc === irc.code)
		// 	await Price.updateOne({_id: obj._id}, {type: 1})
		// 	if (obj.cPrice || obj.sPrice || obj.dPrice) {
		// 		count++
		// 		console.log(count)
		// 		const newPrice = {sPrice: obj.sPrice, dPrice: obj.dPrice, cPrice: obj.cPrice}
		// 		await Product.updateOne({
		// 			updateCode: obj.irc,
		// 			$or: [{"price.sPrice": {$ne: newPrice.sPrice}}, {"price.cPrice": {$ne: newPrice.cPrice}}, {"price.dPrice": {$ne: newPrice.dPrice}}]
		// 		}, {$addToSet: {price: newPrice}}).then(result => {
		//
		// 			// else console.log(obj.irc, result)
		// 		})
		//
		// 		// await Product.findOne({updateCode: obj.irc}).then(async result => {
		// 		// 	if (result) {
		// 		// 		await Price.updateOne({_id: obj._id}, {$set: {status: 1}})
		// 		// 		const newPrice = {}
		// 		// 		let change = 0
		// 		// 		if (obj.sPrice && obj.sPrice !== newPrice.sPrice) {
		// 		// 			newPrice.sPrice = obj.sPrice;
		// 		// 			change++
		// 		// 		}
		// 		// 		if (obj.dPrice && obj.dPrice !== newPrice.dPrice) {
		// 		// 			newPrice.dPrice = obj.dPrice;
		// 		// 			change++
		// 		// 		}
		// 		// 		if (obj.cPrice && obj.cPrice !== newPrice.cPrice) {
		// 		// 			newPrice.cPrice = obj.cPrice;
		// 		// 			change++
		// 		// 		}
		// 		// 		if (change !== 0) await Product.updateOne({
		// 		// 			updateCode: obj.irc,
		// 		// 			$or: [{"price.sPrice": {$ne: obj.sPrice}}, {"price.cPrice": {$ne: obj.cPrice}}, {"price.dPrice": {$ne: obj.dPrice}}]
		// 		// 		}, {$addToSet: {price: newPrice}})
		// 		// 	} else {
		// 		// 		await Price.updateOne({_id: obj._id}, {$set: {type: 2}})
		// 		// 	}
		// 		// }).catch(err => {
		// 		// 	res.status(401).json(err.message)
		// 		// })
		// 	}
		// }
		res.status(200).json({message: 'updated successfully!'})
	} catch (err) {
		res.status(500).json(err.message)
	}
};
exports.updateIRC = async (req, res) => {
	try {
		req.connection.setTimeout(1000 * 60 * 10);
		if (req.files) {
			const wb = excel.read(req.files.update.data, {cellDates: true});
			const ws = wb.Sheets['Sheet1'];
			const jsonData = excel.utils.sheet_to_json(ws);
			// let success = 0;
			// let repeat = 0;
			// const successList = [];
			// const repeatList = [];
			for (const obj of jsonData) {
				// console.log(obj)
				Price.findOne({irc: obj.irc}).then(async price => {
					const lastPrice = price.price[price.price.length - 1]
					console.log(lastPrice, obj.eRx)
					await Product.updateOne({
						eRx: obj.eRx.slice(3,9),
						$or: [{"price.sPrice": {$ne: lastPrice.sPrice}}, {"price.cPrice": {$ne: lastPrice.cPrice}}, {"price.dPrice": {$ne: lastPrice.dPrice}}]
					}, {$addToSet: {price: lastPrice}}).then(()=>{
						// console.log(obj.eRx)
					})

				})
			}
			// res.status(200).json({success: "success"
				// success: {0: `${success} item import successfully`, successList},
				// repeat: {0: `${repeat} item duplicate`, repeatList},

			// })
		} else res.status(401).json({message: 'File Not Found!'})

	}catch (err) {
		res.status(500).json(err.message)
	}
};


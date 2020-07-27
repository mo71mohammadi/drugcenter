const express = require('express');
const query = require('url')
const excel = require('xlsx')
const mongoExcel = require('mongo-xlsx')
const fs = require('fs')
const Product = require("../models/products")
const Category = require("../models/categorys")


/*
صفحه بندی از صفر شروع می شود
 */
const Pagination = body => {
	let page;
	let size;
	if (body.page < 1 || !body.page) page = 0;
	else page = body.page - 1;
	if (body.size < 1 || !body.size) size = 1;
	else size = body.size;
	return {size, page}
};

exports.getAll = async (req, res) => {
	try {
		const {size, page} = Pagination(req.body);
		const filter = req.body;
		delete filter.page;
		delete filter.size;
		let search = {};
		for (const item of Object.keys(filter)) {
			if (filter[item]) search[item] = filter[item]
		}
		Product.find(search).skip(size * page).limit(size).sort({_id: -1}).then(async products => {
			const count = await Product.countDocuments(search);
			// const productList = [];
			// for (const product of products) {
			// 	delete product.upToDateId;
			// 	delete product.medScapeId;
			// 	productList.push(product)
			// }
			res.status(200).json({count, data: products})
		}).catch(err => {
			res.status(401).json(err.message)
		});

	} catch (err) {
		res.status(500).json(err.message)
	}
};

exports.getOne = async (req, res) => {
	try {
		Product.findById(req.body._id).then(product => {
			res.status(200).json(product)
		})
	} catch (err) {
		res.status(500).json(err.message)
	}
};

exports.create = async (req, res) => {
	try {
		const filter = req.body;
		delete filter.price
		Product.create(filter).then(result => {
			res.status(200).json({message: "product insert Successfully.", result})
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
		delete filter.price
		Product.updateOne({_id: filter._id}, filter).then((result) => {
			res.status(200).json({message: "product Update Successfully.", result});
		}).catch(err => {
			if (err.path === '_id') res.status(500).json({message: "Product _id not found!", result: null});
			else res.status(500).json(err.message)
		})
	} catch (err) {
		res.status(500).json(err.message)
	}
};

exports.updatePrice = async (req, res) => {
	try {
		const {_id, sPrice, dPrice, cPrice} = req.body;
		const obj = {Date: `${new Date().toISOString()}`, sPrice: sPrice, cPrice: cPrice, dPrice: dPrice}
		Product.updateOne({
			_id: _id,
			$or: [{"price.sPrice": {$ne: sPrice}}, {"price.cPrice": {$ne: cPrice}}, {"price.dPrice": {$ne: dPrice}}]
		}, {$addToSet: {price: obj}}).then((result) => {
			if (result.n === 0) res.status(401).json({message: "_id Not Found or Price Add previously", result: null})
			res.status(200).json({message: "Price Add Successfully", result})
		}).catch(err => {
			res.status(401).json({message: err.message, result: null})

		})
		// { "carrier.state": { $ne: "NY" }
		// Product.findOne({_id: _id}).then(result => {
		// 	if (result) {
		// 		console.log(result, object)
		// 		if (result.sPrice !== sPrice || result.cPrice !== cPrice || result.dPrice !== dPrice) {
		// 		}
		// 	}
		// })
	} catch (err) {
		res.status(500).json(err.message)
	}
}

exports.deletePrice = async (req, res) => {
	try {
		const {_id, priceId} = req.body;
		Product.updateOne({_id: _id}, {$pull: {price: {_id: priceId}}}).then(result => {
			res.status(200).json({message: result})
		})
	} catch (err) {
		res.status(500).json(err.message)
	}
}

exports.delete = async (req, res) => {
	try {
		Product.findByIdAndDelete(req.body._id).then(result => {
			if (result) res.status(200).json("Deleted Successfully");
			else res.status(401).json("_id Not Found!")
		})
	} catch (err) {
		res.status(500).json(err.message)
	}
};

exports.import = async (req, res) => {
	try {
		req.connection.setTimeout(1000 * 60 * 10);
		if (req.files) {
			const wb = excel.read(req.files.products.data, {cellDates: true});
			console.log("obj")

			const ws = wb.Sheets['Sheet1'];
			const jsonData = excel.utils.sheet_to_json(ws);
			console.log(jsonData.length);
			const packObj = {1: "A", 2: "B", 3: "C", 4: "D", 5: "E", 6: "F", 7: "G", 8: "H"};
			const eRxList = [];
			let success = 0;
			let repeat = 0;
			const successList = [];
			const repeatList = [];
			for (const obj of jsonData) {
				for (const key of Object.keys(obj)) {
					if (!["genericCode", "packageCount"].includes(key) && ['0', 0, '-'].includes(obj[key])) obj[key] = ''
				}
				console.log(obj)
				eRxList.push(obj.eRx.slice(0, 9));
				let count = 0;
				eRxList.map(e => {
					if (e === obj.eRx.slice(0, 9)) count++
				});
				if (obj.L1) obj.L1 = obj.L1.replace(/ {2,}/g, ' ').trim();
				if (obj.L2) obj.L2 = obj.L2.replace(/ {2,}/g, ' ').trim();
				if (obj.L3) obj.L3 = obj.L3.replace(/ {2,}/g, ' ').trim();
				if (obj.L4) obj.L4 = obj.L4.replace(/ {2,}/g, ' ').trim()
				let search
				if (!obj.L1) return res.status(401).json({message: "L1 not found."})
				else if (!obj.L2) search = {level: "L1", name: obj.L1}
				else if (!obj.L3) search = {level: "L2", name: obj.L1 + "-" + obj.L2}
				else if (!obj.L4) search = {level: "L3", name: obj.L1 + "-" + obj.L2 + "-" + obj.L3}
				else search = {level: "L4", name: obj.L1 + "-" + obj.L2 + "-" + obj.L3 + "-" + obj.L4}
				const category = await Category.findOne(search)
				if (!category) return res.status(401).json({message: "category not found. first import Category"})
				obj.category = category.id
				obj.eRx = obj.eRx.slice(0, 9);
				obj.packageCode = packObj[count];
				// obj.packageCount = obj.packageCount;
				// obj.packageType = obj.packageType.trim();
				// console.log(obj)
				// obj.genericCode = obj.genericCode.trim();
				obj.enBrandName = obj.enBrandName.trim();
				obj.faBrandName = obj.faBrandName.trim();
				// obj.atc = [{code: obj.atc.trim()}];
				// obj.category = obj.category.trim();
				// obj.ddd = obj.ddd.trim();
				// obj.edl = obj.edl.trim();
				obj.gtn = [obj.gtn.toString().trim()];
				obj.irc = [obj.irc.toString().trim()];
				obj.nativeIRC = obj.nativeIrc.toString().trim();
				obj.licenceOwner = obj.licenceOwner.trim();
				obj.brandOwner = obj.brandOwner.trim();
				obj.countryBrandOwner = obj.countryBrandOwner.trim();
				obj.countryProducer = obj.countryProducer.trim();
				obj.producer = obj.producer.trim();
				obj.cName = [obj.cName.trim()];
				// obj.enName = obj.enName.trim();
				// obj.faName = obj.faName.trim();
				// obj.strength = obj.strength.trim();
				// obj.volume = obj.volume.trim();
				// obj.enForm = obj.enForm.trim();
				// obj.faForm = obj.faForm.trim();
				// obj.enRoute = obj.enRoute.trim();
				// obj.faRoute = obj.faRoute.trim();
				// obj.medScapeId = obj.medScapeId.toString().trim();
				// obj.upToDateId = obj.upToDateId.toString().trim();
				await Product.create(obj).then(result => {
					success++;
					successList.push(obj.eRx + obj.packageCode)
				}).catch(err => {
					repeat++;
					repeatList.push(obj.eRx + obj.packageCode);
					// fs.appendFile('test.txt', obj.eRx + obj.packageCode + '\n', result => {
					// })
				})
			}
			res.status(200).json({
				success: {0: `${success} item import successfully`, successList},
				repeat: {0: `${repeat} item duplicate`, repeatList},

			})
		} else res.status(401).json({message: 'File Not Found!'})
	} catch (err) {
		res.status(500).json(err.message)
	}
};

exports.importPrice = async (req, res) => {
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

exports.export = async (req, res) => {
	try {
		const filter = req.body;
		delete filter.page;
		delete filter.size;
		Product.find(filter).then(products => {
			let productList = [];
			for (let product of products) {
				product = product.toObject();
				delete product._id;
				delete product.__v;
				productList.push(product)
			}
			let model = mongoExcel.buildDynamicModel(productList);
			/* Generate Excel */
			const options = {
				fileName: "products.xlsx",
				path: "temp"
			};
			console.log(productList)

			mongoExcel.mongoData2Xlsx(productList, model, options, function (err, data) {
				res.download('temp/' + data.fileName, data.fileName);
			});
		}).catch(err=>{
			res.status(401).json(err.message)
		})
	} catch (err) {
		res.status(500).json(err.message)
	}
};


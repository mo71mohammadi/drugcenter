const express = require('express');
const query = require('url')
const excel = require('xlsx')
const mongoExcel = require('mongo-xlsx')
const fs = require('fs')
const Product = require("../models/products")
const Category = require("../models/categorys")
const multer = require('multer')
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'uploads/');
	},

	// By default, multer removes file extensions so let's add them back
	filename: function (req, file, cb) {
		cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
	}
});
const helpers = require('../helpers');
const path = require('path');


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
			let regex = new RegExp(filter[item], 'i');

			if (filter[item]) search[item] = regex
		}
		Product.find(search).skip(size * page).limit(size).sort({_id: -1}).then(async products => {
			const count = await Product.countDocuments(search);
			const productList = []
			for (let product of products) {
				product = product.toObject();
				product.priceHistory = product.price
				product.price = product.priceHistory[product.priceHistory.length - 1]
				if (!product.price) product.price = {sPrice: 0, dPrice: 0, cPrice: 0}
				productList.push(product)
			}
			res.status(200).json({count, data: productList})
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
		// let upload = multer({storage: storage, fileFilter: helpers.imageFilter}).array('productImg', 10);
		// upload(req, res, function (err) {
		// 	if (req.fileValidationError) return res.send(req.fileValidationError)
		// 	// else if (!req.file) return res.send('Please select an image to upload')
		// 	else if (err instanceof multer.MulterError) return res.send(err)
		// 	else if (err) return res.send(err)
		//
		// 	let index, len;
		// 	const imgPath = []
		// 	for (index = 0, len = req.files.length; index < len; ++index) {
		// 		imgPath.push(req.files[index].filename)
		// 	}
		//
		// });
		const filter = req.body;
		delete filter.price
		// if (req.files) filter.image = imgPath
		Product.create(filter).then(result => {
			res.status(200).json({message: "product insert Successfully.", result})
		}).catch(err => {
			// if (req.file) fs.unlinkSync(req.file.path)
			res.status(401).json(err.message)
		})

		// const name = `${Date.now() + Math.floor(Math.random() * 10000)}` + req.files.productImg.name.match(/(\.\b)(?!.*\1).*/)[0]
		// fs.writeFile(`uploads/${name}`, req.files.productImg.data, 'binary', function (err, data){
		// })
	} catch (err) {
		res.status(500).json(err.message)
	}
};
exports.uploadImg = async (req, res) => {
	try {
		let upload = multer({storage: storage, fileFilter: helpers.imageFilter}).array('productImg', 10);
		upload(req, res, function (err) {
			const {_id} = req.body
			if (req.fileValidationError) return res.send(req.fileValidationError)
			else if (!req.files) return res.send('Please select an image to upload')
			else if (err instanceof multer.MulterError) return res.send(err)
			else if (err) return res.send(err)
			let index, len;
			const imgPath = []
			for (index = 0, len = req.files.length; index < len; ++index) {
				imgPath.push(req.files[index].filename)
			}
			Product.updateOne({_id: _id}, {$push: {image: {$each: imgPath}}}).then(result => {
				res.status(200).json({message: "image upload Successfully.", result});
			}).catch(err => {
				if (err.path === '_id') res.status(401).json({message: "Product _id not found!", result: null});
				else res.status(500).json({message: err.message, result: null})
			})
		})
	} catch (err) {
		res.status(500).json(err.message)
	}
}
exports.deleteImg = async (req, res) => {
	try {
		const {_id, item} = req.body
		Product.updateOne({_id: _id}, {$pull: {image: item}}).then(result => {
			fs.unlinkSync(`uploads/${item}`)
			console.log(_id)

			res.status(200).json({message: "image Delete Successfully.", result});
		}).catch(err => {
			if (err.path === '_id') res.status(401).json({message: "Product _id not found!", result: null});
			else res.status(500).json({message: err.message, result: null})
		})

	} catch (err) {
		res.status(500).json(err.message)
	}
}
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
exports.delete = async (req, res) => {
	try {
		const product = Product.findOne({_id: req.body._id})
		Product.findByIdAndDelete(req.body._id).then(result => {
			console.log(product)
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
				if (!obj.L1 && !obj.level) return res.status(401).json({message: "level 0r L1 not found."})
				else if (obj.level) {
					const level = obj.level.split(' - ')
					let levelList = []
					for (let L of level) levelList.push(L.replace(/ {2,}/g, ' ').trim())
					search = {level: "L4", fullName: levelList.join(' - ')}
				} else if (!obj.L2) search = {level: "L1", fullName: obj.L1}
				else if (!obj.L3) search = {level: "L2", fullName: obj.L1 + " - " + obj.L2}
				else if (!obj.L4) search = {level: "L3", fullName: obj.L1 + " - " + obj.L2 + " - " + obj.L3}
				else search = {level: "L4", fullName: obj.L1 + " - " + obj.L2 + " - " + obj.L3 + " - " + obj.L4}
				const category = await Category.findOne(search)
				if (!category) return res.status(401).json({message: "category not found. first import Category"})
				obj.category = category.id
				obj.eRx = obj.eRx.slice(0, 9);
				obj.packageCode = packObj[count];
				// obj.packageCount = obj.packageCount;
				// obj.packageType = obj.packageType.trim();
				// console.log(obj)
				// obj.genericCode = obj.genericCode.trim();
				obj.enBrandName = obj.enBrandName.toString().trim();
				obj.faBrandName = obj.faBrandName.toString().trim();
				// obj.atc = [{code: obj.atc.trim()}];
				// obj.category = obj.category.trim();
				// obj.ddd = obj.ddd.trim();
				// obj.edl = obj.edl.trim();
				obj.gtn = obj.gtn.toString().trim().split('\n');
				obj.irc = obj.irc.toString().trim().split('\n');
				obj.nativeIRC = obj.nativeIrc.toString().trim();
				obj.licenceOwner = obj.licenceOwner.toString().trim();
				obj.brandOwner = obj.brandOwner.toString().trim();
				obj.countryBrandOwner = obj.countryBrandOwner.toString().trim();
				obj.countryProducer = obj.countryProducer.toString().trim();
				obj.producer = obj.producer.toString().trim();
				obj.cName = [obj.cName.toString().trim()];
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
exports.importUpdate = async (req, res) => {
	try {
		req.connection.setTimeout(1000 * 60 * 10);
		if (req.files) {
			const wb = excel.read(req.files.update.data, {cellDates: true});
			const ws = wb.Sheets['Sheet1'];
			const jsonData = excel.utils.sheet_to_json(ws);
			let success = 0;
			let repeat = 0;
			const successList = [];
			const repeatList = [];
			for (const obj of jsonData) {
				await Product.updateMany({eRx: obj.eRx.slice(0, 9)}, {
					"update.code": obj.irc.toString().trim(), "update.type": obj.type.toString().trim()
				}).then(result => {
					success++;
					successList.push(obj.eRx)
				}).catch(err => {
					console.log(err)
					repeat++;
					repeatList.push(obj.eRx);
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
exports.export = async (req, res) => {
	try {
		const filter = req.body;
		delete filter.page;
		delete filter.size;
		let search = {};
		for (const item of Object.keys(filter)) {
			let regex = new RegExp(filter[item], 'i');

			if (filter[item]) search[item] = regex
		}

		Product.find(search).then(products => {
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
		}).catch(err => {
			res.status(401).json(err.message)
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
			else res.status(200).json({message: "Price Add Successfully", result})
		}).catch(err => {
			res.status(401).json({message: err.message, result: null})

		})
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
exports.search = async (req, res) => {
	try {
		let {q, limit} = query.parse(req.url, true).query;
		if (!limit || limit > 50) limit = 50
		let regex = new RegExp(q, 'i');
		Product.find({
			$or: [{enGenericName: regex}, {faGenericName: regex}, {enBrandName: regex}, {faBrandName: regex}]
		}, {_id: 1, enGenericName: 1, faGenericName: 1, enBrandName: 1, faBrandName: 1, packageCount: 1}).limit(parseInt(limit)).then(result => {
			// console.log(result)
			res.status(200).json({count: result.length, data: result})
		})
	} catch (err) {
		res.status(500).json(err.message)
	}
}

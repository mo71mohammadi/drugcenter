const express = require('express');
const query = require('url')
const excel = require('xlsx')
const mongoExcel = require('mongo-xlsx')
const fs = require('fs')
const Product = require("../models/products")
const Category = require("../models/categorys")
const multer = require('multer')
const storage = multer.diskStorage({
	destination: function(req, file, cb) {
		cb(null, 'uploads/');
	},

	// By default, multer removes file extensions so let's add them back
	filename: function(req, file, cb) {
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
			if (filter[item]) search[item] = filter[item]
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
		let upload = multer({ storage: storage, fileFilter: helpers.imageFilter }).array('productImg', 10);
		upload(req, res, function(err) {
			if (req.fileValidationError) return res.send(req.fileValidationError)
			// else if (!req.file) return res.send('Please select an image to upload')
			else if (err instanceof multer.MulterError) return res.send(err)
			else if (err) return res.send(err)

			let index, len;
			const imgPath = []
			for (index = 0, len = req.files.length; index < len; ++index) {
				imgPath.push(req.files[index].filename)
			}

			const filter = req.body;
			delete filter.price
			if (req.files) filter.image = imgPath
			Product.create(filter).then(result => {
				res.status(200).json({message: "product insert Successfully.", result})
			}).catch(err => {
				if (req.file) fs.unlinkSync(req.file.path)
				res.status(401).json(err.message)
			})
		});

		// const name = `${Date.now() + Math.floor(Math.random() * 10000)}` + req.files.productImg.name.match(/(\.\b)(?!.*\1).*/)[0]
		// fs.writeFile(`uploads/${name}`, req.files.productImg.data, 'binary', function (err, data){
		// })
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
		}).catch(err => {
			res.status(401).json(err.message)
		})
	} catch (err) {
		res.status(500).json(err.message)
	}
};



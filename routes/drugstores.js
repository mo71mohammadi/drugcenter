const DrugStore = require("../models/drugStores");
const xlsx = require('xlsx');
const Drug = require("../models/drugs");
const UpToDate = require("../models/upToDate");
const MedScape = require("../models/medScape");
const query = require('url');
const fs = require('fs');
const path = require('path');
const mongoXlsx = require('mongo-xlsx');
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

exports.getAll = async (req, res) => {
	try {
		const {size, page} = Pagination(req.body);
		const filter = req.body;
		delete filter.page;
		delete filter.size;
		let search = {};
		for (let item in filter) {
			if (filter[item]) search[item] = filter[item]
		}
		DrugStore.find(search).skip(size * page).limit(size).sort({id: 1}).then(async drugStores => {
			const count = await DrugStore.countDocuments(search);
			const drugStoreList = [];
			for (const drugStore of drugStores) {
				drugStoreList.push(drugStore)
			}
			res.status(200).json({count, data: drugStoreList})
		}).catch(err => {
			res.status(401).json(err.message)
		});

	} catch (err) {
		res.status(500).json({message: err.message})
	}
};

exports.import = async (req, res) => {
	try {
		req.connection.setTimeout(1000 * 60 * 10);
		if (req.files) {
			const wb = xlsx.read(req.files['drugStores'].data, {cellDates: true});
			const ws = wb.Sheets['data'];
			const jsonData = xlsx.utils.sheet_to_json(ws);
			console.log(jsonData.length);
			let success = 0;
			let repeat = 0;
			const successList = [];
			const repeatList = [];
			for (const obj of jsonData) {
				obj.selected = obj.selected === 'بلی';
				obj.hix = obj.hix.trim();
				obj.contact = {work: obj.work.toString().trim()};
				obj.contact.phone = obj.phone.toString().trim();
				await DrugStore.create(obj).then(result => {
					success++;
					successList.push(obj.id)
				}).catch(err => {
					// console.log(obj.id, err.message);
					repeat++;
					repeatList.push(obj.id);
				})
			}
			res.status(200).json({
				success: {0: `${success} item import successfully`, successList},
				repeat: {0: `${repeat} item duplicate`, repeatList},
			})
		} else res.status(401).json({message: 'File Not Found!'})
	} catch (err) {
		res.status(500).json({message: err.message})
	}
};

exports.deleteAll = async (req, res) => {
	try {
		DrugStore.deleteMany().then(result => {
			return res.status(200).json({message:`Deleted ${result.n} items`})
		})
	} catch (error) {
		res.status(500).json({error: error.message})
	}
};

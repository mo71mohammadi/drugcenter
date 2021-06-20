const Distributor = require('../models/distributors');
const DrugStore = require("../models/archive/drugStores");
const xlsx = require('xlsx');

const Pagination = body => {
	let page;
	let size;
	if (body.page < 1 || !body.page) page = 0;
	else page = body.page - 1;
	if (body.size < 1 || !body.size) size = 1;
	else size = body.size;
	return {size, page}
};

exports.import = async (req, res) => {
	try {
		req.connection.setTimeout(1000 * 60 * 10);
		if (req.files) {
			const wb = xlsx.read(req.files['distributors'].data, {cellDates: true});
			const ws = wb.Sheets['data'];
			const jsonData = xlsx.utils.sheet_to_json(ws);
			console.log(jsonData.length);
			// Distributor.updateOne({id: jsonData.id, "finditem._id": {$ne: nitem[0]._id}}, {})
			let count = 0;
			for (const obj of jsonData) {
				console.log(obj);
				const drugStore = await DrugStore.findOne({id: obj.drugStoreId});
				obj.branch = obj.branch.toString().trim();
				obj.customers = {
					drugStore: drugStore._id,
					line: obj.line.toString().trim(),
					code: obj.customerCode.toString().trim(),
					active: true
				};

				const item = await Distributor.findOne({
					name: obj.name,
					branch: obj.branch,
					line: obj.line
				});
				if (item) {
					await Distributor.updateOne({
						name: obj.name,
						branch: obj.branch,
						line: obj.line,
						"customers.code": {$ne: obj.customers.code},
						"customers.drugStore": {$ne: drugStore._id}
					}, {$addToSet: {customers: obj.customers}})
				} else {
					await Distributor.create(obj);
					count = count + 1
				}
				console.log(count)
			}
		} else res.status(401).json({message: 'File Not Found!'})
	} catch (error) {
		res.status(500).json({message: error.message})
	}
};

exports.getAll = async (req, res) => {
	try {
		const {size, page} = Pagination(req.body);
		const filter = req.body;
		delete filter.page;
		delete filter.size;
		for (const item of Object.keys(filter)) {
			if (!filter[item]) delete filter[item]
		}
		Distributor.find(filter).populate('customers.drugStore').then(async customers => {
			// const count = await Distributor.countDocuments(filter);
			let customerList = [];
			for (const customer of customers) {
				const optList = [];
				for (const item of customer.customers) {
					const store = item.drugStore.toObject();
					store.Rid = customer._id;
					store.Nid = item._id;
					store.code = item.code;
					store.active = item.active;
					store.line = item.line;
					optList.push(store)
				}
				customerList = customerList.concat(optList)
			}
			res.status(200).json({count:customerList.length, data: customerList})
		}).catch(err => {
			res.status(401).json(err.message)
		});
	} catch (err) {
		res.status(500).json({message: err.message})
	}
};

exports.delete = async (req, res) => {
	try {
		const filter = req.body;
		delete filter.page;
		delete filter.size;

		Distributor.deleteMany(filter).then(result => {
			return res.status(200).json({message: `Deleted ${result.n} items`})
		})
	} catch (error) {
		res.status(500).json({error: error.message})
	}
};

exports.update = async (req, res) => {
	try {
		const _id = req.body._id;
		if (!_id) return res.status(401).json("Product _id not found!");
		delete req.body._id;
		// const resaa = await Distributor.findOne({_id: _id});
		Distributor.updateOne({_id: _id}, req.body).then(async result => {
			// if (result.n === 0) return res.status(500).json("Product _id not found!");
			res.status(200).json("drug Update Successfully!");
		}).catch(err => {
			if (err.path === '_id') res.status(500).json("Product _id not found!");
			else res.status(500).json(err.message)
		})
	} catch (err) {
		res.status(500).json(err.message)
	}
};

exports.create = async (req, res) => {
	try {
		res.status(200).json('Test Ok...')
	} catch (err) {
		res.status(500).json(err.message)
	}
};

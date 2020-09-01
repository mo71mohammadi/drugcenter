const DrugInfo = require("../models/drugsInfo");
const query = require('url');
const mongoExcel = require('mongo-xlsx')


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
		DrugInfo.find(search).skip(size * page).limit(size).sort({_id: -1, enName: 1, enRoute: 1}).then(async drugs => {
			const count = await DrugInfo.countDocuments(search);
			res.status(200).json({count, data: drugs})
		}).catch(err => {
			res.status(401).json(err.message)
		});
	} catch (err) {
		res.status(500).json(err.message)
	}
};
exports.getOne = async (req, res) => {
	try {
		DrugInfo.findById(req.body._id).then(drug => {
			res.status(200).json(drug)
		})
	} catch (err) {
		res.status(500).json(err.message)
	}
};
exports.create = async (req, res) => {
	try {
		DrugInfo.create(req.body).then(result => {
			res.status(200).json({message: "drug insert Successfully.", result})
		}).catch(err => {
			res.status(401).json(err.message)
		})
	} catch (err) {
		res.status(500).json(err.message)
	}
};
exports.update = async (req, res) => {
	try {
		DrugInfo.updateOne({_id: req.body._id}, req.body).then((result) => {
			res.status(200).json({message: "drug Update Successfully.", result});
		}).catch(err => {
			if (err.path === '_id') res.status(500).json({message: "drug _id not found!", result: null});
			else res.status(500).json(err.message)
		})
	} catch (err) {
		res.status(500).json(err.message)
	}
};
exports.delete = async (req, res) => {
	try {
		// const product = DrugInfo.findOne({_id: req.body._id})
		DrugInfo.findByIdAndDelete(req.body._id).then(result => {
			// console.log(product)
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
			const ws = wb.Sheets['Sheet1'];
			const jsonData = excel.utils.sheet_to_json(ws);
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
		let search = {};
		for (const item of Object.keys(filter)) {
			let regex = new RegExp(filter[item], 'i');
			if (filter[item]) search[item] = regex
		}

		DrugInfo.find(search).then(drugs => {
			let drugsList = [];
			for (let drug of drugs) {
				drug = drug.toObject();
				delete drug._id;
				delete drug.__v;
				drugsList.push(drug)
			}
			let model = mongoExcel.buildDynamicModel(drugsList);
			/* Generate Excel */
			const options = {
				fileName: "drugs.xlsx",
				path: "temp"
			};
			mongoExcel.mongoData2Xlsx(drugsList, model, options, function (err, data) {
				res.download('temp/' + data.fileName, data.fileName);
			});
		}).catch(err => {
			res.status(401).json(err.message)
		})
	} catch (err) {
		res.status(500).json(err.message)
	}
};
exports.search = async (req, res) => {
	try {
		let {q, limit} = query.parse(req.url, true).query;
		if (!limit || limit > 50) limit = 50
		let regex = new RegExp(q, 'i');
		DrugInfo.find({
			$or: [{enName: regex}, {faName: regex}]
		}, {_id: 1, enName: 1, enRoute: 1, enForm: 1, volume: 1, strength: 1}).limit(parseInt(limit)).then(result => {
			// console.log(result)
			res.status(200).json({count: result.length, data: result})
		})
	} catch (err) {
		res.status(500).json(err.message)
	}
}


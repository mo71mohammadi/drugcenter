const express = require("express");
const router = express.Router();
const Generic = require("../../models/archive/generic");
const xlsx = require('xlsx');
const mongoXlsx = require('mongo-xlsx');

router.get("/test", async (req, res) => {
	res.status(200).json({count: "count"})
})

// Getting By Page
router.post("/generics/getAll", async (req, res) => {
	try {
		let page;
		let size;
		if (req.body.page < 0) page = 0;
		else if (!req.body.page) page = 0;
		else page = req.body.page;
		if (req.body.size < 1) size = 1;
		else if (!req.body.size) size = 1;
		else size = req.body.size;
		const filter = req.body;
		delete filter.page;
		delete filter.size;
		let search = {};
		for (let item in filter) {
			if (item === 'group') search['group'] = req.body.group;
			if (!req.body.group) req.body.group = 'drug';

			if (filter[item]) {
				if (item !== 'group') search[req.body.group + '.' + item] = req.body[item]
			}
		}
		Generic.find(search).skip(size * page).limit(size).then(async generics => {
			const count = await Generic.countDocuments(search);
			const genericsList = [];
			for (let generic in generics) {
				let obj = generics[generic].drug.toObject();
				obj['_id'] = generics[generic]['_id'];
				genericsList.push(obj)
			}

			res.status(200).json({count: count, data: genericsList})
		});
	} catch (err) {
		res.status(500).json({massage: err.message})
	}
});

// Creating Generic
router.post('/generics/create', async (req, res) => {
	try {
		let search;
		let groups = ['drug'];
		if (req.body.group === 'drug') {
			search = {group: 'drug', 'drug.genericCode': req.body.genericCode};
		}
		Generic.findOne(search).then(response => {
			if (!response && groups.includes(req.body.group)) {
				const generic = new Generic();
				generic.group = req.body.group;
				generic[req.body.group] = req.body;
				generic.save().then(async newGeneric => {
					res.status(201).json(newGeneric)
				});
			} else if (!groups.includes(req.body.group)) {
				res.status(201).json({message: "Group Not Found!"})
			} else if (response) {
				res.status(201).json({message: "Generic exist!"})
			}
		});
	} catch (err) {
		res.status(500).json({massage: err.message})
	}
});

// Update Generic
router.post('/generics/update', async (req, res) => {
	try {
		let search;
		let groups = ['drug'];
		if (req.body.group === 'drug') {
			search = {group: 'drug', 'drug.genericCode': req.body.genericCode};
		}
		console.log(search);
		Generic.findOne({'drug.genericCode': req.body.data.genericCode}).then(result => {
			if (!result) {
				Generic.findOne(search).then(response => {
					console.log(response);
					if (response && groups.includes(req.body.data.group)) {
						response[req.body.data.group] = req.body.data;
						response.save().then(res.json('Update Successfully'));

					} else {
						let msgList = [];
						if (!groups.includes(req.body.data.group)) {
							msgList.push("Group Not Found!");
						}
						if (!response) {
							msgList.push("Generic Not Found!");
						}
						res.json({err: msgList})
					}
				});

			} else res.json('genericCode exist!')
		});
	} catch (err) {
		res.status(500).json({massage: err.message})
	}

});

// Deleting One
router.post('/generics/delete', async (req, res) => {
	try {
		if (req.body.delete === 'all') {
			Generic.deleteMany().then(
				res.json({message: "Generics Delete Successfully"})
			)
		} else {
			Generic.findById(req.body.id).then(async generic => {
				await generic.remove();
				res.json({message: "Generic Delete Successfully"})
			});
		}
	} catch (err) {
		res.status(500).json({massage: err.message})
	}
});

// Import Xlsx
router.post('/generics/import', async (req, res) => {
	try {
		if (req.files) {
			const wb = xlsx.read(req.files.generics.data, {cellDates: true});
			const ws = wb.Sheets['Sheet1'];
			const jsonData = xlsx.utils.sheet_to_json(ws);
			let objList = [];
			for (const item of jsonData) {
				let objects = {};
				for (let val in item) {
					if (item[val] === 'null') {
						item[val] = null
					}
				}
				let atc = {};
				let DDD = {};
				let uses = {};
				let pharmacology = {};
				let medScape = {};
				let upToDate = {};
				atc.enL1 = item['atc.enL1'];
				delete item['atc.enL1'];
				atc.enL2 = item['atc.enL2'];
				delete item['atc.enL2'];
				atc.enL3 = item['atc.enL3'];
				delete item['atc.enL3'];
				atc.enL4 = item['atc.enL4'];
				delete item['atc.enL4'];
				atc.enL5 = item['atc.enL5'];
				delete item['atc.enL5'];
				atc.faL1 = item['atc.faL1'];
				delete item['atc.faL1'];
				atc.faL2 = item['atc.faL2'];
				delete item['atc.faL2'];
				atc.faL3 = item['atc.faL3'];
				delete item['atc.faL3'];
				atc.faL4 = item['atc.faL4'];
				delete item['atc.faL4'];
				atc.faL5 = item['atc.faL5'];
				delete item['atc.faL5'];
				DDD.admRoute = item['DDD.admRoute'];
				delete item['DDD.admRoute'];
				DDD.dose = item['DDD.dose'];
				delete item['DDD.dose'];
				DDD.unit = item['DDD.unit'];
				delete item['DDD.unit'];
				uses.adult = item['uses.adult'];
				delete item['uses.adult'];
				uses.pediatric = item['uses.pediatric'];
				delete item['uses.pediatric'];
				uses.geriatric = item['uses.geriatric'];
				delete item['uses.geriatric'];
				pharmacology.mechanism = item['pharmacology.mechanism'];
				delete item['pharmacology.mechanism'];
				pharmacology.Pharmacokinetics = item['pharmacology.pharmacokinetics'];
				delete item['pharmacology.pharmacokinetics'];
				medScape.id = item['medScape.id'];
				delete item['medScape.id'];
				medScape.name = item['medScape.name'];
				delete item['medScape.name'];
				upToDate.id = item['upToDate.id'];
				delete item['upToDate.id'];
				upToDate.name = item['upToDate.name'];
				delete item['upToDate.name'];
				upToDate.golobal = item['upToDate.golobal'];
				delete item['upToDate.golobal'];
				atc.DDD = DDD;
				item.atc = atc;
				item.uses = uses;
				item.pharmacology = pharmacology;
				item.medScape = medScape;
				item.upToDate = upToDate;
				// objects.group = req.body.group;
				objects.group = 'drug';
				objects[req.body.group] = item;
				await Generic.findOne({"drug.genericCode": objects.drug.genericCode}).then(async result => {
					if (!result) {
						await Generic.insertMany(objects)
					}
				});
				// objList.push(objects)

			}
			// Generic.insertMany(objList).then(result => {
			res.json("jsonData")
			// }).catch(err => {
			//     res.status(500).json({Error: err.message})
			// })

		} else {
			res.status(401).json({message: "File Not Found!"})
		}
	} catch (err) {
		res.status(500).json({message: err.message})
	}
});

router.post('/generics/export', async (req, res) => {
	try {
		const filter = req.body;
		delete filter.page;
		delete filter.size;
		let search = {};
		for (let item in filter) {
			if (item === 'group') search['group'] = req.body.group;
			if (!req.body.group) req.body.group = 'drug';
			if (item !== 'group') search[req.body.group + '.' + item] = req.body[item]
		}

		Generic.find(search).then(generics => {
			let dataList = [];
			for (let generic in generics) dataList.push(generics[generic]['drug'].toObject());
			let model = mongoXlsx.buildDynamicModel(dataList);
			/* Generate Excel */
			const options = {
				fileName: "generics.xlsx",
				path: "temp"
			};
			mongoXlsx.mongoData2Xlsx(dataList, model, options, function (err, data) {
				// res.json({'File saved at:': data.fullPath})
				res.download('temp/' + data.fileName, data.fileName);
			});
		}).catch(err => {
			res.json({message: err.massage})
		});
	} catch (err) {
		res.json({message: err.massage})
	}
});

// Updating One
// router.post('/generics/updateDrug', getGeneric, async (req, res) => {
//     const messages = {};
//     for (let item in req.body) {
//         if (item !== "molecule" && item !== "id") {
//             res.generic.drug[item] = req.body[item];
//             messages[item] = "Update Successfully"
//         }
//     }
//     let molecules = req.body.molecule;
//     const molLen = molecules.length;
//     let forLen = 0;
//     messages["molecule"] = {};
//     const molList = res.generic.drug.molecule.toObject();
//     for (let molecule in molecules) {
//         Generic.findOne({
//             $or: [
//                 {"drug.molecule.name": molecules[molecule]["name"]},
//                 {"drug.molecule.casNum": molecules[molecule]["casNum"]}
//             ]
//         }).then(async response => {
//             if (molecules[molecule]["action"] === "delete") {
//                 for (let mol in molList) {
//                     if (molList[mol]["_id"] === molecules[molecule].id) {
//                         res.generic.drug.molecule.pull(molecules[molecule].id);
//                         messages["molecule"][molecule] = "delete Successfully"
//                     } else {
//                         messages["molecule"][molecule] = "molecule id not exist"
//                     }
//                 }
//             } else if (molecules[molecule]["action"] === "add") {
//                 if (response == null) {
//                     res.generic.drug.molecule.push(molecules[molecule]);
//                     messages["molecule"][molecule] = "add Successfully"
//                 } else {
//                     messages["molecule"][molecule] = "name " + molecules[molecule]["name"] + " or casNum " + molecules[molecule]["casNum"] + " is exist"
//                 }
//             } else if (molecules[molecule]["action"] === "update") {
//                 for (let mol in molList) {
//                     if (molList[mol]["_id"] == molecules[molecule].id) {
//                         for (let item in molecules[molecule]) {
//                             res.generic.drug.molecule[mol][item] = molecules[molecule][item];
//                             messages["molecule"][molecule] = "update Successfully"
//                         }
//                     } else {
//                         messages["molecule"][molecule] = "molecule id not exist"
//                     }
//                 }
//             }
//             try {
//                 forLen++;
//                 if (forLen === molLen) {
//                     const mssg = [];
//                     mssg.push(messages);
//                     res.generic.save().then(async (response) => {
//                         mssg.push(response);
//                         res.json(mssg)
//                     });
//                 }
//             } catch (err) {
//                 res.status(500).json({massage: err.message})
//             }
//         });
//     }
// });

// async function getGeneric(req, res, next) {
//     let generic;
//     try {
//         generic = await Generic.findById(req.body.id);
//         // console.log(generic);
//         if (generic == null) {
//             return res.status(404).json({message: 'cannot find generic!'})
//         }
//     } catch (err) {
//         return res.status(500).json({message: err.message})
//     }
//     res.generic = generic;
//     next()
// }


module.exports = router;
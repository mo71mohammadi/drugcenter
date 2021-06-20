const mongoExcel = require('mongo-xlsx')
const fs = require('fs')
const Generic = require("../models/generics")
const helpers = require('../helpers');
const path = require('path');
const excel = require('xlsx')


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
            const wb = excel.read(req.files.generic.data, {cellDates: true});
            const ws = wb.Sheets['generic'];
            const jsonData = excel.utils.sheet_to_json(ws);
            console.log(jsonData.length);
            let success = 0;
            let repeat = 0;
            const successList = [];
            const repeatList = [];
            for (const obj of jsonData) {
                console.log(obj.genericCode)
                obj.genericCode = obj.genericCode.toString().trim();
                obj.eRx = obj.eRx.toString().trim();
                obj.atc = [{code: obj.atc.trim()}];
                obj.category = obj.category.trim();
                obj.molecule = obj.molecule.trim().split('/');
                // obj.edl = obj.edl.trim();
                // obj.active = obj.gtn.toString().trim().split('\n');
                obj.enName = obj.enName.trim();
                obj.faName = obj.faName.trim();
                obj.strength = obj.strength.toString().trim();
                obj.enForm = obj.enForm.trim();
                obj.faForm = obj.faForm.trim();
                obj.enRoute = obj.enRoute.trim();
                obj.faRoute = obj.faRoute.trim();
                obj.temperature = obj.temperature.trim();
                obj.referenceId = obj.referenceId.toString().trim();
                obj.medScapeId = obj.medScapeId.toString().trim();
                obj.upToDateId = obj.upToDateId.toString().trim();
                obj.delete = false;
                obj.update = [{date: `${new Date().toISOString()}`}]

                await Generic.create(obj).then(() => {
                    success++;
                    successList.push(obj.genericCode)
                }).catch(err => {
                    repeat++;
                    repeatList.push(obj.genericCode);
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
        Generic.find(search).skip(size * page).limit(size).then(async generics => {
            const count = await Generic.countDocuments(search);
            res.status(200).json({count, data: generics})
        }).catch(err => {
            res.status(401).json(err.message)
        });
    } catch (err) {
        res.status(500).json(err.message)
    }
};
exports.getOne = async (req, res) => {
    try {
        Generic.findById(req.body._id).then(generic => {
            res.status(200).json(generic)
        })
    } catch (err) {
        res.status(500).json(err.message)
    }
};
exports.create = async (req, res) => {
    try {
        const filter = req.body;
        filter.update = [{date: new Date().toISOString()}]
        Generic.create(filter).then(result => {
            res.status(200).json({message: "generic insert Successfully.", result})
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
        filter.update = [...filter.update, {date: new Date().toISOString()}]
        Generic.updateOne({_id: filter._id}, filter).then((result) => {
            res.status(200).json({message: "generic Update Successfully.", result});
        }).catch(err => {
            if (err.path === '_id') res.status(500).json({message: "generic _id not found!", result: null});
            else res.status(500).json(err.message)
        })
    } catch (err) {
        res.status(500).json(err.message)
    }
};
exports.delete = async (req, res) => {
    try {
        // const product = Generic.findOne({_id: req.body._id})
        Generic.findByIdAndDelete(req.body._id).then(result => {
            if (result) res.status(200).json("Deleted Successfully");
            else res.status(401).json("_id Not Found!")
        })
    } catch (err) {
        res.status(500).json(err.message)
    }
};
exports.delete = async (req, res) => {
    try {
        Generic.deleteMany({}).then(result => {
            res.status(200).json("Deleted All Successfully")
        }).catch(err => {
            res.status(401).json("ERROR!" + err.message)
        })
        // const product = Generic.findOne({_id: req.body._id})
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

        Generic.find(search).then(generics => {
            let genericList = [];
            for (let generic of generics) {
                generic = generic.toObject();
                delete generic._id;
                delete generic.__v;
                genericList.push(generic)
            }
            let model = mongoExcel.buildDynamicModel(genericList);
            /* Generate Excel */
            const options = {
                fileName: "generics.xlsx",
                path: "temp"
            };
            mongoExcel.mongoData2Xlsx(genericList, model, options, function (err, data) {
                res.download('temp/' + data.fileName, data.fileName);
            });
        }).catch(err => {
            res.status(401).json(err.message)
        })
    } catch (err) {
        res.status(500).json(err.message)
    }
};

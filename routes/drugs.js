const Drug = require("../models/drugs");
const UpToDate = require("../models/upToDate");
const MedScape = require("../models/medScape");
const query = require('url');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');
const mongoXlsx = require('mongo-xlsx');
let {PythonShell} = require('python-shell');

// const Pagination = item => {
//     const params = query.parse(item, true).query;
//     let page;
//     let size;
//     if (params.page < 0 || !params.page) page = 0;
//     else page = parseInt(params.page);
//     if (params.size < 1 || !params.size) size = 1;
//     else size = parseInt(params.size);
//     return {size, page}
// };
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
        // let page;
        // let size;
        // if (req.body.page < 1 || !req.body.page) page = 0;
        // else page = req.body.page - 1;
        // if (req.body.size < 1 || !req.body.size) size = 1;
        // else size = req.body.size;
        const {size, page} = Pagination(req.body);
        const filter = req.body;
        delete filter.page;
        delete filter.size;
        let search = {};
        for (let item in filter) {
            if (filter[item]) search[item] = filter[item]
        }
        Drug.find(search).skip(size * page).limit(size).sort({_id: -1}).then(async products => {
            const count = await Drug.countDocuments(search);
            const productList = [];
            for (const product of products) {
                delete product.upToDateId;
                delete product.medScapeId;
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
exports.create = async (req, res) => {
    // const params = query.parse(req.url, true).query;
    // const {
    //     eRx, packageCode, genericCode, enBrandName, faBrandName, atcCode, ddd, atc, gtn, irc, sPrice, cPrice, dPrice,
    //     nativeIRC, licenseOwner, brandOwner, countryBrandOwner, countryProducer, producer, trader, conversationalName,
    //     enName, faName, strength, measure, volume, dose, enForm, faForm, enRoute, faRoute, medScapeId, upToDateId
    // } = req.body;
    try {
        const record = await Drug.findOne({enName: req.body.enName, enRoute: req.body.enRoute});
        if (record) {
            req.body.atc = record.atc;
            req.body.medScapeId = record.medScapeId;
            req.body.upToDateId = record.upToDateId
        }
        Drug.create(req.body).then(result => {
            if (result.upToDateId) {
                UpToDate.updateOne({globalId: result.upToDateId}, {
                    $push: {
                        eRx: result.eRx + result.packageCode,
                        gtn: {$each: result.gtn},
                        irc: {$each: result.irc}
                    }
                })
            }
            if (result.medScapeId) {
                MedScape.updateOne({drugId: result.medScapeId}, {
                    $addToSet: {
                        eRx: result.eRx + result.packageCode,
                        gtn: {$each: result.gtn},
                        irc: {$each: result.irc}
                    }
                })
            }
            res.status(200).json(result)
        }).catch(err => {
            res.status(500).json(err.message)
        })
    } catch (err) {
        res.status(500).json(err.message)
    }
};
exports.delete = async (req, res) => {
    try {
        Drug.findByIdAndDelete(req.body._id).then(result => {
            if (result) res.status(200).json("Deleted Successfully");
            else res.status(401).json("_id Not Found!")
        })
    } catch (err) {
        res.status(500).json(err.message)
    }
};
exports.update = async (req, res) => {
    try {
        // const filter = req.body;
        // let search = {};
        // Object.keys(req.body).forEach(item => {
        //     console.log(req.body[item])
        // });
        // for (let item in req.body) {
        //     if (req.body[item]) search[item] = req.body[item]
        // }
        delete req.body.upToDateId;
        delete req.body.medScapeId;
        delete req.body.atcCode;
        const _id = req.body._id;
        if (!_id) return res.status(401).json("Product _id not found!");
        delete req.body._id;
        Drug.updateOne({_id: _id}, req.body).then(() => {
            res.status(200).json("drug Update Successfully!");
        }).catch(err => {
            if (err.path === '_id') res.status(500).json("Product _id not found!");
            else res.status(500).json(err.message)

        })
    } catch (err) {
        res.status(500).json(err.message)

    }
};
exports.html = async (req, res) => {
    try {
        res.sendFile(path.resolve('index.html'))
    } catch (err) {
        res.status(500).json(err.message)
    }
};
exports.import = async (req, res) => {
    try {
        req.connection.setTimeout(1000 * 60 * 10);
        if (req.files) {
            const wb = xlsx.read(req.files.drugs.data, {cellDates: true});
            const ws = wb.Sheets['Sheet2'];
            const jsonData = xlsx.utils.sheet_to_json(ws);
            console.log(jsonData.length);
            const packObj = {1: "A", 2: "B", 3: "C", 4: "D", 5: "E", 6: "F", 7: "G", 8: "H"};
            const eRxList = [];
            let success = 0;
            let repeat = 0;
            const successList = [];
            const repeatList = [];
            for (const obj of jsonData) {
                eRxList.push(obj.eRx.slice(0, 9));
                let count = 0;
                eRxList.map(e => {
                    if (e === obj.eRx.slice(0, 9)) count++
                });
                obj.eRx = obj.eRx.slice(0, 9);
                obj.packageCode = packObj[count];
                // obj.packageCount = obj.packageCount;
                obj.packageType = obj.packageType.trim();
                // obj.genericCode = obj.genericCode.trim();
                obj.enBrandName = obj.enBrandName.trim();
                obj.faBrandName = obj.faBrandName.trim();
                obj.atc = [{
                    code: obj.atc.trim()
                }];
                obj.category = obj.category.trim();
                // obj.ddd = obj.ddd.trim();
                // obj.edl = obj.edl.trim();
                obj.gtn = [obj.gtn.trim()];
                obj.irc = [obj.irc.trim()];
                obj.nativeIRC = obj.nativeIRC.toString().trim();
                obj.licenseOwner = obj.licenseOwner.trim();
                obj.brandOwner = obj.brandOwner.trim();
                obj.countryBrandOwner = obj.countryBrandOwner.trim();
                obj.countryProducer = obj.countryProducer.trim();
                obj.producer = obj.producer.trim();
                obj.conversationalName = [obj.conversationalName.trim()];
                obj.enName = obj.enName.trim();
                obj.faName = obj.faName.trim();
                obj.strength = obj.strength.trim();
                // obj.volume = obj.volume.trim();
                obj.enForm = obj.enForm.trim();
                obj.faForm = obj.faForm.trim();
                obj.enRoute = obj.enRoute.trim();
                obj.faRoute = obj.faRoute.trim();
                obj.medScapeId = obj.medScapeId.toString().trim();
                obj.upToDateId = obj.upToDateId.toString().trim();
                await Drug.create(obj).then(result => {
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
        res.status(500).json({message: err.message})
    }
};
exports.export = async (req, res) => {
    try {
        const filter = req.body;
        delete filter.page;
        delete filter.size;
        // delete filter.responseType;
        Drug.find(filter).then(drugs => {
            let dataList = [];
            for (let drug of drugs) {
                drug = drug.toObject();
                delete drug._id;
                delete drug.__v;
                dataList.push(drug)
            }
            let model = mongoXlsx.buildDynamicModel(dataList);
            /* Generate Excel */
            const options = {
                fileName: "drugs.xlsx",
                path: "temp"
            };
            mongoXlsx.mongoData2Xlsx(dataList, model, options, function (err, data) {
                // res.json({'File saved at:': data.fullPath})
                res.download('temp/' + data.fileName, data.fileName);
            });
            // res.json({data: dataList})

        }).catch(err => {
            res.json({message: err.massage})
        });
    } catch (err) {
        res.json({message: err.massage})
    }

};
exports.getInfo = async (req, res) => {
    try {
        const params = query.parse(req.url, true).query;
        let search;
        if (params['eRx']) search = {eRx: {$in: params.eRx.split(',')}};
        else if (params['generic']) search = {genericCode: {$in: params.generic}};
        else if (params['gtn']) search = {gtn: {$in: params.gtn.split(',')}};
        else if (params['irc']) search = {irc: {$in: params.irc}};
        else return res.status(500).json({massage: "parameter not found"});

        Drug.findOne(search).then(result => {
            let response = {};
            response["eRx"] = result.eRx;
            response['genericCode'] = result.genericCode;
            response['enGenericName'] = `${result.enName} ${result.strength} ${result.enRoute} ${result.enForm}`;
            response['faGenericName'] = `${result.faName} ${result.strength} ${result.faForm} ${result.faRoute}`;
            response['ATC Code'] = result.atc[0].code;
            if (params.type === "1") {
                response["enProductName"] = `${result.enName} ${result.enBrandName} ${result.strength} ${result.enRoute} ${result.enForm}`;
                response["faProductName"] = `${result.faForm} ${result.faRoute} ${result.strength} ${result.faBrandName} ${result.faName}`
            }
            if (params.type === "2") {
                response["enProductName"] = `${result.enBrandName} ${result.enName} ${result.strength} ${result.enRoute} ${result.enForm}`;
                response["faProductName"] = `${result.faForm} ${result.faRoute} ${result.strength} ${result.faName} ${result.faBrandName}`

            }
            if (params.type === "3") {
                response["enProductName"] = `${result.enName} ${result.strength} ${result.enRoute} ${result.enForm} [${result.enBrandName}]`;
                response["faProductName"] = `${result.faName} ${result.strength} ${result.faForm} ${result.faRoute} ${result.faBrandName}`

            }
            if (params.type === "4") {
                response["enProductName"] = `${result.enName} ${result.strength} ${result.enRoute} ${result.enForm} [${result.enBrandName}] ${result.brandOwner}`;
                response["faProductName"] = `${result.faName} ${result.strength} ${result.faForm} ${result.faRoute} ${result.faBrandName} ${result.brandOwner}`
            }
            if (params.type === "5") {
                response["enProductName"] = `${result.enBrandName} ${result.strength} ${result.enRoute} ${result.enForm}`;
                response["faProductName"] = `${result.faBrandName} ${result.strength} ${result.faForm} ${result.faRoute}`
            }
            response['gtn'] = result.gtn[0];
            response['irc'] = result.irc[0];
            response['producer'] = result.producer;
            response['brandOwner'] = result.brandOwner;
            // response['countryProducer'] = result.countryProducer;


            res.status(200).json(response)
        })
    } catch (err) {
        res.status(500).json(err.message)
    }
};

exports.interaction = async (req, res) => {
    try {
        const {size, page} = Pagination(req.body);
        Drug.aggregate([{
            "$group": {
                "_id": {
                    enName: "$enName",
                    enRoute: "$enRoute",
                    upToDateId: "$upToDateId",
                    medScapeId: "$medScapeId"
                }
            }
        }, {$sort: {"_id.enName": 1}}]).then(results => {
            const objs = [];
            for (const result of results) {
                objs.push(result._id)
            }
            res.status(200).json({count: objs.length, data: objs.slice(page * size, (page * size) + size)})
        });
    } catch (err) {
        res.status(500).json(err.message)
    }
};
exports.updateInteraction = async (req, res) => {
    try {
        if (!req.body.enName || !req.body.enRoute) return res.status(500).json("enName or enRoute Not Found!");
        Drug.updateMany({
            enName: req.body.enName,
            enRoute: req.body.enRoute
        }, {$set: {upToDateId: req.body.upToDateId, medScapeId: req.body.medScapeId}}).then(() => {
            Drug.find({enName: req.body.enName, enRoute: req.body.enRoute}).then(results => {
                results.forEach(result => {
                    UpToDate.updateOne({eRx: {$in: result.eRx + result.packageCode}}, {
                        $pull: {
                            eRx: result.eRx + result.packageCode,
                            gtn: {$in: result.gtn},
                            irc: {$in: result.irc}
                        }
                    }).then(() => {
                        if (result.upToDateId) {
                            UpToDate.updateOne({globalId: result.upToDateId}, {
                                $push: {
                                    eRx: result.eRx + result.packageCode,
                                    gtn: {$each: result.gtn},
                                    irc: {$each: result.irc}
                                }
                            }).then(() => {
                                MedScape.updateOne({eRx: {$in: result.eRx + result.packageCode}}, {
                                    $pull: {
                                        eRx: result.eRx,
                                        gtn: {$in: result.gtn},
                                        irc: {$in: result.irc}
                                    }
                                }).then(() => {
                                    if (result.medScapeId) {
                                        MedScape.updateOne({drugId: result.medScapeId}, {
                                            $addToSet: {
                                                eRx: result.eRx + result.packageCode,
                                                gtn: {$each: result.gtn},
                                                irc: {$each: result.irc}
                                            }
                                        })
                                    }
                                });
                            })
                        }
                    });
                });
                return res.status(200).json('Successfully')
            });
        })
    } catch (err) {
        res.status(500).json(err.message)
    }
};

exports.atc = async (req, res) => {
    try {
        const {size, page} = Pagination(req.body);
        let match;
        if (req.body.type === 'null') match = {$match: {"atc.code": {$exists: false}}};
        else match = {$match: {}};

        Drug.aggregate([match, {
            $unwind: {
                path: "$atc",
                preserveNullAndEmptyArrays: true
            }
        },
            {
                $group: {
                    "_id": {
                        enName: "$enName",
                        enRoute: "$enRoute",
                    }, atc: {$addToSet: {code: "$atc.code", ddd: "$atc.ddd"}}

                }
            }, {$sort: {"_id.enName": 1}}
        ]).then(async results => {
            const objs = [];
            for (let result of results) {
                objs.push({...result._id, atc: result.atc})
            }
            res.status(200).json({count: objs.length, data: objs.slice(page * size, (page * size) + size)})
        });
    } catch (err) {
        res.status(500).json(err.message)
    }
};
exports.updateATC = async (req, res) => {
    try {
        let search = {};
        let action = {};
        if (!req.body.enName || !req.body.enRoute || !req.body.atc || !req.body.action) return res.status(500).json("enName or enRoute Not Found!");
        if (req.body.action === 'delete') action = {$pull: {atc: req.body.atc}};
        else if (req.body.action === 'add') {
            search = {'atc.code': {$ne: req.body.atc.code}};
            action = {$push: {atc: req.body.atc}}
        }
        Drug.updateMany({
            enName: req.body.enName,
            enRoute: req.body.enRoute,
            ...search
        }, action).then(result => {
            res.json(result)
        })
    } catch (err) {
        res.status(500).json(err.message)
    }
};

exports.price = async (req, res) => {
    try {
        const {size, page} = Pagination(req.body);
        let rawData = fs.readFileSync('data.json');
        let data = JSON.parse(rawData);
        res.status(200).json({count: data.length, data: data.slice(page * size, (page * size) + size)})
    } catch (err) {
        res.status(500).json(err.message)
    }
};
exports.getPrice = async (req, res) => {
    try {
        let options = {
            // pythonPath: '/home/mojtaba/PycharmProjects/metraj/venv/bin/python3',
            // scriptPath: '/home/mojtaba/WebstormProjects/api/routes/',
        };
        let test = new PythonShell('./routes/script.py', options);
        test.on('message', message => {
            res.status(200).json(message)
        });
    } catch (err) {
        res.status(500).json(err.message)
    }
};
exports.updatePrice = async (req, res) => {
    try {
        let rawData = fs.readFileSync('data.json');
        let data = JSON.parse(rawData);
        data.forEach(obj => {
            if (obj.cPrice || obj.cPrice || obj.dPrice) {
                Drug.findOne({irc: {$in: obj.irc}}).then(result => {
                    if (result) {
                        if (result.sPrice !== obj.sPrice || result.cPrice !== obj.cPrice || result.dPrice !== obj.dPrice) {
                            Drug.updateOne({irc: {$in: obj.irc}}, {
                                sPrice: obj.sPrice,
                                cPrice: obj.cPrice,
                                dPrice: obj.dPrice
                            }).then(result => {
                                console.log(result)
                            })
                        }
                    }
                    // else {
                    //     fs.appendFile('message.txt', obj.irc + '\n', function (err) {
                    //         count1 ++;
                    //         console.log('Not Found........', count1);
                    //     });
                    // }
                })
            }
        });
        res.status(200).json('f')

    } catch (err) {
        res.status(500).json(err.message)
    }
};

exports.distinct = async (req, res) => {
    try {
        const {size, page} = Pagination(req.body);
        const {item} = query.parse(req.url, true).query;
        const group = {_id: {items: "$" + item.trim()}};
        Drug.aggregate([{$group: group}]).then(async results => {
            const objs = [];
            for (let result of results) {
                objs.push(result._id.items)
            }
            res.status(200).json({count: objs.length, data: objs})
        });
    } catch (err) {
        res.status(500).json(err.message)
    }
};
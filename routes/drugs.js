const Drug = require("../models/drugs");
const UpToDate = require("../models/upToDate");
const MedScape = require("../models/medScape");
const query = require('url');
const xlsx = require('xlsx');
const fs = require('fs');
let {PythonShell} = require('python-shell');


exports.add = async (req, res) => {
    const params = query.parse(req.url, true).query;
    const {
        eRx, packageCode, genericCode, enBrandName, faBrandName, atcCode, ddd, atc, gtn, irc, sPrice, cPrice, dPrice,
        nativeIRC, licenseOwner, brandOwner, countryBrandOwner, countryProducer, producer, trader, conversationalName,
        enName, faName, strength, measure, volume, dose, enForm, faForm, enRoute, faRoute, medScapeId, upToDateId
    } = req.body;

};
exports.getAll = async (req, res) => {
    try {
        let page;
        let size;
        if (req.body.page < 0 || !req.body.page) page = 0;
        else page = req.body.page;
        if (req.body.size < 1 || !req.body.size) size = 1;
        else size = req.body.size;
        const filter = req.body;
        delete filter.page;
        delete filter.size;
        let search = {};
        for (let item in filter) {
            if (filter[item]) search[item] = filter[item]
        }
        Drug.find(search).skip(size * page).limit(size).sort({_id: -1}).then(async products => {
            const count = await Drug.countDocuments(search);

            res.status(200).json({count, data: products})
        }).catch(err => {
            res.status(401).json(err.message)
        });

    } catch (err) {
        res.status(500).json(err.message)
    }
};
exports.update = async (req, res) => {
    try {
        const filter = req.body;
        let search = {};
        for (let item in req.body) {
            if (filter[item]) search[item] = filter[item]
        }
        if ("upToDateId" in search) {
            Drug.updateMany({
                enName: search.enName,
                enRoute: search.enRoute
            }, {$set: {upToDateId: search.upToDateId}}).then(results => {
                console.log(results)
            })
            // UpToDate.updateOne({eRx: {$in: search.eRx}}, {$pull: {eRx: search.eRx, gtn: {$each: search.gtn}, irc:{$each: search.irc}}});
            // UpToDate.updateOne({globalId: search.upToDateId}, {$addToSet: {eRx: search.eRx ,gtn: {$each: search.gtn}, irc:{$each: search.irc}}})
        }
        if ("medScapeId" in search) {
            MedScape.updateOne({eRx: {$in: search.eRx}}, {
                $pull: {
                    eRx: search.eRx,
                    gtn: {$each: search.gtn},
                    irc: {$each: search.irc}
                }
            });
            MedScape.updateOne({globalId: search.upToDateId}, {
                $addToSet: {
                    eRx: search.eRx,
                    gtn: {$each: search.gtn},
                    irc: {$each: search.irc}
                }
            })
        }
        Drug.updateOne()
    } catch (err) {

    }
};
exports.import = async (req, res) => {
    try {
        if (req.files) {
            console.log('sa')
            const wb = xlsx.read(req.files.products.data, {cellDates: true});
            const ws = wb.Sheets['Sheet1'];
            const jsonData = xlsx.utils.sheet_to_json(ws);
            console.log(jsonData.length);
            // let success = 0;
            // let successList = [];
            // let repeat = 0;
            // let repeatList = [];
            // let update = 0;
            // let updateList = [];
            // for (let item in jsonData) {
            //     let generic;
            //     if (jsonData[item].generic) {
            //         generic = jsonData[item].generic;
            //         delete jsonData[item].generic
            //     }
            //     let gtn;
            //     if (jsonData[item].gtn) {
            //         gtn = {gtn: jsonData[item].gtn};
            //         delete jsonData[item].gtn
            //     } else gtn = {};
            //     let irc;
            //     if (jsonData[item].irc) {
            //         irc = {
            //             number: jsonData[item].irc,
            //             // ValidityDate: jsonData[item].ValidityDate
            //         };
            //         delete jsonData[item].irc
            //     } else irc = {};
            //     await Product.findOne({
            //         "data.packageCode": jsonData[item].packageCode,
            //         "data.eRx": jsonData[item].eRx
            //     }).then(async product => {
            //
            //         await Generic.findOne({'drug.genericCode': generic}).then(async result => {
            //             // console.log(result._id);
            //             if (!product) {
            //                 await Product.create({
            //                     data: jsonData[item],
            //                     'data.generic': result,
            //                     'data.gtn': gtn,
            //                     'data.irc': irc
            //                 }).then(newProduct => {
            //                     success++;
            //                     successList.push(jsonData[item].eRx);
            //                 });
            //             } else {
            //                 let duplicate = jsonData.filter(function (value) {
            //                     return value.eRx === jsonData[item].eRx && value.packageCode === jsonData[item].packageCode
            //                 });
            //                 if (duplicate.length > 1) {
            //                     repeat++;
            //                     repeatList.push(jsonData[item].eRx)
            //                 } else {
            //                     update++;
            //                     updateList.push(jsonData[item].eRx)
            //                 }
            //             }
            //
            //         })
            //     });
            // }
            // res.json({
            //     success: {0: `${success} item import successfully`, 1: successList},
            //     update: {0: `${update} item update successfully`, 1: updateList},
            //     repeat: {0: `${repeat} item duplicate`, 1: repeatList},
            // })
        } else res.json({message: 'File Not Found!'})
    } catch (err) {
        res.status(500).json({message: err.message})
    }

};
exports.export = async (req, res) => {
};
exports.getInfo = async (req, res) => {
    try {
        const params = query.parse(req.url, true).query;
        let search;
        if ("eRx" in params) search = {eRx: {$in: params.eRx.split(',')}};
        else if ("generic" in params) search = {genericCode: {$in: params.generic}};
        else if ("gtn" in params) search = {gtn: {$in: params.gtn.split(',')}};
        else if ("irc" in params) search = {irc: {$in: params.irc}};
        else return res.status(500).json({massage: "parameter not found"});
        Drug.findOne(search).then(result => {
            res.status(200).json(result)
        })
    } catch (err) {
        res.status(500).json(err.message)
    }
};


exports.interaction = async (req, res) => {
    try {
        const params = query.parse(req.url, true).query;
        let page;
        let size;
        if (params.page < 0 || !params.page) page = 0;
        else page = parseInt(params.page);
        if (params.size < 1 || !params.size) size = 1;
        else size = parseInt(params.size);

        Drug.aggregate([{
            "$group": {
                "_id": {
                    enName: "$enName",
                    enRoute: "$enRoute",
                    upToDateId: "$upToDateId",
                    medScapeId: "$medScapeId"
                }
            }
        }]).skip(size * page).limit(size).then(results => {
            const objs = [];
            for (let result in results) {
                objs.push(results[result]._id)
            }
            res.status(200).json(objs)
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

exports.price = async (req, res) => {
    try {
        const params = query.parse(req.url, true).query;
        let page;
        let size;
        if (params.page < 0 || !params.page) page = 0;
        else page = parseInt(params.page);
        if (params.size < 0 || !params.size) size = 1;
        else size = parseInt(params.size);

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
        let test = new PythonShell('script.py', options);
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

    } catch (err) {
        res.status(500).json(err.message)
    }
};
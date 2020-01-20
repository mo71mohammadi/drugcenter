const Drug = require("../models/drugs");
const UpToDate = require("../models/upToDate");
const MedScape = require("../models/medScape");
const query = require('url');


exports.addDrug = async (req, res) => {
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

            res.status(200).json({count, products})
        }).catch(err => {
            res.status(401).json(err.message)
        });

    } catch (err) {
        res.status(500).json(err.message)
    }
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

        Drug.find(search).then(result => {
            res.status(200).json(result)
        })
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

exports.interaction = async (req, res) => {
    try {
        Drug.aggregate([{
            "$group": {
                "_id": {
                    enName: "$enName",
                    enRoute: "$enRoute",
                    upToDateId: "$upToDateId",
                    medScapeId: "$medScapeId"
                }
            }
        }]).then(results => {
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

exports.interactionUpdate = async (req, res) => {
    try {
        Drug.updateMany({
            enName: req.body.enName,
            enRoute: req.body.enRoute
        }, {$set: {upToDateId: req.body.upToDateId, medScapeId: req.body.medScapeId}}).then(() => {
            Drug.find({enName: req.body.enName, enRoute: req.body.enRoute}).then(results => {
                results.forEach(result => {
                    if (result.upToDateId) {
                        UpToDate.updateOne({eRx: {$in: result.eRx + result.packageCode}}, {
                            $pull: {
                                eRx: result.eRx,
                                gtn: {$in: result.gtn},
                                irc: {$in: result.irc}
                            }
                        }).then(() => {
                            UpToDate.updateOne({globalId: result.upToDateId}, {
                                $addToSet: {
                                    eRx: result.eRx + result.packageCode,
                                    gtn: {$each: result.gtn},
                                    irc: {$each: result.irc}
                                }
                            })
                        });
                    }
                    if (result.medScapeId) {
                        MedScape.updateOne({eRx: {$in: result.eRx + result.packageCode}}, {
                            $pull: {
                                eRx: result.eRx,
                                gtn: {$in: result.gtn},
                                irc: {$in: result.irc}
                            }
                        }).then(() => {
                            MedScape.updateOne({drugId: result.medScapeId}, {
                                $addToSet: {
                                    eRx: result.eRx + result.packageCode,
                                    gtn: {$each: result.gtn},
                                    irc: {$each: result.irc}
                                }
                            })
                        });
                    }
                });
                res.status(200).json('shod')
            });
        })
    } catch (err) {
        res.status(500).json(err.message)
    }
};
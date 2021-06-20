const Insurance = require("../models/insurances");
const query = require('url');
const fs = require('fs')
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
        // let {type, site, size, page} = query.parse(req.url, true).query;
        let {size, page} = Pagination(req.body);
        const sort = req.body.sort
        const filter = req.body;
        delete filter.page;
        delete filter.size;
        delete filter.sort;
        let search = {};
        for (const item of Object.keys(filter)) {
            let regex = new RegExp(filter[item], 'i');
            if (item !== "insuranceType") {
                if (filter[item]) search[item] = regex
            }
        }
        // for (const item of Object.keys(filter)) if (filter[item]) search[item] = filter[item]
        size = parseInt(size)
        page = parseInt(page)
        Insurance.find(search).skip(size * page).limit(size).sort({...sort}).populate('generic').then(async insurances => {
            const newInsurances = []
            for (let insurance of insurances) {
                insurance = insurance.toObject()
                if (insurance.generic) insurance.eRx = insurance.generic.eRx
                delete insurance.product
                newInsurances.push(insurance)
            }
            const count = await Insurance.countDocuments(filter);
            res.status(200).json({count, data: newInsurances})
        })
    } catch (err) {
        res.status(500).json(err.message)
    }
};
exports.insurance = async (req, res) => {
    try {
        const {insuranceType, generic, special} = query.parse(req.url, true).query;
        if (![1, 2, 3].includes(parseInt(insuranceType))) return res.status(404).json({
            error: "insuranceType",
            message: "بیمه انتخابی وجود ندارد."
        })
        const search = {insuranceType: insuranceType, genericCode: generic};
        Insurance.findOne(search).then(result => {
            if (!result) return res.status(404).json({
                error: "generic",
                message: "این کد ژنریک در بانک تعهدات بیمه ها موجود نیست"
            });
            result = result.toObject();
            const specialIdSearch = result.special.find(item => item === parseInt(special));
            if (!specialIdSearch) return res.status(404).json({
                error: "special",
                message: ".این ژنریک برای تخصص انتخاب شده قابل تجویز نیست"
            });

            if (insuranceType === "1") {
                result = {
                    insuranceType: result.insuranceType,
                    genericCode: result.genericCode,
                    genericName: result.genericName,
                    isInsurance: result.isInsurance,
                    isHospital: result.isHospital,
                    isPresence: result.isPresence,
                    isDossier: result.isDossier,
                    maxPrescription: result.maxPrescription,
                    maxAge: result.maxAge,
                    isWeb: result.isWeb,
                    isBarcode: result.isBarcode,
                    isEvidence: result.isEvidence,
                    maxPrice: result.maxPrice,
                    percentOrganize: result.percentOrganize,
                }
            }
            if (insuranceType === "3") {
                result = {
                    insuranceType: result.insuranceType,
                    genericCode: result.genericCode,
                    genericName: result.genericName,
                    isInsurance: result.isInsurance,
                    isHospital: result.isHospital,
                    isHospitalSazman: result.isHospitalSazman,
                    maxPrescription: result.maxPrescription,
                    isWeb: result.isWeb,
                    isBarcode: result.isBarcode,
                    isDrugstoreConfirm: result.isDrugstoreConfirm,
                    maxPrice: result.maxPrice,
                    serviceGroup: result.percentOrganize,
                    percentOrganize: result.serviceGroup,
                }
            }
            res.json(result)
        })
    } catch (err) {
        res.status(500).json(err.message)
    }
}
exports.download = async (req, res) => {
    try {
        req.connection.setTimeout(1000 * 60 * 10);
        let options = {
            // pythonPath: '/home/ehrs/virtualenv/python/3.7/bin/python3.7',
            pythonPath: '/media/mojtaba/6FA8893B6D355C17/1400.01.03/Home/PycharmProjects/DrugCenter_0/venv/bin/python3.7',
            // scriptPath: '/home/mojtaba/WebstormProjects/api/routes/',
        };
        let test = new PythonShell('./routes/drugList.py', options);
        test.end(async message => {
            let rawData = fs.readFileSync('drugList.json');
            let data = JSON.parse(rawData);
            // await Price.deleteMany({})
            for (const item of data) {
                item.insuranceType = 1;
                await Insurance.create({...item}).catch(err => {
                    console.log(err)
                })

                // await Insurance.updateOne({
                //     irc: item.irc
                // }, {$addToSet: {price: item.price}}, {rawResult: true}).then(async result => {
                //     if (result.nModified !== 0) {
                //         item.date = new Date().toISOString()
                //         await Price.updateOne({irc: item.irc}, {$push: {date: item.date}})
                //         result.data
                //     }
                //     if (result.n === 0) {
                //         item.date = new Date().toISOString()
                //         await Price.create(item)
                //     }
                // })
            }
            res.status(200).json({message: message})
        })

        // const {site} = req.body;
        // if (site === "ttac") {
        // } else {
        //     res.status(401).json({message: "site name not found."})
        // }
    } catch (err) {
        res.status(500).json(err.message)
    }
};

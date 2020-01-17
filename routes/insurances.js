const express = require('express');
const router = express.Router();
const Insurance = require('../models/insurance');
const xlsx = require('xlsx');

const type = {1: "inTa", 2: "inSa", 3: "inMo"};

// Get Price
router.post('/insurance/Price', async (req, res) => {
    try {
        Insurance.findOne({genericCode: req.body.genericCode}).then(async insurance => {
            // حذف شود!
            let drugStoreType = 2;
            let response;
            let insuranceType;
            if (insurance === null) {
                response = {message: "این کد ژنریک در بانک تعهدات بیمه ها موجود نیست"}
            } else {
                // بیمه تامین اجتماعی
                if (req.body.insurance === 1 && insurance["insurance"]["inTa"]) {
                    const specialList = [];
                    const zeroSpecial = insurance["insurance"]["inTa"]["specialRel"];
                    for (let special in zeroSpecial) {
                        specialList.push(parseInt(zeroSpecial[special]["specialId"]))
                    }
                    insuranceType = insurance["insurance"]["inTa"];
                    if (insuranceType.isInsurance === "نيست") {
                        response = {message: "این کد ژنریک بیمه ای نیست"}
                    } else if (insuranceType.isHospital === "است" && drugStoreType !== 1) {
                        response = {message: "این کد ژنریک بیمارستانی است"}
                    } else if (insuranceType.maxAge && insuranceType.maxAge < req.body.age) {
                        response = {message: "این کد ژنریک برای افراد زیر 12 سال قابل تجویز است"}
                    } else if (specialList.includes(req.body.specialId) !== true) {
                        response = {message: "این ژنریک برای تخصص انتخاب شده قابل تجویز نیست"}
                    } else {
                        response = [];
                        let message = {};
                        if (insuranceType.isPresence === "بله") {
                            message.isPresence = "نیازمند حضور در دفتر اسناد"
                        }
                        if (insuranceType.isDossier === "بله") {
                            message.isDossier = "نیازمند تشکیل پرونده"
                        }
                        if (insuranceType.isWeb === "بله") {
                            message.isWeb = "نیازمند تایید"
                        }
                        if (insuranceType.isBarcode === "بله") {
                            message.isBarcode = "نیازمند ثبت بارکد"
                        }
                        response.push(message);
                        response.push({
                            maxPrescription: insuranceType.maxPrescription,
                            maxPrice: insuranceType.maxPrice,
                            percentOrganize: insuranceType.percentOrganize,
                        })
                    }
                }
                // بیمه سلامت
                else if (req.body.insurance === 2 && insurance["insurance"]["inSa"]) {
                    insuranceType = insurance["insurance"]["inSa"];
                    let specialIds;
                    if (insuranceType.hospitalCondition === 'or' && drugStoreType === 2) {
                        specialIds = insuranceType.specialInHospital
                    } else {
                        specialIds = insuranceType.specialInGeneral
                    }
                    // Important Conditions
                    let moji = [];
                    // حذف شود!
                    insuranceType.age = 12;
                    if (!specialIds.includes(req.body.specialId)) moji.push("این ژنریک برای تخصص انتخاب شده قابل تجویز نیست");
                    if (insuranceType.age && insuranceType.age < req.body.age) moji.push('این کد ژنریک برای افراد زیر 12 سال قابل تجویز است');
                    if (insuranceType.isInternal !== req.body.isInternal) moji.push("محصول انتخاب شده تولید داخل نیست");

                    // Report Conditions
                    response = {};
                    if (moji[0]) {
                        for (let item in moji) {
                            response[item] = moji[item]
                        }
                    }else {
                        if (insuranceType.isDossier) moji.push("نیازمند تشکیل پرونده");
                        if (insuranceType.isBarcode) moji.push("نیازمند ثبت بارکد");
                        if (insuranceType.maxPrescription) {
                            response['maxPrescription'] = insuranceType.maxPrescription;
                        }
                        response['organizationPercent'] = insuranceType.percentOrganize;
                        for (let item in moji) {
                            response[item] = moji[item]
                        }
                    }
                }
                // بیمه خدمات درمانی نیروهای مسلح
                else if (req.body.insurance === 3 && insurance["insurance"]["inMo"]) {
                    insuranceType = insurance["insurance"]["inMo"];
                    response = insuranceType;
                    if (insuranceType.isInsurance === "نمي باشد") {
                        response = {message: "این کد ژنریک بیمه ای نیست"};
                        if (insuranceType.receiver === "سرپرست جانباز" && req.body.receiver === 1) {
                            response = {
                                message: {
                                    0: "این کد ژنریک بیمه ای نیست",
                                    1: "این دارو توسط سرپرست جانباز قابل دریافت است"
                                }
                            };
                        }
                    } else if (insuranceType.isHospital === "مي باشد" && drugStoreType !== 1) {
                        response = {message: "این کد ژنریک بیمارستانی است"}
                    } else if (insuranceType.isPhysician === "ندارد" && req.body.specialId === 100) {
                        response = {message: "این کد ژنریک مجوز تجویز پزشک عمومی ندارد"}
                    } else if (insuranceType.isMama === "ندارد" && [174, 479, 480].includes(req.body.specialId) === true) {
                        response = {message: "این کد ژنریک مجوز تجویز ماما ندارد"}
                    } else {
                        response = [];
                        let message = {};
                        if (insuranceType.isConfirm === "مي باشد") {
                            message.isConfirm = "نیازمند تایید"
                        }
                        if (insuranceType.isBarcode === "نياز دارد") {
                            message.isBarcode = "نیازمند ثبت بارکد"
                        }
                        if (insuranceType.isDrugStore === "نمي باشد") {
                            message.isDrugStore = "داروخانه مجاز به تایید نیست"
                        }
                        response.push(message);
                        response.push({
                            genericCode: insuranceType.code,
                            maxPrescription: insuranceType.maxPrescription,
                            maxPrice: insuranceType.maxPrice,
                            percentOrganize: insuranceType.percentOrganize,
                        })
                    }
                }
                // Null Conditions
                else {
                    response = {message: "این کد ژنریک در تعهد بیمه انتخاب شده نیست"}
                }
            }
            res.json(response)
        });
    }catch (err) {
        res.status(500).json({massage: err.message})
    }
});


//Getting All Insurance
router.post('/insurance/getAll', async (req, res) => {
    Insurance.find().limit(20).then(async result => {
        let response = [];
        for (let insurance in result) {
            let insuranceT = result[insurance]["insurance"][type[req.body.insurance]];
            if (insuranceT["name"]) response.push(insuranceT);
        }
        try {
            return res.json(response)
        } catch (err) {
            return res.status(500).json({message: err.message})

        }
    })

});

// Getting One
router.post('/insurance/getBy', async (req, res) => {
    try {
        let search = {};
        for (let item in req.body) {
            search[item] = req.body[item]
        }
        Insurance.find(search).then(async insurances => {
            let response = [];
            for (let insurance in insurances) {
                response.push(insurances[insurance]);
            }
            res.json(response)
        })
    } catch (err) {
        res.status(500).json({message: err.message})
    }
});

// Import xlsx
router.post('/insurance/import', async (req, res) => {
    try {
        if (req.files) {
            let item;
            const wb = xlsx.read(req.files.insurance.data, {cellDates: true});
            const ws = wb.Sheets['Sheet1'];
            const jsonData = xlsx.utils.sheet_to_json(ws);

            for (item in jsonData) {
                if (jsonData[item].specialInGeneral && jsonData[item].specialInGeneral !== 'null') {
                    jsonData[item].specialInGeneral = (jsonData[item].specialInGeneral).split(',');
                } else {
                    jsonData[item].specialInGeneral = ''
                }
                if (jsonData[item].specialInHospital && jsonData[item].specialInHospital !== 'null') {
                    jsonData[item].specialInHospital = (jsonData[item].specialInHospital).split(',');
                } else {
                    jsonData[item].specialInHospital = ''
                }
                console.log(jsonData[item]);
                await Insurance.findOne({genericCode: parseInt(jsonData[item].code)}).then(insurance => {
                    if (insurance) {
                        if (req.body.insuranceType === "1") {
                            insurance.insurance.inTa = jsonData[item];
                            insurance.save()
                        }
                        if (req.body.insuranceType === "2") {
                            insurance.insurance.inSa = jsonData[item];
                            insurance.save()
                        }
                        if (req.body.insuranceType === "3") {
                            insurance.insurance.inMo = jsonData[item];
                            insurance.save()
                        }
                    } else {
                        let newInsurance;
                        if (req.body.insuranceType === "1") {
                            newInsurance = new Insurance({
                                genericCode: jsonData[item].code,
                                "insurance.inTa": jsonData[item],
                            });
                            newInsurance.save();
                        }
                        if (req.body.insuranceType === "2") {
                            newInsurance = new Insurance({
                                genericCode: jsonData[item].code,
                                "insurance.inSa": jsonData[item],
                            });
                            newInsurance.save();
                        }
                        if (req.body.insuranceType === "3") {
                            newInsurance = new Insurance({
                                genericCode: jsonData[item].code,
                                "insurance.inMo": jsonData[item],
                            });
                            newInsurance.save();
                        }
                    }
                });
            }
            res.json(jsonData)

        } else res.json({message: "File Not Found!"})
    } catch (err) {
        res.json({message: err.message})
    }
});


module.exports = router;
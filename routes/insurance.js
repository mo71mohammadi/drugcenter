const Insurance = require("../models/insurance");
const query = require('url');

exports.insurance = async (req, res) => {
    try {
        const { insuranceType, generic, special } = query.parse(req.url, true).query;
        if (![1, 2, 3].includes(parseInt(insuranceType))) return res.status(404).json({ error: "insuranceType", message: "بیمه انتخابی وجود ندارد." })
        const search = { insuranceType: insuranceType, genericCode: generic }
        Insurance.findOne(search).then(result => {
            if (!result) return res.status(404).json({ error: "generic", message: "این کد ژنریک در بانک تعهدات بیمه ها موجود نیست" })
            result = result.toObject()
            const specialIdSearch = result.special.find(item => item == special)
            if (!specialIdSearch) return res.status(404).json({ error: "special", message: ".این ژنریک برای تخصص انتخاب شده قابل تجویز نیست" })

            if (insuranceType == 1) {
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
            if (insuranceType == 3) {
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
const mongoose = require("mongoose");

const productStSchema = new mongoose.Schema({
    product: {
        $ref: {},
        $id: {},
        $db: {},
    },
    eRx: {type: String},
    genericCode: {type: Number},
    enProductName: {type: String},
    faProductName: {type: String},
    iRc: [{type: Number}],
    drugStoreId: {},
    storageId: {type: String},
    count: {type: Number},
    expireDate: {type: Date},
    locationId:{},
});

model.exports = mongoose.model("productSt", productStSchema);
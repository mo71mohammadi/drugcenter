const express = require("express");
const router = express.Router();
const Product = require("../../models/archive/product");
const Generic = require("../../models/archive/generic");
const path = require('path');
const xlsx = require('xlsx');
const request = require('request');
const fs = require('fs');
let {PythonShell} = require('python-shell');
const mongoXlsx = require('mongo-xlsx');

// Getting all
router.post("/products/getAll", async (req, res) => {
    try {
        let page;
        let size;
        if (req.body.page < 0 || !req.body.page) page = 0;
        else page = req.body.page;
        if (req.body.size < 1 || !req.body.size) size = 1;
        else size = req.body.size;
        const filter = req.body;
        delete filter.page; delete filter.size;
        let search = {};
        for (let item in filter) {
            if (filter[item]) search['data.' + item] = filter[item]
        }

        Product.find(search).skip(size * page).limit(size).sort({_id: -1}).then(async products => {
            const count = await Product.countDocuments(search);
            const productList = [];
            for (let product in products) {
                let obj = products[product].data.toObject();
                obj['_id'] = products[product]['_id'];
                productList.push(obj)
            }
            res.status(200).json({count: count, data: productList})
        }).catch(err => {
            res.status(401)
        });
    } catch (err) {
        res.status(500).json({massage: err.message})
    }
});

// Creating One
router.post('/products/create', async (req, res) => {
    let newProduct = new Product({
        data: req.body,
    });
    try {
        await newProduct.save();
        res.status(200).json(newProduct.data)

    } catch (err) {
        res.status(500).json({massage: err.message})
    }
});

// Update Product
router.post('/products/update/', async (req, res) => {
    Product.findOne({_id: req.body._id}).then(async updateProduct => {
        try {
            if (updateProduct) {
                updateProduct.data = req.body;
                await updateProduct.save();
                res.status(200).json(updateProduct)
            } else res.status(401).json("product not found");
        } catch (err) {
            res.status(500).json({massage: err.message})
        }
    });
});

// Deleting One
router.post('/products/delete', async (req, res) => {
    try {
        Product.findById(req.body.id).then(async product => {
            await product.remove();
            res.json({message: "product Delete Successfully"})
        }).catch(error => {
            res.status(401).json({message: "Product ID Not Found"})
        });
    } catch (err) {
        res.status(500).json({massage: err.message})
    }
});

// Import
router.get('/', async (req, res) => {
    res.sendFile(path.resolve('index.html'))
});

router.get('/products/updatePrice', async (req, res) => {
    try {
        let options = {
            // mode: 'text',
            // encoding: 'utf8',
            pythonPath: '/home/mojtaba/PycharmProjects/metraj/venv/bin/python3',
            // pythonOptions: ['-u'], // get print results in real-time
            scriptPath: '/home/mojtaba/WebstormProjects/api/routes/',
            // args: ['value1', 'value2', 'value3']
        };

        let test = new PythonShell('script.py', options);
        test.on('message', function (message) {
            res.json(message)
        });

    } catch (err) {
        res.status(500).json({message: err.message})
    }
});

router.post('/products/import', async (req, res) => {
    try {
        if (req.files) {
            const wb = xlsx.read(req.files.products.data, {cellDates: true});
            const ws = wb.Sheets['Sheet1'];
            const jsonData = xlsx.utils.sheet_to_json(ws);
            console.log(jsonData.length);
            let success = 0;
            let successList = [];
            let repeat = 0;
            let repeatList = [];
            let update = 0;
            let updateList = [];
            for (let item in jsonData) {
                let generic;
                if (jsonData[item].generic) {
                    generic = jsonData[item].generic;
                    delete jsonData[item].generic
                }
                let gtn;
                if (jsonData[item].gtn) {
                    gtn = {gtn: jsonData[item].gtn};
                    delete jsonData[item].gtn
                } else gtn = {};
                let irc;
                if (jsonData[item].irc) {
                    irc = {
                        number: jsonData[item].irc,
                        // ValidityDate: jsonData[item].ValidityDate
                    };
                    delete jsonData[item].irc
                } else irc = {};
                await Product.findOne({
                    "data.packageCode": jsonData[item].packageCode,
                    "data.eRx": jsonData[item].eRx
                }).then(async product => {

                    await Generic.findOne({'drug.genericCode': generic}).then(async result => {
                        // console.log(result._id);
                        if (!product) {
                            await Product.create({
                                data: jsonData[item],
                                'data.generic': result,
                                'data.gtn': gtn,
                                'data.irc': irc
                            }).then(newProduct => {
                                success++;
                                successList.push(jsonData[item].eRx);
                            });
                        } else {
                            let duplicate = jsonData.filter(function (value) {
                                return value.eRx === jsonData[item].eRx && value.packageCode === jsonData[item].packageCode
                            });
                            if (duplicate.length > 1) {
                                repeat++;
                                repeatList.push(jsonData[item].eRx)
                            } else {
                                update++;
                                updateList.push(jsonData[item].eRx)
                            }
                        }

                    })
                });
            }
            res.json({
                success: {0: `${success} item import successfully`, 1: successList},
                update: {0: `${update} item update successfully`, 1: updateList},
                repeat: {0: `${repeat} item duplicate`, 1: repeatList},
            })
        } else res.json({message: 'File Not Found!'})
    } catch (err) {
        res.json({message: err.message})
    }
});

router.post('/products/export', async (req, res) => {
    try {
        const filter = req.body;
        let search = {};
        for (let item in filter) {
            if (filter[item]) search['data.' + item] = filter[item]
        }

        Product.find(search).then(products => {
            let dataList = [];
            for (let product in products) dataList.push(products[product]['data'].toObject());
            let model = mongoXlsx.buildDynamicModel(dataList);
            /* Generate Excel */
            const options = {
                fileName: "products.xlsx",
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

module.exports = router;
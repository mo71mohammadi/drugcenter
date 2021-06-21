const express = require('express');
const router = express.Router();

const medScape = require('./medScapes');
const upToDate = require('./upToDates');
const drug = require('./archive/drugs');
const drugstore = require('./drugstores');
const distributor = require('./distributors');
const recommend = require('./archive/recommend');
const roleController = require('./roles');
const userController = require('./users');
const insurance = require('./insurance');
const importData = require('./import');
const product = require('./products');
const generic = require('./generics');
const category = require('./category');
const price = require('./prices');
const drugInfo = require('./archive/drugInfo');
const fileUpload = require('express-fileupload');

//اطلاعات پایه
router.post('/generics/import', userController.allowIfLoggedin, fileUpload(), generic.import);
router.post('/generics/getAll', userController.allowIfLoggedin, generic.getAll);
router.post('/generics/getOne', userController.allowIfLoggedin, generic.getOne);
router.post('/generics/create', userController.allowIfLoggedin, generic.create);
router.post('/generics/delete', userController.allowIfLoggedin, generic.delete);
router.post('/generics/update', userController.allowIfLoggedin, generic.update);
router.post('/generics/export', userController.allowIfLoggedin, generic.export);
router.delete('/generics/deleteAll', userController.allowIfLoggedin, generic.deleteAll);


//.............................

// محصولات
router.post('/products/getAll', userController.allowIfLoggedin, product.getAll);
router.post('/products/getOne', userController.allowIfLoggedin, product.getOne);
router.get('/products/getBy', userController.allowIfLoggedin, product.getBy);
router.post('/products/create', userController.allowIfLoggedin, product.create);
router.post('/products/delete', userController.allowIfLoggedin, product.delete);
router.delete('/products/deleteAll', userController.allowIfLoggedin, product.deleteAll);
router.post('/products/update', userController.allowIfLoggedin, product.update);
router.post('/products/import', userController.allowIfLoggedin, fileUpload(), product.import);
router.post('/products/importUpdate', userController.allowIfLoggedin, fileUpload(), product.importUpdate);
router.post('/products/export', userController.allowIfLoggedin, product.export);
router.put('/products/image', userController.allowIfLoggedin, product.uploadImg);
router.delete('/products/image', userController.allowIfLoggedin, product.deleteImg);
router.put('/products/price', userController.allowIfLoggedin, product.updatePrice);
router.delete('/products/price', userController.allowIfLoggedin, product.deletePrice);
router.get('/products/search', userController.allowIfLoggedin, product.search);
router.post('/products/generic', userController.allowIfLoggedin, product.generic);
router.put('/products/interaction', userController.allowIfLoggedin, product.updateMany);
router.get('/products/getInfo', userController.allowIfLoggedin, product.getInfo);
router.get('/products/price', userController.allowIfLoggedin, product.price);
// .......................................................

router.post('/price/getAll', userController.allowIfLoggedin, price.getAll);
router.post('/price/create', userController.allowIfLoggedin, price.create);
router.put('/price/update', userController.allowIfLoggedin, price.update);
router.delete('/price/delete', userController.allowIfLoggedin, price.delete);
router.post('/price/download', userController.allowIfLoggedin, price.download);
router.put('/price/updateFrom', userController.allowIfLoggedin, price.updateFromTTAC);
router.post('/price/updateIRC', userController.allowIfLoggedin, fileUpload(), price.updateIRC);

router.post('/products/category/getAll', userController.allowIfLoggedin, category.getAll);
router.post('/products/category/getOne', userController.allowIfLoggedin, category.getOne);
router.post('/products/category/create', userController.allowIfLoggedin, category.create);
router.post('/products/category/delete', userController.allowIfLoggedin, category.delete);
router.post('/products/category/update', userController.allowIfLoggedin, category.update);
router.post('/products/category/import', userController.allowIfLoggedin, fileUpload(), category.import);
router.delete('/products/category/deleteAll', userController.allowIfLoggedin, category.deleteAll);

router.post('/drugs/getName', userController.allowIfLoggedin, drug.interaction);
router.put('/Interaction/update', userController.allowIfLoggedin, drug.updateInteraction);
router.get('/Interaction/medScape/getName', userController.allowIfLoggedin, medScape.name);
router.get('/Interaction/upToDate/getName', userController.allowIfLoggedin, upToDate.name);

// drugsInfo API
router.post('/drugs/getAll', userController.allowIfLoggedin, drugInfo.getAll);
router.post('/drugs/getOne', userController.allowIfLoggedin, drugInfo.getOne);
router.post('/drugs/create', userController.allowIfLoggedin, drugInfo.create);
router.delete('/drugs/delete', userController.allowIfLoggedin, drugInfo.delete);
router.put('/drugs/update', userController.allowIfLoggedin, drugInfo.update);
router.post('/drugs/import', userController.allowIfLoggedin, fileUpload(), drugInfo.import);
router.post('/drugs/export', userController.allowIfLoggedin, drugInfo.export);
router.get('/drugs/search', userController.allowIfLoggedin, drugInfo.search)


// UpToDate API
router.get('/Interaction/upToDate/getName', userController.allowIfLoggedin, upToDate.getName)

router.get('/import', userController.allowIfLoggedin, importData.import);

router.post('/signup', userController.allowIfLoggedin, userController.signUp);
router.post('/auth/login',  userController.allowIfLoggedin, userController.login);
router.get('/profile', userController.allowIfLoggedin, userController.grantAccess('readAny', 'profile'), userController.profile);

// router.get('/user/:userId', userController.allowIfLoggedin, userController.getUser);
router.post('/users', userController.allowIfLoggedin, userController.grantAccess('readAny', 'user'), userController.getUsers);
router.put('/user/:userId', userController.allowIfLoggedin, userController.grantAccess('updateAny', 'user'), userController.updateUser);
router.delete('/user/:userId', userController.allowIfLoggedin, userController.grantAccess('deleteAny', 'user'), userController.deleteUser);

router.post('/role', userController.allowIfLoggedin, userController.grantAccess('createAny', 'role'), roleController.addRole);
// router.get('/role/:roleId', userController.allowIfLoggedin, userController.grantAccess('readAny', 'role'), roleController.getRole);
router.post('/roles', userController.allowIfLoggedin, userController.grantAccess('readAny', 'role'), roleController.getRoles);
router.put('/role/:roleId', userController.allowIfLoggedin, userController.grantAccess('updateAny', 'role'), roleController.updateRole);
router.delete('/role/:roleId', userController.allowIfLoggedin, userController.grantAccess('deleteAny', 'role'), roleController.deleteRole);

// Authentication
router.get('/auth/v1', userController.authentication);

// MedScape
// router.get('/medScape/multiInteraction', userController.allowIfLoggedin, userController.grantAccess('readAny', 'medscape.api'), medScape.interactionChecker);
// router.post('/medScape/', userController.allowIfLoggedin, userController.grantAccess('createAny', 'medscape'), medScape.addMedScape);
// router.get('/medScape/', userController.allowIfLoggedin, userController.grantAccess('readAny', 'medscape'), medScape.getMedScape);
// router.put('/medScape', userController.allowIfLoggedin, userController.grantAccess('updateAny', 'medscape'), medScape.updateMedScape);
// router.delete('/medScape/:id', userController.allowIfLoggedin, userController.grantAccess('deleteAny', 'medscape'), medScape.deleteMedScape);
// router.get('/medScape/name', userController.allowIfLoggedin, userController.grantAccess('readAny', 'medscape'), medScape.name);
router.get('/medScape/multiInteraction',userController.allowIfLoggedin, medScape.interactionChecker);
router.post('/medScape/',userController.allowIfLoggedin, medScape.addMedScape);
router.get('/medScape/',userController.allowIfLoggedin, medScape.getMedScape);
router.put('/medScape',userController.allowIfLoggedin, medScape.updateMedScape);
router.delete('/medScape/:id', userController.allowIfLoggedin,medScape.deleteMedScape);
router.get('/medScape/name', userController.allowIfLoggedin,medScape.name);


// UpToDate
// router.get('/upToDate/multiInteraction', userController.allowIfLoggedin, userController.grantAccess('readAny', 'uptodate.api'), upToDate.interactionChecker);
// router.post('/upToDate/', userController.allowIfLoggedin, userController.grantAccess('createAny', 'uptodate'), upToDate.addUpToDate);
// router.get('/upToDate/name', userController.allowIfLoggedin, userController.grantAccess('readAny', 'uptodate'), upToDate.name);
router.get('/upToDate/multiInteraction', userController.allowIfLoggedin,upToDate.interactionChecker);
router.post('/upToDate/', userController.allowIfLoggedin,upToDate.addUpToDate);
router.get('/upToDate/name', userController.allowIfLoggedin,upToDate.name);

// Recommend
router.post('/atc/import', userController.allowIfLoggedin, userController.grantAccess('createAny', 'atc'), recommend.importATC);
router.get('/atc/get', userController.allowIfLoggedin, userController.grantAccess('readAny', 'atc'), recommend.atc);


// Drugs Product
// router.post('/drugs/getAll',userController.allowIfLoggedin, userController.grantAccess('readAny', 'drug'), drug.getAll);
// router.post('/drugs/create',userController.allowIfLoggedin, userController.grantAccess('createAny', 'drug'), drug.create);
// router.post('/drugs/delete',userController.allowIfLoggedin, userController.grantAccess('deleteAny', 'drug'), drug.delete);
// router.post('/drugs/deleteAll',userController.allowIfLoggedin, userController.grantAccess('deleteAny', 'drug'), drug.deleteAll);
// router.post('/drugs/update',userController.allowIfLoggedin, userController.grantAccess('updateAny', 'drug'), drug.update);
// router.post('/drugs/import', drug.import);
// router.post('/drugs/export',userController.allowIfLoggedin, userController.grantAccess('readAny', 'drug'), drug.export);
// router.get('/drugs/getInfo',userController.allowIfLoggedin, userController.grantAccess('readAny', 'drug.api'), drug.getInfo);
// router.get('/drugs/distinct',userController.allowIfLoggedin, userController.grantAccess('readAny', 'drug'), drug.distinct);
// hazf shvad!
router.get('/drugs/import', drug.html);

router.post('/drugs/atc', userController.allowIfLoggedin, userController.grantAccess('readAny', 'atc'), drug.atc);
router.post('/drugs/updateATC', userController.allowIfLoggedin, userController.grantAccess('updateAny', 'atc'), drug.updateATC);

// router.post('/drugs/interaction', userController.allowIfLoggedin, userController.grantAccess('readAny', 'interaction'), drug.interaction);
router.post('/drugs/interaction',  drug.interaction);
router.post('/drugs/updateInteraction', userController.allowIfLoggedin, userController.grantAccess('updateAny', 'interaction'), drug.updateInteraction);

router.post('/drugs/price', userController.allowIfLoggedin, userController.grantAccess('readAny', 'price'), drug.price);
router.post('/drugs/getPrice', userController.allowIfLoggedin, userController.grantAccess('readAny', 'price'), drug.getPrice);
router.post('/drugs/updatePrice', userController.allowIfLoggedin, userController.grantAccess('updateAny', 'price'), drug.updatePrice);

// Insurance
router.get('/insurance', insurance.insurance);
router.post('/insurances/download', insurance.download);
router.post('/insurances/getAll', insurance.getAll);

router.get('/insurance/special', userController.allowIfLoggedin, userController.grantAccess('readAny', 'insurance.api'), recommend.special);

// drugStore
router.post('/drugstores/import', drugstore.import);
router.post('/drugstores/getAll', drugstore.getAll);
router.post('/drugstores/deleteAll', drugstore.deleteAll);

// distributors
router.post('/distributors/import', distributor.import);
router.post('/distributors/getAll', distributor.getAll);
router.post('/distributors/delete', distributor.delete);
router.post('/distributors/update', distributor.update);

// router.post('/drugstores/deleteAll', drugstore.deleteAll);


module.exports = router;
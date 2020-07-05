const express = require('express');
const router = express.Router();

const medScape = require('./medScapes');
const upToDate = require('./upToDates');
const drug = require('./drugs');
const drugstore = require('./drugstores');
const distributor = require('./distributors');
const recommend = require('./recommend');
const roleController = require('./roles');
const userController = require('./users');
const insurance = require('./insurance');
const importData = require('./import');

router.get('/import', importData.import);

router.post('/signup', userController.signUp);
router.post('/login', userController.login);
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
router.get('/v1', userController.authentication);

// MedScape
router.get('/medScape/multiInteraction',userController.allowIfLoggedin, userController.grantAccess('readAny', 'medscape.api'), medScape.interactionChecker);
router.post('/medScape/',userController.allowIfLoggedin, userController.grantAccess('createAny', 'medscape'), medScape.addMedScape);
router.get('/medScape/',userController.allowIfLoggedin, userController.grantAccess('readAny', 'medscape'), medScape.getMedScape);
router.put('/medScape',userController.allowIfLoggedin, userController.grantAccess('updateAny', 'medscape'), medScape.updateMedScape);
router.delete('/medScape/:id',userController.allowIfLoggedin, userController.grantAccess('deleteAny', 'medscape'), medScape.deleteMedScape);
router.get('/medScape/name',userController.allowIfLoggedin, userController.grantAccess('readAny', 'medscape'), medScape.name);


// UpToDate
router.get('/upToDate/multiInteraction', userController.allowIfLoggedin, userController.grantAccess('readAny', 'uptodate.api'), upToDate.interactionChecker);
router.post('/upToDate/', userController.allowIfLoggedin, userController.grantAccess('createAny', 'uptodate'), upToDate.addUpToDate);
router.get('/upToDate/name', userController.allowIfLoggedin, userController.grantAccess('readAny', 'uptodate'), upToDate.name);

// Recommend
router.post('/atc/import',userController.allowIfLoggedin, userController.grantAccess('createAny', 'atc'), recommend.importATC);
router.get('/atc/get',userController.allowIfLoggedin, userController.grantAccess('readAny', 'atc'), recommend.atc);


// Drugs Product
router.post('/drugs/getAll',userController.allowIfLoggedin, userController.grantAccess('readAny', 'drug'), drug.getAll);
router.post('/drugs/create',userController.allowIfLoggedin, userController.grantAccess('createAny', 'drug'), drug.create);
router.post('/drugs/delete',userController.allowIfLoggedin, userController.grantAccess('deleteAny', 'drug'), drug.delete);
router.post('/drugs/deleteAll',userController.allowIfLoggedin, userController.grantAccess('deleteAny', 'drug'), drug.deleteAll);
router.post('/drugs/update',userController.allowIfLoggedin, userController.grantAccess('updateAny', 'drug'), drug.update);
router.post('/drugs/import', drug.import);
router.post('/drugs/export',userController.allowIfLoggedin, userController.grantAccess('readAny', 'drug'), drug.export);
router.get('/drugs/getInfo',userController.allowIfLoggedin, userController.grantAccess('readAny', 'drug.api'), drug.getInfo);
router.get('/drugs/distinct',userController.allowIfLoggedin, userController.grantAccess('readAny', 'drug'), drug.distinct);
// hazf shvad!
router.get('/drugs/import', drug.html);

router.post('/drugs/atc', userController.allowIfLoggedin, userController.grantAccess('readAny', 'atc'), drug.atc);
router.post('/drugs/updateATC', userController.allowIfLoggedin, userController.grantAccess('updateAny', 'atc'), drug.updateATC);

router.post('/drugs/interaction', userController.allowIfLoggedin, userController.grantAccess('readAny', 'interaction'),  drug.interaction);
router.post('/drugs/updateInteraction', userController.allowIfLoggedin, userController.grantAccess('updateAny', 'interaction'), drug.updateInteraction);

router.post('/drugs/price', userController.allowIfLoggedin, userController.grantAccess('readAny', 'price'), drug.price);
router.post('/drugs/getPrice', userController.allowIfLoggedin, userController.grantAccess('readAny', 'price'), drug.getPrice);
router.post('/drugs/updatePrice', userController.allowIfLoggedin, userController.grantAccess('updateAny', 'price'), drug.updatePrice);

// Insurance
router.get('/insurance', userController.allowIfLoggedin, userController.grantAccess('readAny', 'insurance.api'), insurance.insurance);
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
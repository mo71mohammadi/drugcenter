const express = require('express');
const router = express.Router();
const medScape = require('./medScapes');
const upToDate = require('./upToDates');
const drug = require('./drugs');
const recommend = require('./recommend');
const userController = require('./users');
const roleController = require('./roles');
const insurance = require('./insurance');

router.post('/signup', userController.signUp);
router.post('/login', userController.login);
router.get('/profile', userController.allowIfLoggedin, userController.profile);

// router.get('/user/:userId', userController.allowIfLoggedin, userController.getUser);
// router.get('/users', userController.allowIfLoggedin, userController.grantAccess('readAny', 'user'), userController.getUsers);
router.post('/users', userController.getUsers);
// router.put('/user/:userId', userController.allowIfLoggedin, userController.grantAccess('updateAny', 'user'), userController.updateUser);
router.put('/user/:userId', userController.updateUser);
// router.delete('/user/:userId', userController.allowIfLoggedin, userController.grantAccess('deleteAny', 'user'), userController.deleteUser);
router.delete('/user/:userId', userController.deleteUser);

router.post('/role', userController.allowIfLoggedin, userController.grantAccess('createAny', 'role'), roleController.addRole);
router.get('/role/:roleId', userController.allowIfLoggedin, userController.grantAccess('readAny', 'role'), roleController.getRole);
router.get('/roles', userController.allowIfLoggedin, userController.grantAccess('readAny', 'role'), roleController.getRoles);
router.put('/role/:roleId', userController.allowIfLoggedin, userController.grantAccess('updateAny', 'role'), roleController.updateRole);
router.delete('/role/:roleId', userController.allowIfLoggedin, userController.grantAccess('deleteAny', 'role'), roleController.deleteRole);

// Authentication
router.get('/v1', async (req, res) => {
    res.json({
        "status": "success", "object": {"user": null}
    })
});

// MedScape
router.get('/medScape/multiInteraction', medScape.interactionChecker);
router.post('/medScape/', medScape.addMedScape);
router.get('/medScape/', medScape.getMedScape);
router.put('/medScape', medScape.updateMedScape);
router.delete('/medScape/:id', medScape.deleteMedScape);
router.get('/medScape/name', medScape.name);


// UpToDate
router.get('/upToDate/multiInteraction', upToDate.interactionChecker);
router.post('/upToDate/', upToDate.addUpToDate);
router.get('/upToDate/name', upToDate.name);

// Recommend
router.post('/atc/import', recommend.importATC);
router.get('/atc/get', recommend.atc);


// Drugs Product
router.post('/drugs/getAll', drug.getAll);
router.post('/drugs/create', drug.create);
router.post('/drugs/delete', drug.delete);
router.post('/drugs/update', drug.update);
router.get('/drugs/import', drug.html);
router.post('/drugs/import', drug.import);
router.post('/drugs/export', drug.export);
router.get('/drugs/getInfo', drug.getInfo);
router.get('/drugs/distinct', drug.distinct);

router.post('/drugs/atc', userController.allowIfLoggedin, drug.atc);
router.post('/drugs/updateATC', drug.updateATC);

router.post('/drugs/interaction', drug.interaction);
router.post('/drugs/updateInteraction', drug.updateInteraction);

router.post('/drugs/price', drug.price);
router.post('/drugs/getPrice', drug.getPrice);
router.post('/drugs/updatePrice', drug.updatePrice);

// Insurance
router.get('/insurance', insurance.insurance)
router.get('/insurance/special', recommend.special)

module.exports = router;
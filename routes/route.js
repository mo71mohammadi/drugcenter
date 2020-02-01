const express = require('express');
const router = express.Router();
const medScape = require('./medScapes');
const upToDate = require('./upToDates');
const Drug = require('./drugs');

// MedScape
router.get('/medScape/multiInteraction', medScape.interactionChecker);
router.post('/medScape/', medScape.addMedScape);
router.get('/medScape/', medScape.getMedScape);
router.put('/medScape', medScape.updateMedScape);
router.delete('/medScape/:id', medScape.deleteMedScape);

// UpToDate
router.get('/upToDate/multiInteraction', upToDate.interactionChecker);
router.post('/upToDate/', upToDate.addUpToDate);
router.get('/upToDate/name', upToDate.name);

// Drug Product
router.post('/drugs/getAll', Drug.getAll);
router.post('/drugs/create', Drug.create);
router.post('/drugs/delete', Drug.delete);
router.post('/drugs/update', Drug.update);
router.get('/drugs/import', Drug.html);
router.post('/drugs/import', Drug.import);
router.post('/drugs/export', Drug.export);
router.get('/drugs/getInfo', Drug.getInfo);

router.post('/drugs/atc', Drug.atc);

router.post('/drugs/interaction', Drug.interaction);
router.post('/drugs/interaction', Drug.updateInteraction);

router.post('/drugs/getPrice', Drug.getPrice);
router.get('/drugs/price', Drug.price);
router.post('/drugs/updatePrice', Drug.updatePrice);

module.exports = router;
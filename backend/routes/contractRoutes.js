const express = require('express');
const router = express.Router();
const contractController = require('../controllers/contractController');
const upload = require('../middlewares/upload');

router.post('/', upload.single('contract_image'), contractController.createContract);
router.get('/', contractController.getAllContracts);
router.get('/:id', contractController.getContractById);
router.put('/:id', upload.single('contract_image'), contractController.updateContract);
router.delete('/:id', contractController.deleteContract);

module.exports = router;

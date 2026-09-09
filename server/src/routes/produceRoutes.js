const express = require('express');
const router = express.Router();
const {
  getProduce,
  getProduceById,
  createProduce,
  updateProduce,
  deleteProduce,
  getMarketReferencePrices,
} = require('../controllers/produceController');
const { verifyToken } = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');

router.get('/', getProduce);
router.get('/reference-prices', getMarketReferencePrices);
router.get('/:id', getProduceById);
router.post('/', verifyToken, checkRole('FARMER', 'ADMIN'), createProduce);
router.put('/:id', verifyToken, checkRole('FARMER', 'ADMIN'), updateProduce);
router.delete('/:id', verifyToken, checkRole('FARMER', 'ADMIN'), deleteProduce);

module.exports = router;

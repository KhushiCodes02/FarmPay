const Produce = require('../models/Produce');

const MARKET_REFERENCE_PRICES = {
  'Wheat': 22,
  'Tomatoes': 28,
  'Potatoes': 18,
  'Basmati Rice': 45,
  'Sona Masoori Rice': 36,
  'Onions': 24,
  'Mustard Seeds': 52,
  'Chickpeas (Chana)': 60,
  'Apples': 95,
  'Bananas': 30,
  'Red Chillies': 140,
  'Turmeric': 110,
  'Green Peas': 40,
  'Soybean': 48,
  'Carrots': 25,
};

const getProduce = async (req, res) => {
  try {
    const { category, location, minPrice, maxPrice, search, sort, farmerId } = req.query;
    const filter = { status: { $ne: 'INACTIVE' } };

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }

    if (farmerId) {
      filter.farmerId = farmerId;
    }

    if (minPrice || maxPrice) {
      filter.pricePerUnit = {};
      if (minPrice) filter.pricePerUnit.$gte = Number(minPrice);
      if (maxPrice) filter.pricePerUnit.$lte = Number(maxPrice);
    }

    if (search) {
      filter.$or = [
        { cropName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    let sortQuery = { createdAt: -1 };
    if (sort === 'price_asc') sortQuery = { pricePerUnit: 1 };
    if (sort === 'price_desc') sortQuery = { pricePerUnit: -1 };

    const produceList = await Produce.find(filter)
      .populate('farmerId', 'name email location rating ratingCount businessName')
      .sort(sortQuery);

    return res.json({ produce: produceList, count: produceList.length });
  } catch (error) {
    console.error('getProduce error:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch produce' });
  }
};

const getProduceById = async (req, res) => {
  try {
    const produce = await Produce.findById(req.params.id)
      .populate('farmerId', 'name email phone location rating ratingCount businessName');

    if (!produce) {
      return res.status(404).json({ error: 'Produce listing not found' });
    }

    const refPrice = MARKET_REFERENCE_PRICES[produce.cropName] || Math.round(produce.pricePerUnit * 0.92);

    return res.json({
      produce,
      marketReference: {
        cropName: produce.cropName,
        referencePrice: refPrice,
        farmPayPrice: produce.pricePerUnit,
        savingsOrFairnessNotice: produce.pricePerUnit >= refPrice
          ? 'Fair farmer price without middleman commission deduction'
          : 'Competitive wholesale price directly from grower'
      }
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Error fetching produce details' });
  }
};

const createProduce = async (req, res) => {
  try {
    const { cropName, category, description, quantityAvailable, unit, pricePerUnit, location, image, harvestDate } = req.body;

    if (!cropName || !quantityAvailable || !pricePerUnit || !location) {
      return res.status(400).json({ error: 'Crop name, quantity, price per unit, and location are required.' });
    }

    const refPrice = MARKET_REFERENCE_PRICES[cropName] || Math.round(Number(pricePerUnit) * 0.92);

    const produce = await Produce.create({
      farmerId: req.user.id,
      cropName: cropName.trim(),
      category: category || 'Vegetables',
      description,
      quantityAvailable: Number(quantityAvailable),
      unit: unit || 'kg',
      pricePerUnit: Number(pricePerUnit),
      marketReferencePrice: refPrice,
      location: location.trim(),
      image: image || '',
      harvestDate: harvestDate ? new Date(harvestDate) : new Date(),
      status: Number(quantityAvailable) > 0 ? 'AVAILABLE' : 'SOLD_OUT',
    });

    return res.status(201).json({ message: 'Produce listing created successfully', produce });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Error creating produce listing' });
  }
};

const updateProduce = async (req, res) => {
  try {
    const produce = await Produce.findById(req.params.id);
    if (!produce) {
      return res.status(404).json({ error: 'Produce listing not found' });
    }

    if (produce.farmerId.toString() !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized to edit this produce listing.' });
    }

    const updatable = ['cropName', 'category', 'description', 'quantityAvailable', 'unit', 'pricePerUnit', 'location', 'image', 'status'];
    for (const key of updatable) {
      if (req.body[key] !== undefined) {
        produce[key] = req.body[key];
      }
    }

    if (produce.quantityAvailable > 0 && produce.status === 'SOLD_OUT') {
      produce.status = 'AVAILABLE';
    }

    await produce.save();
    return res.json({ message: 'Produce updated successfully', produce });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Error updating produce listing' });
  }
};

const deleteProduce = async (req, res) => {
  try {
    const produce = await Produce.findById(req.params.id);
    if (!produce) {
      return res.status(404).json({ error: 'Produce listing not found' });
    }

    if (produce.farmerId.toString() !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized to delete this listing.' });
    }

    produce.status = 'INACTIVE';
    await produce.save();

    return res.json({ message: 'Produce listing deactivated successfully' });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Error deleting produce listing' });
  }
};

const getMarketReferencePrices = (req, res) => {
  return res.json({ marketPrices: MARKET_REFERENCE_PRICES });
};

module.exports = {
  getProduce,
  getProduceById,
  createProduce,
  updateProduce,
  deleteProduce,
  getMarketReferencePrices,
};

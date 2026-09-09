const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Produce = require('../models/Produce');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Payout = require('../models/Payout');
const Dispute = require('../models/Dispute');
const Rating = require('../models/Rating');
const OTP = require('../models/OTP');
const AuditLog = require('../models/AuditLog');
const { hashOTP } = require('../services/otpService');
const { connectDB, closeDB } = require('../config/db');

const seedDatabase = async () => {
  try {
    console.log('--- Seeding FarmPay realistic demo database ---');
    await connectDB();

    // Clear existing collections
    await Promise.all([
      User.deleteMany({}),
      Produce.deleteMany({}),
      Order.deleteMany({}),
      Payment.deleteMany({}),
      Payout.deleteMany({}),
      Dispute.deleteMany({}),
      Rating.deleteMany({}),
      OTP.deleteMany({}),
      AuditLog.deleteMany({}),
    ]);

    const defaultPassword = 'FarmPay@123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(defaultPassword, salt);

    // 1. Create Admin
    const admin = await User.create({
      name: 'Platform Administrator',
      email: 'admin@farmpay.demo',
      phone: '+91 98765 00000',
      password: hashedPassword,
      role: 'ADMIN',
      location: 'New Delhi, India',
      businessName: 'FarmPay Platform Operations',
      businessType: 'Platform Governance & Escrow Admin',
    });

    // 2. Create 5 Farmers
    const farmersData = [
      {
        name: 'Ram Kumar',
        email: 'ram.farmer@farmpay.demo',
        phone: '+91 98111 22334',
        password: hashedPassword,
        role: 'FARMER',
        location: 'Ludhiana, Punjab',
        businessName: 'Golden Fields Agriculture Co.',
        businessType: 'Organic Grains & Oilseeds',
        rating: 4.8,
        ratingCount: 38,
        bankAccount: {
          accountHolderName: 'Ram Kumar',
          accountNumber: 'XXXX-XXXX-4819',
          ifscCode: 'PUNB0123400',
          razorpayFundAccountId: 'fa_demo_ram_01',
        },
      },
      {
        name: 'Sita Devi',
        email: 'sita.farmer@farmpay.demo',
        phone: '+91 98222 33445',
        password: hashedPassword,
        role: 'FARMER',
        location: 'Nashik, Maharashtra',
        businessName: 'Devi Agro Farms',
        businessType: 'Horticulture & Fresh Vegetables',
        rating: 4.9,
        ratingCount: 52,
        bankAccount: {
          accountHolderName: 'Sita Devi',
          accountNumber: 'XXXX-XXXX-9901',
          ifscCode: 'MAHB0000123',
          razorpayFundAccountId: 'fa_demo_sita_02',
        },
      },
      {
        name: 'Gurpreet Singh',
        email: 'gurpreet.farmer@farmpay.demo',
        phone: '+91 98333 44556',
        password: hashedPassword,
        role: 'FARMER',
        location: 'Karnal, Haryana',
        businessName: 'Karnal Heritage Basmati Farms',
        businessType: 'Premium Basmati & Pulses',
        rating: 4.7,
        ratingCount: 29,
        bankAccount: {
          accountHolderName: 'Gurpreet Singh',
          accountNumber: 'XXXX-XXXX-6120',
          ifscCode: 'HDFC0001890',
          razorpayFundAccountId: 'fa_demo_gurpreet_03',
        },
      },
      {
        name: 'Rajesh Patel',
        email: 'rajesh.farmer@farmpay.demo',
        phone: '+91 98444 55667',
        password: hashedPassword,
        role: 'FARMER',
        location: 'Rajkot, Gujarat',
        businessName: 'Saurashtra Farmers Collective',
        businessType: 'Spices, Groundnuts & Oilseeds',
        rating: 4.9,
        ratingCount: 44,
        bankAccount: {
          accountHolderName: 'Rajesh Patel',
          accountNumber: 'XXXX-XXXX-7341',
          ifscCode: 'BARB0RAJKOT',
          razorpayFundAccountId: 'fa_demo_rajesh_04',
        },
      },
      {
        name: 'Ananya Sharma',
        email: 'ananya.farmer@farmpay.demo',
        phone: '+91 98555 66778',
        password: hashedPassword,
        role: 'FARMER',
        location: 'Shimla, Himachal Pradesh',
        businessName: 'Himalayan Organic Orchards',
        businessType: 'Highland Apples & Stone Fruits',
        rating: 5.0,
        ratingCount: 19,
        bankAccount: {
          accountHolderName: 'Ananya Sharma',
          accountNumber: 'XXXX-XXXX-3342',
          ifscCode: 'SBIN0005511',
          razorpayFundAccountId: 'fa_demo_ananya_05',
        },
      },
    ];

    const farmers = await User.insertMany(farmersData);

    // 3. Create 5 Buyers
    const buyersData = [
      {
        name: 'Rohit Mehta',
        email: 'rohit.buyer@farmpay.demo',
        phone: '+91 97111 88990',
        password: hashedPassword,
        role: 'BUYER',
        location: 'Delhi NCR',
        businessName: 'Kisan Mandi Wholesale Traders',
        businessType: 'Regional Produce Wholesaler',
      },
      {
        name: 'Priya Nair',
        email: 'priya.buyer@farmpay.demo',
        phone: '+91 97222 77889',
        password: hashedPassword,
        role: 'BUYER',
        location: 'Bengaluru, Karnataka',
        businessName: 'FreshBite Organic Retail Chain',
        businessType: 'Urban Supermarket Chain',
      },
      {
        name: 'Vikram Sethi',
        email: 'vikram.buyer@farmpay.demo',
        phone: '+91 97333 66778',
        password: hashedPassword,
        role: 'BUYER',
        location: 'Mumbai, Maharashtra',
        businessName: 'Apex Food Processing Ltd.',
        businessType: 'Food Manufacturer & Exporter',
      },
      {
        name: 'Anita Rao',
        email: 'anita.buyer@farmpay.demo',
        phone: '+91 97444 55667',
        password: hashedPassword,
        role: 'BUYER',
        location: 'Hyderabad, Telangana',
        businessName: 'Deccan Spice & Grain Mart',
        businessType: 'Institutional Supply Partner',
      },
      {
        name: 'Amit Verma',
        email: 'amit.buyer@farmpay.demo',
        phone: '+91 97555 44332',
        password: hashedPassword,
        role: 'BUYER',
        location: 'Kanpur, Uttar Pradesh',
        businessName: 'Verma Fresh Produce Depot',
        businessType: 'B2B Restaurant Supplier',
      },
    ];

    const buyers = await User.insertMany(buyersData);

    // 4. Create 16 Produce Listings
    const produceListingsData = [
      {
        farmerId: farmers[0]._id, // Ram Kumar
        cropName: 'Sharbati Wheat',
        category: 'Grains',
        description: 'Golden, premium grade Sharbati wheat grains from Punjab soil. Naturally sun-dried, pesticide-safe, zero stones.',
        quantityAvailable: 2400,
        unit: 'kg',
        pricePerUnit: 25,
        marketReferencePrice: 22,
        harvestDate: new Date('2026-03-15'),
        location: 'Ludhiana, Punjab',
        image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80',
        status: 'AVAILABLE',
      },
      {
        farmerId: farmers[0]._id,
        cropName: 'Yellow Mustard Seeds',
        category: 'Oilseeds',
        description: 'High oil yield native yellow sarson (mustard seeds). Pungent aroma, cold-press grade.',
        quantityAvailable: 850,
        unit: 'kg',
        pricePerUnit: 58,
        marketReferencePrice: 52,
        harvestDate: new Date('2026-02-28'),
        location: 'Ludhiana, Punjab',
        image: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=600&q=80',
        status: 'AVAILABLE',
      },
      {
        farmerId: farmers[1]._id, // Sita Devi
        cropName: 'Vine-Ripened Hybrid Tomatoes',
        category: 'Vegetables',
        description: 'Firm, juicy grade-A hybrid tomatoes. Long shelf life, ideal for bulk shipping and retail display.',
        quantityAvailable: 1500,
        unit: 'kg',
        pricePerUnit: 30,
        marketReferencePrice: 28,
        harvestDate: new Date('2026-03-20'),
        location: 'Nashik, Maharashtra',
        image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
        status: 'AVAILABLE',
      },
      {
        farmerId: farmers[1]._id,
        cropName: 'Nashik Red Onions',
        category: 'Vegetables',
        description: 'Authentic medium-to-large Nashik red onions with thick skin and low moisture for exceptional storage life.',
        quantityAvailable: 3200,
        unit: 'kg',
        pricePerUnit: 26,
        marketReferencePrice: 24,
        harvestDate: new Date('2026-03-10'),
        location: 'Nashik, Maharashtra',
        image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=600&q=80',
        status: 'AVAILABLE',
      },
      {
        farmerId: farmers[2]._id, // Gurpreet Singh
        cropName: 'Traditional Basmati Rice (1121)',
        category: 'Grains',
        description: 'Extra-long grain 1121 aged basmati rice. Fluffy texture, pristine white, signature fragrance.',
        quantityAvailable: 1800,
        unit: 'kg',
        pricePerUnit: 78,
        marketReferencePrice: 72,
        harvestDate: new Date('2026-01-20'),
        location: 'Karnal, Haryana',
        image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
        status: 'AVAILABLE',
      },
      {
        farmerId: farmers[2]._id,
        cropName: 'Desi Chickpeas (Chana)',
        category: 'Pulses',
        description: 'Unpolished desi brown chickpeas rich in protein and fiber. Uniform grain size.',
        quantityAvailable: 950,
        unit: 'kg',
        pricePerUnit: 64,
        marketReferencePrice: 60,
        harvestDate: new Date('2026-02-10'),
        location: 'Karnal, Haryana',
        image: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=600&q=80',
        status: 'AVAILABLE',
      },
      {
        farmerId: farmers[3]._id, // Rajesh Patel
        cropName: 'Bold Groundnuts (Peanuts)',
        category: 'Oilseeds',
        description: 'Saurashtra bold peanut kernels. High protein, clean shelled, crunchy texture.',
        quantityAvailable: 1200,
        unit: 'kg',
        pricePerUnit: 72,
        marketReferencePrice: 68,
        harvestDate: new Date('2026-02-18'),
        location: 'Rajkot, Gujarat',
        image: 'https://images.unsplash.com/photo-1567894340315-735d7c361db0?auto=format&fit=crop&w=600&q=80',
        status: 'AVAILABLE',
      },
      {
        farmerId: farmers[3]._id,
        cropName: 'Guntur Stemless Red Chillies',
        category: 'Spices',
        description: 'Sun-dried vibrant deep red chillies. High pungency, natural capsaicin, zero artificial color.',
        quantityAvailable: 450,
        unit: 'kg',
        pricePerUnit: 145,
        marketReferencePrice: 140,
        harvestDate: new Date('2026-02-05'),
        location: 'Rajkot, Gujarat',
        image: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=600&q=80',
        status: 'AVAILABLE',
      },
      {
        farmerId: farmers[4]._id, // Ananya Sharma
        cropName: 'Royal Delicious Himalayan Apples',
        category: 'Fruits',
        description: 'Crisp, hand-picked mountain apples from Shimla orchards. Naturally sweet, graded A++.',
        quantityAvailable: 1100,
        unit: 'kg',
        pricePerUnit: 110,
        marketReferencePrice: 95,
        harvestDate: new Date('2026-03-01'),
        location: 'Shimla, Himachal Pradesh',
        image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80',
        status: 'AVAILABLE',
      },
      {
        farmerId: farmers[4]._id,
        cropName: 'Kashmiri Walnuts In Shell',
        category: 'Fruits',
        description: 'Thin-shell organic walnuts with high oil concentration and brain-boosting omega-3.',
        quantityAvailable: 350,
        unit: 'kg',
        pricePerUnit: 280,
        marketReferencePrice: 260,
        harvestDate: new Date('2026-01-15'),
        location: 'Shimla, Himachal Pradesh',
        image: 'https://images.unsplash.com/photo-1543208543-60423e76949a?auto=format&fit=crop&w=600&q=80',
        status: 'AVAILABLE',
      },
      {
        farmerId: farmers[1]._id,
        cropName: 'Chipsona Potatoes',
        category: 'Vegetables',
        description: 'Low sugar, high dry matter potatoes preferred by chip makers and commercial kitchens.',
        quantityAvailable: 4000,
        unit: 'kg',
        pricePerUnit: 20,
        marketReferencePrice: 18,
        harvestDate: new Date('2026-03-05'),
        location: 'Nashik, Maharashtra',
        image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80',
        status: 'AVAILABLE',
      },
      {
        farmerId: farmers[0]._id,
        cropName: 'Green Sweet Peas',
        category: 'Vegetables',
        description: 'Farm-fresh sweet green peas pods. Tender, naturally sweet, harvested early morning.',
        quantityAvailable: 600,
        unit: 'kg',
        pricePerUnit: 42,
        marketReferencePrice: 40,
        harvestDate: new Date('2026-03-22'),
        location: 'Ludhiana, Punjab',
        image: 'https://images.unsplash.com/photo-1587735243615-c03f25aaff15?auto=format&fit=crop&w=600&q=80',
        status: 'AVAILABLE',
      },
      {
        farmerId: farmers[3]._id,
        cropName: 'Salem Turmeric Fingers',
        category: 'Spices',
        description: 'Aromatic turmeric fingers with 4.5%+ curcumin content. Lab certified purity.',
        quantityAvailable: 700,
        unit: 'kg',
        pricePerUnit: 120,
        marketReferencePrice: 110,
        harvestDate: new Date('2026-02-12'),
        location: 'Rajkot, Gujarat',
        image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80',
        status: 'AVAILABLE',
      },
      {
        farmerId: farmers[2]._id,
        cropName: 'Yellow Pigeon Peas (Toor Dal)',
        category: 'Pulses',
        description: 'Cleaned unpolished toor dal with no artificial colors or chemical coatings.',
        quantityAvailable: 1200,
        unit: 'kg',
        pricePerUnit: 98,
        marketReferencePrice: 92,
        harvestDate: new Date('2026-02-25'),
        location: 'Karnal, Haryana',
        image: 'https://images.unsplash.com/photo-1585994192701-f1a505c8574a?auto=format&fit=crop&w=600&q=80',
        status: 'AVAILABLE',
      },
      {
        farmerId: farmers[0]._id,
        cropName: 'Soybean Seeds',
        category: 'Oilseeds',
        description: 'Cleaned, high protein yellow soybean seeds suitable for soy milk or oil crushing.',
        quantityAvailable: 1500,
        unit: 'kg',
        pricePerUnit: 50,
        marketReferencePrice: 48,
        harvestDate: new Date('2026-03-02'),
        location: 'Ludhiana, Punjab',
        image: 'https://images.unsplash.com/photo-1599588607421-2e63c0a498dc?auto=format&fit=crop&w=600&q=80',
        status: 'AVAILABLE',
      },
      {
        farmerId: farmers[1]._id,
        cropName: 'Fresh Crunchy Carrots',
        category: 'Vegetables',
        description: 'Red, naturally sweet winter carrots. Thoroughly washed and crate-packed.',
        quantityAvailable: 1200,
        unit: 'kg',
        pricePerUnit: 28,
        marketReferencePrice: 25,
        harvestDate: new Date('2026-03-12'),
        location: 'Nashik, Maharashtra',
        image: 'https://images.unsplash.com/photo-1447175008436-054170c2e979?auto=format&fit=crop&w=600&q=80',
        status: 'AVAILABLE',
      },
    ];

    const produceDocs = await Produce.insertMany(produceListingsData);

    // 5. Seed Orders covering ALL state machine transitions
    console.log('Seeding demo orders across all lifecycle states...');

    // Order 1: PENDING_PAYMENT
    const order1 = await Order.create({
      orderNumber: 'FP-100001-382',
      buyerId: buyers[0]._id, // Rohit Mehta
      farmerId: farmers[0]._id, // Ram Kumar
      produceId: produceDocs[0]._id, // Sharbati Wheat
      quantity: 100,
      unitPrice: 25,
      totalAmount: 2500,
      deliveryDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      deliveryAddress: { street: 'Wholesale Mandi Gate 4', city: 'Delhi', state: 'Delhi', pincode: '110001' },
      status: 'PENDING_PAYMENT',
      paymentStatus: 'PENDING',
      deliveryStatus: 'NOT_STARTED',
      disputeStatus: 'NONE',
    });
    await AuditLog.create({
      orderId: order1._id,
      userId: buyers[0]._id,
      action: 'Order Created',
      metadata: { quantity: 100, totalAmount: 2500 },
    });

    // Order 2: PAYMENT_SECURED
    const order2 = await Order.create({
      orderNumber: 'FP-100002-491',
      buyerId: buyers[1]._id, // Priya Nair
      farmerId: farmers[1]._id, // Sita Devi
      produceId: produceDocs[2]._id, // Tomatoes
      quantity: 150,
      unitPrice: 30,
      totalAmount: 4500,
      deliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      deliveryAddress: { street: '12 Brigade Road', city: 'Bengaluru', state: 'Karnataka', pincode: '560001' },
      status: 'PAYMENT_SECURED',
      paymentStatus: 'SECURED',
      deliveryStatus: 'PROCESSING',
      disputeStatus: 'NONE',
      razorpayOrderId: 'order_demo_2001',
      razorpayPaymentId: 'pay_demo_2001_sec',
    });
    await Payment.create({
      orderId: order2._id,
      amount: 4500,
      status: 'CAPTURED',
      razorpayOrderId: 'order_demo_2001',
      razorpayPaymentId: 'pay_demo_2001_sec',
      razorpaySignature: 'DEMO_SIGNATURE_2001',
    });
    await AuditLog.create({
      orderId: order2._id,
      userId: buyers[1]._id,
      action: 'Order Created',
      metadata: { quantity: 150, totalAmount: 4500 },
    });
    await AuditLog.create({
      orderId: order2._id,
      userId: buyers[1]._id,
      action: 'Payment Secured',
      metadata: { amount: 4500, escrowStatus: 'Active' },
    });

    // Order 3: OUT_FOR_DELIVERY
    const order3 = await Order.create({
      orderNumber: 'FP-100003-882',
      buyerId: buyers[2]._id, // Vikram Sethi
      farmerId: farmers[2]._id, // Gurpreet Singh
      produceId: produceDocs[4]._id, // Basmati Rice
      quantity: 200,
      unitPrice: 78,
      totalAmount: 15600,
      deliveryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      deliveryAddress: { street: 'Warehouse 9, Navi Mumbai', city: 'Mumbai', state: 'Maharashtra', pincode: '400705' },
      status: 'OUT_FOR_DELIVERY',
      paymentStatus: 'SECURED',
      deliveryStatus: 'OUT_FOR_DELIVERY',
      disputeStatus: 'NONE',
      razorpayOrderId: 'order_demo_3001',
      razorpayPaymentId: 'pay_demo_3001_sec',
    });
    await Payment.create({
      orderId: order3._id,
      amount: 15600,
      status: 'CAPTURED',
      razorpayOrderId: 'order_demo_3001',
      razorpayPaymentId: 'pay_demo_3001_sec',
    });
    await AuditLog.create({ orderId: order3._id, userId: buyers[2]._id, action: 'Order Created' });
    await AuditLog.create({ orderId: order3._id, userId: buyers[2]._id, action: 'Payment Secured', metadata: { amount: 15600 } });
    await AuditLog.create({ orderId: order3._id, userId: farmers[2]._id, action: 'Farmer Processing' });
    await AuditLog.create({ orderId: order3._id, userId: farmers[2]._id, action: 'Delivery Initiated', metadata: { courier: 'FarmPay FastLogistics' } });

    // Order 4: DELIVERED_PENDING_CONFIRMATION (with mock OTP ready)
    const order4Deadline = new Date(Date.now() + 20 * 60 * 60 * 1000); // 20 hours remaining in 24h window
    const order4 = await Order.create({
      orderNumber: 'FP-100004-512',
      buyerId: buyers[0]._id, // Rohit Mehta
      farmerId: farmers[1]._id, // Sita Devi
      produceId: produceDocs[3]._id, // Red Onions
      quantity: 300,
      unitPrice: 26,
      totalAmount: 7800,
      deliveryDate: new Date(),
      deliveryAddress: { street: 'Fruit & Veg Terminal 2', city: 'Delhi', state: 'Delhi', pincode: '110033' },
      status: 'DELIVERED_PENDING_CONFIRMATION',
      paymentStatus: 'SECURED',
      deliveryStatus: 'DELIVERED_PENDING_CONFIRMATION',
      disputeStatus: 'NONE',
      releaseDeadline: order4Deadline,
      razorpayOrderId: 'order_demo_4001',
      razorpayPaymentId: 'pay_demo_4001_sec',
    });
    await Payment.create({
      orderId: order4._id,
      amount: 7800,
      status: 'CAPTURED',
      razorpayOrderId: 'order_demo_4001',
      razorpayPaymentId: 'pay_demo_4001_sec',
    });
    // Create Mock OTP for Order 4: 742189
    const demoOTPCode = '742189';
    await OTP.create({
      orderId: order4._id,
      codeHash: hashOTP(demoOTPCode),
      rawDemoCode: demoOTPCode,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      attempts: 0,
    });
    await AuditLog.create({ orderId: order4._id, userId: buyers[0]._id, action: 'Order Created' });
    await AuditLog.create({ orderId: order4._id, userId: buyers[0]._id, action: 'Payment Secured', metadata: { amount: 7800 } });
    await AuditLog.create({ orderId: order4._id, userId: farmers[1]._id, action: 'Delivery Initiated' });
    await AuditLog.create({
      orderId: order4._id,
      userId: farmers[1]._id,
      action: 'Delivery Marked - OTP Dispatched',
      metadata: { demoOTP: demoOTPCode, releaseDeadline: order4Deadline },
    });

    // Order 5: COMPLETED (Delivery Confirmed with OTP -> Payout Completed)
    const order5 = await Order.create({
      orderNumber: 'FP-100005-920',
      buyerId: buyers[3]._id, // Anita Rao
      farmerId: farmers[3]._id, // Rajesh Patel
      produceId: produceDocs[7]._id, // Red Chillies
      quantity: 50,
      unitPrice: 145,
      totalAmount: 7250,
      deliveryDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      deliveryAddress: { street: 'Charminar Agro Zone 4', city: 'Hyderabad', state: 'Telangana', pincode: '500002' },
      status: 'COMPLETED',
      paymentStatus: 'RELEASED',
      deliveryStatus: 'CONFIRMED_DELIVERED',
      disputeStatus: 'NONE',
      razorpayOrderId: 'order_demo_5001',
      razorpayPaymentId: 'pay_demo_5001_sec',
    });
    await Payment.create({
      orderId: order5._id,
      amount: 7250,
      status: 'CAPTURED',
      razorpayOrderId: 'order_demo_5001',
      razorpayPaymentId: 'pay_demo_5001_sec',
    });
    const payout5 = await Payout.create({
      orderId: order5._id,
      farmerId: farmers[3]._id,
      amount: 7250,
      status: 'PAYOUT_COMPLETED',
      razorpayReferenceId: 'pout_demo_ref_5001',
      isDemoMode: true,
    });
    await Rating.create({
      orderId: order5._id,
      fromUserId: buyers[3]._id,
      toUserId: farmers[3]._id,
      rating: 5,
      review: 'Superior spice quality! Delivered on time in air-tight packing. Smooth OTP confirmation.',
    });
    await AuditLog.create({ orderId: order5._id, userId: buyers[3]._id, action: 'Order Created' });
    await AuditLog.create({ orderId: order5._id, userId: buyers[3]._id, action: 'Payment Secured' });
    await AuditLog.create({ orderId: order5._id, userId: farmers[3]._id, action: 'Delivery Initiated' });
    await AuditLog.create({ orderId: order5._id, userId: buyers[3]._id, action: 'OTP Verified' });
    await AuditLog.create({ orderId: order5._id, userId: buyers[3]._id, action: 'Delivery Confirmed' });
    await AuditLog.create({
      orderId: order5._id,
      userId: farmers[3]._id,
      action: 'Payout Completed',
      metadata: { amount: 7250, reference: payout5.razorpayReferenceId, isDemoMode: true },
    });

    // Order 6: DISPUTED (Buyer claims quantity mismatch -> Automatic release blocked)
    const order6 = await Order.create({
      orderNumber: 'FP-100006-218',
      buyerId: buyers[4]._id, // Amit Verma
      farmerId: farmers[0]._id, // Ram Kumar
      produceId: produceDocs[0]._id, // Wheat
      quantity: 120,
      unitPrice: 25,
      totalAmount: 3000,
      deliveryDate: new Date(),
      deliveryAddress: { street: 'Transport Nagar Depot', city: 'Kanpur', state: 'Uttar Pradesh', pincode: '208001' },
      status: 'DISPUTED',
      paymentStatus: 'SECURED',
      deliveryStatus: 'DELIVERED_PENDING_CONFIRMATION',
      disputeStatus: 'OPEN',
      razorpayOrderId: 'order_demo_6001',
      razorpayPaymentId: 'pay_demo_6001_sec',
    });
    await Payment.create({
      orderId: order6._id,
      amount: 3000,
      status: 'CAPTURED',
      razorpayOrderId: 'order_demo_6001',
      razorpayPaymentId: 'pay_demo_6001_sec',
    });
    await Dispute.create({
      orderId: order6._id,
      buyerId: buyers[4]._id,
      farmerId: farmers[0]._id,
      reason: 'Quantity mismatch',
      description: 'Ordered 120 kg of Sharbati wheat, but upon weighing at delivery received only 84 kg (36 kg shortage). Requesting ₹900 partial refund.',
      refundAmount: 900,
      status: 'OPEN',
    });
    await AuditLog.create({ orderId: order6._id, userId: buyers[4]._id, action: 'Order Created' });
    await AuditLog.create({ orderId: order6._id, userId: buyers[4]._id, action: 'Payment Secured', metadata: { amount: 3000 } });
    await AuditLog.create({ orderId: order6._id, userId: farmers[0]._id, action: 'Delivery Initiated' });
    await AuditLog.create({
      orderId: order6._id,
      userId: buyers[4]._id,
      action: 'Dispute Opened',
      metadata: { reason: 'Quantity mismatch', requestedRefund: 900, note: 'Automatic 24h release blocked.' },
    });

    // Order 7: REFUNDED (Full refund resolved by Admin)
    const order7 = await Order.create({
      orderNumber: 'FP-100007-744',
      buyerId: buyers[1]._id, // Priya Nair
      farmerId: farmers[4]._id, // Ananya Sharma
      produceId: produceDocs[8]._id, // Apples
      quantity: 50,
      unitPrice: 110,
      totalAmount: 5500,
      deliveryDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      deliveryAddress: { street: 'Koramangala 4th Block', city: 'Bengaluru', state: 'Karnataka', pincode: '560034' },
      status: 'REFUNDED',
      paymentStatus: 'REFUNDED',
      deliveryStatus: 'NOT_STARTED',
      disputeStatus: 'RESOLVED_REFUND',
      razorpayOrderId: 'order_demo_7001',
      razorpayPaymentId: 'pay_demo_7001_sec',
    });
    await Payment.create({
      orderId: order7._id,
      amount: 5500,
      status: 'REFUNDED',
      razorpayOrderId: 'order_demo_7001',
      razorpayPaymentId: 'pay_demo_7001_sec',
    });
    await Dispute.create({
      orderId: order7._id,
      buyerId: buyers[1]._id,
      farmerId: farmers[4]._id,
      reason: 'Damaged produce',
      description: 'Transit vehicle met with rain and crates were crushed and soaked.',
      refundAmount: 5500,
      status: 'RESOLVED_REFUND',
      resolution: {
        notes: 'Damage verified with transit photographs. Full refund processed.',
        resolvedBy: admin._id,
        refundAmount: 5500,
        farmerPayoutAmount: 0,
        resolvedAt: new Date(),
      },
    });
    await AuditLog.create({ orderId: order7._id, userId: buyers[1]._id, action: 'Order Created' });
    await AuditLog.create({ orderId: order7._id, userId: buyers[1]._id, action: 'Payment Secured', metadata: { amount: 5500 } });
    await AuditLog.create({ orderId: order7._id, userId: buyers[1]._id, action: 'Dispute Opened' });
    await AuditLog.create({ orderId: order7._id, userId: admin._id, action: 'Refund Completed', metadata: { amount: 5500, status: 'Full Refund' } });
    await AuditLog.create({ orderId: order7._id, userId: admin._id, action: 'Dispute Resolved', metadata: { action: 'FULL_REFUND', refundAmount: 5500 } });

    console.log('--- Seed Data Successfully Inserted! ---');
    console.log(`Farmers: ${farmers.length}`);
    console.log(`Buyers: ${buyers.length}`);
    console.log(`Produce items: ${produceDocs.length}`);
    console.log('Orders created across 7 lifecycle states:');
    console.log('  1. PENDING_PAYMENT (Order #FP-100001-382)');
    console.log('  2. PAYMENT_SECURED (Order #FP-100002-491)');
    console.log('  3. OUT_FOR_DELIVERY (Order #FP-100003-882)');
    console.log('  4. DELIVERED_PENDING_CONFIRMATION (Order #FP-100004-512) - Demo OTP: 742189');
    console.log('  5. COMPLETED & RELEASED (Order #FP-100005-920)');
    console.log('  6. DISPUTED (Order #FP-100006-218) - Active dispute, auto-release blocked');
    console.log('  7. REFUNDED (Order #FP-100007-744)');

    return {
      admin,
      farmers,
      buyers,
      produceCount: produceDocs.length,
    };
  } catch (error) {
    console.error('Seed database error:', error);
    throw error;
  }
};

if (require.main === module) {
  seedDatabase().then(() => {
    process.exit(0);
  }).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { seedDatabase };

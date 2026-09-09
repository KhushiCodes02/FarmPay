const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email, name: user.name },
    process.env.JWT_SECRET || 'farmpay_super_secret_jwt_key_2026_buildathon_secure',
    { expiresIn: '7d' }
  );
};

const register = async (req, res) => {
  try {
    const { name, email, phone, password, role, location, businessName, businessType } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'A user with this email already exists.' });
    }
    const assignedRole = ['FARMER', 'BUYER', 'ADMIN'].includes(role) ? role : 'BUYER';
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      password,
      role: assignedRole,
      location: location || 'India',
      businessName,
      businessType,
      bankAccount: assignedRole === 'FARMER' ? {
        accountHolderName: name,
        accountNumber: 'XXXX-XXXX-8921',
        ifscCode: 'SBIN0001234',
        razorpayFundAccountId: 'fa_demo_farmer_01'
      } : undefined
    });
    const token = generateToken(user);
    return res.status(201).json({ message: 'Registration successful', token, user: user.toJSON() });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Registration failed' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials. User not found.' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials. Incorrect password.' });
    }
    const token = generateToken(user);
    return res.json({ message: 'Login successful', token, user: user.toJSON() });
  } catch (error) {
    return res.status(500).json({ error: 'Login error' });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json({ user: user.toJSON() });
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const allowed = ['name', 'phone', 'location', 'businessName', 'businessType', 'bankAccount'];
    const updates = {};
    for (const f of allowed) {
      if (req.body[f] !== undefined) updates[f] = req.body[f];
    }
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true });
    return res.json({ message: 'Profile updated', user: user.toJSON() });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = { register, login, getMe, updateProfile };

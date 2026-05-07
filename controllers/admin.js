const User = require('../models/Users.js');
const Medicine = require('../models/Medicines.js');
const Order = require('../models/Orders.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const upload = require('../config/cloudinary');
const Request = require('../models/Request');

// Upload image middleware
exports.uploadImage = upload.single('imageURL');

exports.createUser = async (req, res) => {
  const { name, pharmacy, email, password, role } = req.body;

  // Hashing Password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Handle Image Upload
  let imageURL = '';
  if (req.file) {
    imageURL = req.file.path;
  }

  try {
    const newUser = new User({
      name,
      pharmacy,
      email,
      password: hashedPassword,
      role,
      imageURL, // Save the image URL
    });

    await newUser.save();
    res
      .status(201)
      .json({ status: 'success', message: 'User created successfully' });
  } catch (err) {
    res.status(400).send('Error creating user: ' + err.message);
  }
};

exports.sendDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalMedicines = await Medicine.countDocuments();
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const approvedOrders = await Order.countDocuments({ status: 'approved' });
    const cancelledOrders = await Order.countDocuments({ status: 'cancelled' });

    const orders = await Order.find({ status: 'pending' })
      .sort({ createAt: -1 })
      .limit(5)
      .populate('user', 'name')
      .populate('medicineId', 'name');

    res.render('admin-dashboard', {
      totalUsers,
      totalMedicines,
      orders,
      totalOrders,
      pendingOrders,
      approvedOrders,
      cancelledOrders,
    });
  } catch (err) {
    res.send(err);
  }
};

exports.sendUsersPage = async (req, res) => {
  const users = await User.find({});
  res.render('admin-users', { users });
};

exports.sendOrdersPage = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createAt: -1 })
      .populate('user', 'name')
      .populate('medicineId', 'name');

    const orderDate = new Date(orders.createdAt).toLocaleDateString('en-US', {
      timeZone: 'UTC',
    });

    res.render('admin-orders', { orders, orderDate });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.sendMedicinesPage = async (req, res) => {
  try {
    const medicines = await Medicine.find().sort({ createAt: -1 });

    res.render('admin-medicines', { medicines });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.login = (req, res) => {
  res.render('admin-login');
};

exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find the user
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // 2. Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: 'Invalid credentials' });

    // 3. Sign jwt
    const payload = { id: user._id, username: user.name, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '365d',
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 365,
    });

    res.redirect('/admin/dashboard');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.logoutAdmin = (req, res) => {
  res.clearCookie('token');
  res.redirect('/');
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // 1. Find the user first to check their email/role
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 2. Prevent deletion of the master admin (replace with your desired admin email)
    if (user.email === 'suhrab@gmail.com') {
      return res.status(403).json({ message: 'Action restricted: This admin cannot be deleted.' });
    }

    // 3. Delete from Database
    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: 'User deleted successfully!' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ==========================================
//  EXISTING: CREATE MEDICINE
// ==========================================
exports.createMedicine = async (req, res) => {
  try {
    // 1. Get isPublished from the form data
    const { name, companyName, price, stockQuantity, isPublished } = req.body;

    let imageString = '';

    if (req.file) {
      imageString = req.file.path;
    } else {
      imageString = 'https://placehold.co/400?text=No+Image';
    }

    const newMedicine = new Medicine({
      name,
      companyName,
      price,
      stockQuantity,
      imageURL: imageString,
      // 2. Map 'isPublished' (string "true"/"false") to 'public' (Boolean)
      public: isPublished === 'true',
    });

    await newMedicine.save();

    res
      .status(201)
      .json({ status: 'success', message: 'Medicine created successfully!' });
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: `Error: ${error.message}` });
  }
};

// ==========================================
//  NEW: DELETE MEDICINE
// ==========================================
exports.deleteMedicine = async (req, res) => {
  try {
    const { id } = req.params; // Get ID from URL (/admin/medicines/:id)

    const deleted = await Medicine.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    res.status(200).json({ message: 'Medicine deleted successfully' });
  } catch (error) {
    console.error('Delete Error:', error);
    res.status(500).json({ message: 'Server error during deletion' });
  }
};

// ==========================================
//  NEW: UPDATE MEDICINE
// ==========================================
exports.updateMedicine = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, companyName, price, stockQuantity } = req.body;

    const medicine = await Medicine.findById(id);
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    // Update text fields
    medicine.name = name;
    medicine.companyName = companyName;
    medicine.price = price;
    medicine.stockQuantity = stockQuantity;

    // Check if a NEW image was uploaded
    if (req.file) {
      // NEW WAY: Just use the path
      medicine.imageURL = req.file.path;
    }

    await medicine.save();

    res.status(200).json({ message: 'Medicine updated successfully' });
  } catch (error) {
    console.error('Update Error:', error);
    res.status(500).json({ message: 'Server error during update' });
  }
};

// ==========================================
//  NEW: UPDATE ORDER STATUS
// ==========================================
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'approved' or 'cancelled'

    // 1. Validate Status
    const validStatuses = ['approved', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status update' });
    }

    // 2. Find and Update
    // { new: true } returns the updated document, though we don't strictly need it here
    const order = await Order.findByIdAndUpdate(
      id,
      { status: status },
      { new: true },
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({
      message: `Order marked as ${status}`,
      order: order,
    });
  } catch (error) {
    console.error('Order Update Error:', error);
    res.status(500).json({ message: 'Server error updating order' });
  }
};

// 1. GET ALL REQUESTS
exports.getRequests = async (req, res) => {
  try {
    const requests = await Request.find()
      .populate('user', 'name') // Get the user's name
      .sort({ createdAt: -1 }); // Newest first

    res.render('admin-requests', {
      requests,
      title: 'Manage Requests',
      page: 'requests', // For highlighting sidebar
      adminName: req.user.name,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// 2. UPDATE REQUEST STATUS (Approve/Reject)
exports.updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'approved' or 'rejected'

    await Request.findByIdAndUpdate(id, { status });
    res.json({ message: `Request ${status} successfully` });
  } catch (err) {
    res.status(500).json({ message: 'Error updating status' });
  }
};

exports.getSettings = async (req, res) => {
  try {
    // Fetch fresh user data from DB to get the image
    const user = await User.findById(req.user.id);
    const name = user ? user.name : 'Admin';

    res.render('admin-settings', {
      title: 'Settings',
      page: 'settings',
      adminName: name,
      user: user, // Pass the full user object to the view
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// ==========================================
// DELETE REQUEST
// ==========================================
exports.deleteRequest = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Find Request
    const request = await Request.findById(id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    // 2. Delete from Database
    await Request.findByIdAndDelete(id);

    res.status(200).json({ message: 'Request deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// ==========================================
// DELETE ORDER
// ==========================================
exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Find Order
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // 2. Delete from Database
    await Order.findByIdAndDelete(id);

    res.status(200).json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

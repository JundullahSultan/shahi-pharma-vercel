const User = require('../models/Users');
const Order = require('../models/Orders');
const Medicine = require('../models/Medicines');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Request = require('../models/Request');

exports.userLogin = (req, res) => {
  res.render('user/login');
};

exports.userLoginVerify = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find the user
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role !== 'user')
      return res.status(403).json({ message: 'Users only' });

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
      maxAge: 31536000000,
    });

    res.redirect('/user/dashboard');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.sendDashboard = async (req, res) => {
  try {
    const medicines = await Medicine.find();
    const user = await User.findById(req.user.id);

    res.render('user/user-medicine', { medicines, user });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.sendRequestPage = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.render('user/request', { user });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.createRequest = async (req, res) => {
  try {
    const { requests } = req.body;

    // Validate that we received an array of requests
    if (!requests || !Array.isArray(requests) || requests.length === 0) {
      return res.status(400).json({ message: 'No requests provided' });
    }

    // Map over the array to build Mongoose documents, attaching the logged-in User's ID
    const newRequests = requests.map(reqData => ({
      user: req.user.id,
      medicineName: reqData.medicineName,
      companyName: reqData.companyName,
      quantity: reqData.quantity,
      shapeAndDose: reqData.shapeAndDose,
      tradeName: reqData.tradeName,
      scientificName: reqData.scientificName,
      description: reqData.description,
    }));

    // Insert all documents at once into MongoDB
    await Request.insertMany(newRequests);

    res.status(201).json({ message: 'Requests sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error sending request' });
  }
};

exports.getMyRequests = async (req, res) => {
  try {
    // 1. Fetch the Full User Details (to get 'name' properly)
    const user = await User.findById(req.user.id);

    // 2. Fetch the Requests
    const requests = await Request.find({ user: req.user.id }).sort({
      createdAt: -1,
    });

    res.render('user/user-requests', {
      requests,
      user: user, // Now this 'user' object has a .name property
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

exports.createOrder = async (req, res) => {
  try {
    // 1. Get User ID from the session (Assumes you use Passport.js or similar auth)
    // If you are using simple sessions, it might be req.session.userId
    const user = req.user.id;

    const { medicineId, quantity, price } = req.body;

    if (!user || !medicineId || !quantity || !price) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const totalPrice = price * quantity;

    // 3. Create the new Order object
    const newOrder = new Order({
      user: user, // Links to the logged-in user
      medicineId: medicineId, // Links to the specific medicine
      quantity: quantity,
      status: 'pending', // Optional, since default is already 'Pending'
      price: price,
      totalPrice,
    });

    // 4. Save to Database
    await newOrder.save();

    // 5. Send success response back to frontend
    res.status(200).send('Order placed successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error placing order');
  }
};

exports.userLogut = (req, res) => {
  res.clearCookie('token');
  res.redirect('/');
};

exports.getMyOrders = async (req, res) => {
  try {
    // 1. Fetch the Full User (so we get .name for the header)
    const user = await User.findById(req.user.id);

    // 2. Fetch Orders
    const orders = await Order.find({ user: req.user.id })
      .populate('medicineId')
      .sort({ createdAt: -1 });

    res.render('user/user-orders', {
      orders,
      user: user, // Now passing the full user object with .name
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

exports.getSettings = async (req, res) => {
  try {
    // 1. Fetch the full user details from Database
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).send('User not found');
    }

    // 2. Render the page with the 'user' object
    res.render('user/user-settings', {
      title: 'Settings',
      page: 'settings',
      user: user, // This sends the full user object
      userName: user.name, // This sends just the name for header compatibility
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

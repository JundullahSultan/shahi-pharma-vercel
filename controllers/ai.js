const Groq = require('groq-sdk');
const Medicine = require('../models/Medicines');
const Order = require('../models/Orders');
const User = require('../models/Users');

const groq = new Groq({ apiKey: process.env.NEW_GROQ_API });

// 1. Render the Page
exports.getAiPage = (req, res) => {
  res.render('admin-ai', {
    title: 'Shahi AI Brain',
    page: 'ai',
    adminName: req.user.name,
  });
};

// 2. Chat Logic
exports.chatWithData = async (req, res) => {
  try {
    const { message } = req.body;

    // --- A. GATHER INTELLIGENCE (Fetch Data) ---
    const totalUsers = await User.countDocuments();

    // Get ALL medicines (Limit to 100 for speed/token limits) to give "Full Control" feeling
    const allMedicines = await Medicine.find()
      .select('name stockQuantity price companyName')
      .limit(100);

    // Get Recent Orders with full details
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'name')
      .populate('medicineId', 'name');

    // --- B. PREPARE THE BRAIN (Context) ---
    // We format the data into a readable string for the AI
    const dataContext = `
            [LIVE DATABASE SNAPSHOT]
            - Total Registered Users: ${totalUsers}
            
            - INVENTORY LIST (Top 100):
            ${allMedicines
              .map(
                (m) =>
                  `• ${m.name} (${m.companyName}): Stock=${m.stockQuantity}, Price=$${m.price}`,
              )
              .join('\n')}
            
            - RECENT ORDERS:
            ${recentOrders
              .map(
                (o) =>
                  `• Order by ${o.user?.name || 'Guest'} for ${o.medicineId?.name || 'Unknown Item'} is currently '${o.status}'`,
              )
              .join('\n')}
        `;

    // --- C. THE PERSONA (System Prompt) ---
    const systemPrompt = `
            You are "ShahiBot", the witty, highly intelligent, and slightly chaotic AI Manager of Shahi Pharma.
            
            YOUR CAPABILITIES:
            1. **Full Database Access:** You have the live data below. Use it to answer business questions accurately.
            2. **General Knowledge:** You are NOT restricted to the database. If the user asks about the weather, coding, history, or tells a joke, reply freely and engage with them.
            3. **Personality:** - Be helpful but fun. 
               - If stock is low, you can gently panic or make a joke about it. 
               - If sales are good, celebrate! 
               - Don't sound like a boring robot. Use emojis occasionally.

            DATA CONTEXT:
            ${dataContext}
        `;

    // --- D. CALL THE AI ---
    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7, // Higher temperature = more creativity/humor
    });

    const aiResponse =
      completion.choices[0]?.message?.content ||
      "I'm meditating... try again in a second.";

    res.json({ response: aiResponse });
  } catch (error) {
    console.error('AI Error:', error);
    res.status(500).json({
      response:
        'My brain circuits are fried (Server Error). Check the console!',
    });
  }
};

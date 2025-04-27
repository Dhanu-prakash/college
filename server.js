const express = require('express');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static(__dirname));

// MySQL connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Dhanu@007',
  database: 'shopping_system',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test database connection
pool.getConnection()
  .then(conn => {
    console.log('MySQL connected');
    conn.release();
  })
  .catch(err => {
    console.error('MySQL connection error:', err);
    process.exit(1);
  });

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// ─── PRODUCTS CRUD ────────────────────────────────────────
// Get all products
app.get('/api/products', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// Get one product
app.get('/api/products/:id', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM products WHERE product_id = ?',
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// Create a product
app.post('/api/products', async (req, res, next) => {
  try {
    const { name, category, price, stock } = req.body;
    
    if (!name || !category || price === undefined || stock === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const [result] = await pool.query(
      'INSERT INTO products (name, category, price, stock) VALUES (?, ?, ?, ?)',
      [name, category, parseFloat(price), parseInt(stock)]
    );
    
    res.status(201).json({ 
      product_id: result.insertId,
      message: 'Product created successfully'
    });
  } catch (err) {
    next(err);
  }
});

// Update a product
app.put('/api/products/:id', async (req, res, next) => {
  try {
    const { name, category, price, stock } = req.body;
    
    if (!name || !category || price === undefined || stock === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const [result] = await pool.query(
      'UPDATE products SET name=?, category=?, price=?, stock=? WHERE product_id=?',
      [name, category, parseFloat(price), parseInt(stock), req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json({ message: 'Product updated successfully' });
  } catch (err) {
    next(err);
  }
});

// Delete a product
app.delete('/api/products/:id', async (req, res, next) => {
  try {
    // First check if product exists
    const [check] = await pool.query(
      'SELECT * FROM products WHERE product_id = ?',
      [req.params.id]
    );
    
    if (check.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Then delete
    const [result] = await pool.query(
      'DELETE FROM products WHERE product_id=?',
      [req.params.id]
    );
    
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// ─── CUSTOMERS CRUD ────────────────────────────────────────
// Get all customers
app.get('/api/customers', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM customers');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// Create customer
app.post('/api/customers', async (req, res, next) => {
  try {
    const { name, email, address, phone } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const [result] = await pool.query(
      'INSERT INTO customers (name, email, address, phone) VALUES (?, ?, ?, ?)',
      [name, email, address || null, phone || null]
    );
    
    res.status(201).json({ 
      customer_id: result.insertId,
      message: 'Customer created successfully'
    });
  } catch (err) {
    next(err);
  }
});

// ─── ORDERS CRUD ────────────────────────────────────────
// Get all orders
app.get('/api/orders', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM orders');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// Get order items
app.get('/api/order_items', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM order_items');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// Add item to order
app.post('/api/orders/:orderId/items', async (req, res, next) => {
  try {
    const orderId = req.params.orderId;
    const { product_id, quantity, price } = req.body;
    
    if (!product_id || !quantity || !price) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const [result] = await pool.query(
      'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
      [orderId, product_id, quantity, price]
    );
    
    res.status(201).json({ 
      item_id: result.insertId,
      message: 'Item added to order successfully'
    });
  } catch (err) {
    next(err);
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Start server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
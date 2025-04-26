const express   = require('express');
const mysql     = require('mysql2');
const bodyParser= require('body-parser');
const app       = express();
const PORT      = 3000;

app.use(bodyParser.json());
app.use(express.static(__dirname));  // serve index.html, app.js

// MySQL connection
const db = mysql.createConnection({
  host:     'localhost',
  user:     'root',
  password: 'Dhanu@007',
  database: 'shopping_system'
});

// Connect
db.connect(err => {
  if (err) throw err;
  console.log('MySQL connected');
});

// Products
app.post('/api/products', (req, res) => { /* Insert to MySQL */ });
app.put('/api/products/:id', (req, res) => { /* Update in MySQL */ });
app.delete('/api/products/:id', (req, res) => { /* Delete from MySQL */ });

// Customers
app.post('/api/customers', (req, res) => { /* ... */ });
// ... similar PUT/DELETE endpoints ...

// Orders and Items
app.post('/api/orders/:orderId/items', (req, res) => {
  // Insert order item
  db.query(
    'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
    [orderId, productId, quantity, price]
  );
});


// ─── PRODUCTS CRUD ────────────────────────────────────────
// ─── CUSTOMERS ────────────────────────────────────
app.get('/api/customers', (req, res) => {
  db.query('SELECT * FROM customers', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// ─── ORDERS ──────────────────────────────────────
app.get('/api/orders', (req, res) => {
  db.query('SELECT * FROM orders', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// ─── ORDER ITEMS ────────────────────────────────
app.get('/api/order_items', (req, res) => {
  db.query('SELECT * FROM order_items', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// 1) Get all products
app.get('/api/products', (req, res) => {
  db.query('SELECT * FROM Products', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});



// 2) Get one product
app.get('/api/products/:id', (req, res) => {
  db.query(
    'SELECT * FROM Products WHERE product_id = ?',
    [req.params.id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows[0]);
    }
  );
});

// 3) Create a product
app.post('/api/products', (req, res) => {
  const { name, category, price, stock } = req.body;
  db.query(
    'INSERT INTO Products (name,category,price,stock) VALUES (?,?,?,?)',
    [name, category, price, stock],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ product_id: result.insertId });
    }
  );
});

// 4) Update a product
app.put('/api/products/:id', (req, res) => {
  const { name, category, price, stock } = req.body;
  db.query(
    'UPDATE Products SET name=?, category=?, price=?, stock=? WHERE product_id=?',
    [name, category, price, stock, req.params.id],
    err => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Updated' });
    }
  );
});

// 5) Delete a product
app.delete('/api/products/:id', (req, res) => {
  db.query(
    'DELETE FROM Products WHERE product_id=?',
    [req.params.id],
    err => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Deleted' });
    }
  );
});

// ─── START SERVER ───────────────────────────────────────
app.listen(PORT, () => console.log(`Server on http://localhost:${PORT}`));

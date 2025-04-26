// app.js (frontend JavaScript)

// Load products on page load
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    
    // Handle form submission
    document.getElementById('product-form').addEventListener('submit', function(e) {
      e.preventDefault();
      const formData = new FormData(this);
      const product = {
        name: formData.get('name'),
        category: formData.get('category'),
        price: formData.get('price'),
        stock: formData.get('stock')
      };
      
      saveProduct(product);
    });
  });
  
  function loadProducts() {
    fetch('/api/products')
      .then(response => response.json())
      .then(products => {
        const tableBody = document.querySelector('#products-table tbody');
        tableBody.innerHTML = '';
  
        products.forEach(product => {
          const row = document.createElement('tr');
  
          row.innerHTML = `
            <td>${product.product_id}</td>
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>${product.price}</td>
            <td>${product.stock}</td>
            <td>
              <button onclick="editProduct(${product.product_id})">Edit</button>
              <button onclick="deleteProduct(${product.product_id})">Delete</button>
            </td>
          `;
  
          tableBody.appendChild(row);
        });
      })
      .catch(err => console.error('Error loading products:', err));
  }
  
  function saveProduct(product, id = null) {
    const url = id ? `/api/products/${id}` : '/api/products';
    const method = id ? 'PUT' : 'POST';
  
    fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(product)
    })
    .then(response => response.json())
    .then(data => {
      console.log('Success:', data);
      loadProducts();
      resetForm();
    })
    .catch(err => console.error('Error saving product:', err));
  }
  
  function showTable(tableName) {
    fetch(`/api/${tableName}`)
      .then(response => response.json())
      .then(data => {
        const container = document.getElementById('table-container');
        container.innerHTML = `
          <h2>${tableName.toUpperCase()}</h2>
          <table id="${tableName}-table">
            <thead>
              <tr>${generateTableHeaders(data[0])}</tr>
            </thead>
            <tbody>
              ${data.map(row => `
                <tr>${generateTableRow(row)}</tr>
              `).join('')}
            </tbody>
          </table>
        `;
      });
  }

  function editProduct(id) {
    // Fetch existing data
    fetch(`/api/products/${id}`)
      .then(res => res.json())
      .then(product => {
        // Populate form
        document.getElementById('product-name').value = product.name;
        // ... other fields ...
        
        // Change form to update mode
        document.getElementById('product-form').dataset.editing = id;
      });
  }
  
  function saveProduct() {
    const id = form.dataset.editing; // Get ID if editing
    const method = id ? 'PUT' : 'POST';
    const url = id ? `/api/products/${id}` : '/api/products';
  
    fetch(url, { method, /* ... */ })
    .then(() => {
      loadProducts();
      resetForm();
    });
  }

  function addCustomer() {
    fetch('/api/customers', {
      method: 'POST',
      body: JSON.stringify({
        name: document.getElementById('customer-name').value,
        email: document.getElementById('customer-email').value,
        // ... other fields ...
      })
    })
    .then(() => loadCustomers());
  }

  function editCustomer(id) {
    fetch(`/api/customers/${id}`)
      .then(res => res.json())
      .then(customer => {
        // Populate form
        document.getElementById('customer-name').value = customer.name;
        // ... other fields ...
      });
  }

  function deleteCustomer(id) {
    fetch(`/api/customers/${id}`, { method: 'DELETE' })
    .then(() => loadCustomers());
  }

  function createOrder() {
    fetch('/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        customer_id: selectedCustomerId,
        items: selectedProducts // Array of {product_id, quantity}
      })
    });
  }

  function editOrder(id) {
    fetch(`/api/orders/${id}`)
      .then(res => res.json())
      .then(order => {
        // Populate order editor
      });
  }

  function addOrderItem(orderId) {
    fetch(`/api/orders/${orderId}/items`, {
      method: 'POST',
      body: JSON.stringify({
        product_id: selectedProductId,
        quantity: quantity
      })
    });
  }

  function updateOrderItem(orderId, itemId) {
    fetch(`/api/orders/${orderId}/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity: newQuantity })
    });
  }

  function removeOrderItem(orderId, itemId) {
    fetch(`/api/orders/${orderId}/items/${itemId}`, {
      method: 'DELETE'
    });
  }

  function deleteOrder(id) {
    fetch(`/api/orders/${id}`, { method: 'DELETE' });
  }

  function deleteProduct(id) {
    if (confirm('Delete this product?')) {
      fetch(`/api/products/${id}`, { method: 'DELETE' })
      .then(() => loadProducts());
    }
  }

  // In app.js
function addProduct() {
  const name = document.getElementById('product-name').value;
  const category = document.getElementById('product-category').value;
  const price = document.getElementById('product-price').value;
  const stock = document.getElementById('product-stock').value;

  fetch('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, category, price, stock })
  })
  .then(() => loadProducts()); // Refresh the list
}
  
  function generateTableHeaders(data) {
    return Object.keys(data).map(key => 
      `<th>${key.replace('_', ' ')}</th>`
    ).join('');
  }
  
  function generateTableRow(row) {
    return Object.values(row).map(value => 
      `<td>${value || '-'}</td>`
    ).join('');
  }
  
  // Load products by default on page load
  document.addEventListener('DOMContentLoaded', () => {
    showTable('products');
  });

  function editProduct(id) {
    fetch(`/api/products/${id}`)
      .then(response => response.json())
      .then(product => {
        const form = document.getElementById('product-form');
        form.querySelector('[name="name"]').value = product.name;
        form.querySelector('[name="category"]').value = product.category;
        form.querySelector('[name="price"]').value = product.price;
        form.querySelector('[name="stock"]').value = product.stock;
        
        // Add a hidden field or data attribute to track editing
        form.dataset.editing = id;
        document.getElementById('cancel-edit').style.display = 'inline-block';
      })
      .catch(err => console.error('Error fetching product:', err));
  }
  
  function deleteProduct(id) {
    if (confirm('Are you sure you want to delete this product?')) {
      fetch(`/api/products/${id}`, {
        method: 'DELETE'
      })
      .then(response => response.json())
      .then(data => {
        console.log('Deleted:', data);
        loadProducts();
      })
      .catch(err => console.error('Error deleting product:', err));
    }
  }
  
  function resetForm() {
    const form = document.getElementById('product-form');
    form.reset();
    delete form.dataset.editing;
    document.getElementById('cancel-edit').style.display = 'none';
  }
  
  // Handle cancel edit button
  document.getElementById('cancel-edit').addEventListener('click', resetForm);
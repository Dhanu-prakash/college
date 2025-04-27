document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    
    // Form submission handler
    document.getElementById('product-form').addEventListener('submit', function(e) {
      e.preventDefault();
      const formData = new FormData(this);
      const product = {
        name: formData.get('name'),
        category: formData.get('category'),
        price: parseFloat(formData.get('price')),
        stock: parseInt(formData.get('stock'))
      };
      
      // Validate inputs
      if (!product.name || !product.category || isNaN(product.price) || isNaN(product.stock)) {
        alert('Please fill all fields with valid values');
        return;
      }
      
      const isEditing = this.dataset.editing;
      if (isEditing) {
        updateProduct(isEditing, product);
      } else {
        createProduct(product);
      }
    });
  
    // Cancel edit button
    document.getElementById('cancel-edit').addEventListener('click', resetForm);
  });
  
  // Load all products
  function loadProducts() {
    fetch('/api/products')
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then(products => {
        const tableBody = document.querySelector('#products-table tbody');
        tableBody.innerHTML = '';
  
        products.forEach(product => {
          const row = document.createElement('tr');
          row.innerHTML = `
  <td>${product.product_id}</td>
  <td>${product.name}</td>
  <td>${product.category}</td>
  <td>$${Number(product.price).toFixed(2)}</td>
  <td>${product.stock}</td>
  <td>
    <button class="edit-btn" onclick="editProduct(${product.product_id})">Edit</button>
    <button class="delete-btn" onclick="deleteProduct(${product.product_id})">Delete</button>
  </td>
`;
          tableBody.appendChild(row);
        });
      })
      .catch(err => {
        console.error('Error loading products:', err);
        alert('Failed to load products');
      });
  }
  
  // Create new product
  function createProduct(product) {
    fetch('/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(product)
    })
    .then(response => {
      if (!response.ok) throw new Error('Failed to create product');
      return response.json();
    })
    .then(() => {
      loadProducts();
      resetForm();
      alert('Product created successfully!');
    })
    .catch(err => {
      console.error('Error creating product:', err);
      alert('Failed to create product: ' + err.message);
    });
  }
  
  // Update existing product
  function updateProduct(id, product) {
    fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(product)
    })
    .then(response => {
      if (!response.ok) throw new Error('Failed to update product');
      return response.json();
    })
    .then(() => {
      loadProducts();
      resetForm();
      alert('Product updated successfully!');
    })
    .catch(err => {
      console.error('Error updating product:', err);
      alert('Failed to update product: ' + err.message);
    });
  }
  
  // Edit product (populate form)
  function editProduct(id) {
    fetch(`/api/products/${id}`)
      .then(response => {
        if (!response.ok) throw new Error('Failed to fetch product');
        return response.json();
      })
      .then(product => {
        const form = document.getElementById('product-form');
        form.querySelector('[name="name"]').value = product.name;
        form.querySelector('[name="category"]').value = product.category;
        form.querySelector('[name="price"]').value = product.price;
        form.querySelector('[name="stock"]').value = product.stock;
        
        form.dataset.editing = id;
        document.getElementById('cancel-edit').style.display = 'inline-block';
        document.querySelector('#product-form button[type="submit"]').textContent = 'Update Product';
      })
      .catch(err => {
        console.error('Error fetching product:', err);
        alert('Failed to load product for editing');
      });
  }
  
  // Delete product
  function deleteProduct(id) {
    if (confirm('Are you sure you want to delete this product?')) {
      fetch(`/api/products/${id}`, {
        method: 'DELETE'
      })
      .then(response => {
        if (!response.ok) throw new Error('Failed to delete product');
        return response.json();
      })
      .then(() => {
        loadProducts();
        alert('Product deleted successfully!');
      })
      .catch(err => {
        console.error('Error deleting product:', err);
        alert('Failed to delete product: ' + err.message);
      });
    }
  }
  
  // Reset form to initial state
  function resetForm() {
    document.getElementById('product-form').reset();
    delete document.getElementById('product-form').dataset.editing;
    document.getElementById('cancel-edit').style.display = 'none';
    document.querySelector('#product-form button[type="submit"]').textContent = 'Add Product';
  }
  
  // View switching functions
  function showTable(tableName) {
    fetch(`/api/${tableName}`)
      .then(response => {
        if (!response.ok) throw new Error(`Failed to load ${tableName}`);
        return response.json();
      })
      .then(data => {
        if (data.length === 0) {
          document.getElementById('table-container').innerHTML = `<p>No ${tableName} found</p>`;
          return;
        }
  
        const container = document.getElementById('table-container');
        const headers = Object.keys(data[0]).map(key => 
          `<th>${key.replace('_', ' ')}</th>`
        ).join('');
        
        const rows = data.map(row => {
          const cells = Object.values(row).map(value => 
            `<td>${value !== null ? value : '-'}</td>`
          ).join('');
          return `<tr>${cells}</tr>`;
        }).join('');
        
        container.innerHTML = `
          <h2>${tableName.charAt(0).toUpperCase() + tableName.slice(1)}</h2>
          <table id="${tableName}-table">
            <thead><tr>${headers}</tr></thead>
            <tbody>${rows}</tbody>
          </table>
        `;
      })
      .catch(err => {
        console.error(`Error loading ${tableName}:`, err);
        document.getElementById('table-container').innerHTML = `<p>Error loading ${tableName}</p>`;
      });
  }
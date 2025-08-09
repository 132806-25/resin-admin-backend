// Initialize Lucide icons
lucide.createIcons();

// Global variables
let currentEditingProduct = null;
let currentEditingCategory = null;
let categories = [];

// API Base URL
const API_BASE = '/api';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    showSection('products');
    loadCategories();
    loadProducts();
});

// Navigation
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.add('hidden');
    });
    
    // Show selected section
    document.getElementById(sectionName + '-section').classList.remove('hidden');
    
    // Update navigation buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('bg-teal-700');
        if (btn.dataset.section === sectionName) {
            btn.classList.add('bg-teal-700');
        }
    });
    
    // Load data for the section
    if (sectionName === 'products') {
        loadProducts();
    } else if (sectionName === 'categories') {
        loadCategories();
    }
}

// Products Management
async function loadProducts() {
    try {
        const response = await fetch(`${API_BASE}/products`);
        const products = await response.json();
        
        const tbody = document.getElementById('products-table');
        tbody.innerHTML = '';
        
        products.forEach(product => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10">
                            <img class="h-10 w-10 rounded-full object-cover" src="${product.image_url || 'https://via.placeholder.com/40'}" alt="">
                        </div>
                        <div class="ml-4">
                            <div class="text-sm font-medium text-gray-900">${product.name}</div>
                            <div class="text-sm text-gray-500">${product.description ? product.description.substring(0, 50) + '...' : ''}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-teal-100 text-teal-800">
                        ${product.category}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    R$ ${product.price.toFixed(2)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onclick="editProduct(${product.id})" class="text-teal-600 hover:text-teal-900 mr-4">
                        Editar
                    </button>
                    <button onclick="deleteProduct(${product.id})" class="text-red-600 hover:text-red-900">
                        Excluir
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        alert('Erro ao carregar produtos');
    }
}

async function loadCategories() {
    try {
        const response = await fetch(`${API_BASE}/categories`);
        categories = await response.json();
        
        // Update categories grid
        const grid = document.getElementById('categories-grid');
        grid.innerHTML = '';
        
        categories.forEach(category => {
            const card = document.createElement('div');
            card.className = 'bg-white rounded-lg shadow-md p-6';
            card.innerHTML = `
                <div class="flex items-center justify-between mb-4">
                    <div class="w-12 h-12 ${category.color} rounded-full flex items-center justify-center">
                        <span class="text-white font-bold text-lg">${category.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div class="flex space-x-2">
                        <button onclick="editCategory(${category.id})" class="text-teal-600 hover:text-teal-900">
                            <i data-lucide="edit" class="w-4 h-4"></i>
                        </button>
                        <button onclick="deleteCategory(${category.id})" class="text-red-600 hover:text-red-900">
                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                        </button>
                    </div>
                </div>
                <h3 class="text-lg font-semibold text-gray-800 mb-2">${category.name}</h3>
                <p class="text-gray-600 text-sm">${category.description}</p>
            `;
            grid.appendChild(card);
        });
        
        // Update product category select
        const categorySelect = document.getElementById('product-category');
        categorySelect.innerHTML = '';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.name;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
        
        // Re-initialize Lucide icons
        lucide.createIcons();
    } catch (error) {
        console.error('Erro ao carregar categorias:', error);
        alert('Erro ao carregar categorias');
    }
}

// Product Modal Functions
function openProductModal(product = null) {
    currentEditingProduct = product;
    const modal = document.getElementById('product-modal');
    const title = document.getElementById('product-modal-title');
    const form = document.getElementById('product-form');
    
    if (product) {
        title.textContent = 'Editar Produto';
        document.getElementById('product-id').value = product.id;
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-description').value = product.description || '';
        document.getElementById('product-price').value = product.price;
        document.getElementById('product-category').value = product.category;
        document.getElementById('product-image').value = product.image_url || '';
    } else {
        title.textContent = 'Adicionar Produto';
        form.reset();
        document.getElementById('product-id').value = '';
    }
    
    modal.classList.remove('hidden');
}

function closeProductModal() {
    document.getElementById('product-modal').classList.add('hidden');
    currentEditingProduct = null;
}

async function editProduct(productId) {
    try {
        const response = await fetch(`${API_BASE}/products/${productId}`);
        const product = await response.json();
        openProductModal(product);
    } catch (error) {
        console.error('Erro ao carregar produto:', error);
        alert('Erro ao carregar produto');
    }
}

async function deleteProduct(productId) {
    if (!confirm('Tem certeza que deseja excluir este produto?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/products/${productId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            loadProducts();
            alert('Produto excluído com sucesso!');
        } else {
            throw new Error('Erro ao excluir produto');
        }
    } catch (error) {
        console.error('Erro ao excluir produto:', error);
        alert('Erro ao excluir produto');
    }
}

// Category Modal Functions
function openCategoryModal(category = null) {
    currentEditingCategory = category;
    const modal = document.getElementById('category-modal');
    const title = document.getElementById('category-modal-title');
    const form = document.getElementById('category-form');
    
    if (category) {
        title.textContent = 'Editar Categoria';
        document.getElementById('category-id').value = category.id;
        document.getElementById('category-name').value = category.name;
        document.getElementById('category-description').value = category.description || '';
        document.getElementById('category-color').value = category.color || 'bg-gradient-to-br from-gray-400 to-gray-600';
    } else {
        title.textContent = 'Adicionar Categoria';
        form.reset();
        document.getElementById('category-id').value = '';
    }
    
    modal.classList.remove('hidden');
}

function closeCategoryModal() {
    document.getElementById('category-modal').classList.add('hidden');
    currentEditingCategory = null;
}

async function editCategory(categoryId) {
    const category = categories.find(c => c.id === categoryId);
    if (category) {
        openCategoryModal(category);
    }
}

async function deleteCategory(categoryId) {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/categories/${categoryId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            loadCategories();
            alert('Categoria excluída com sucesso!');
        } else {
            throw new Error('Erro ao excluir categoria');
        }
    } catch (error) {
        console.error('Erro ao excluir categoria:', error);
        alert('Erro ao excluir categoria');
    }
}

// Form Submissions
document.getElementById('product-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const productId = document.getElementById('product-id').value;
    const productData = {
        name: document.getElementById('product-name').value,
        description: document.getElementById('product-description').value,
        price: parseFloat(document.getElementById('product-price').value),
        category: document.getElementById('product-category').value,
        image_url: document.getElementById('product-image').value
    };
    
    try {
        let response;
        if (productId) {
            // Update existing product
            response = await fetch(`${API_BASE}/products/${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(productData)
            });
        } else {
            // Create new product
            response = await fetch(`${API_BASE}/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(productData)
            });
        }
        
        if (response.ok) {
            closeProductModal();
            loadProducts();
            alert(productId ? 'Produto atualizado com sucesso!' : 'Produto criado com sucesso!');
        } else {
            const error = await response.json();
            throw new Error(error.error || 'Erro ao salvar produto');
        }
    } catch (error) {
        console.error('Erro ao salvar produto:', error);
        alert('Erro ao salvar produto: ' + error.message);
    }
});

document.getElementById('category-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const categoryId = document.getElementById('category-id').value;
    const categoryData = {
        name: document.getElementById('category-name').value,
        description: document.getElementById('category-description').value,
        color: document.getElementById('category-color').value
    };
    
    try {
        let response;
        if (categoryId) {
            // Update existing category
            response = await fetch(`${API_BASE}/categories/${categoryId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(categoryData)
            });
        } else {
            // Create new category
            response = await fetch(`${API_BASE}/categories`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(categoryData)
            });
        }
        
        if (response.ok) {
            closeCategoryModal();
            loadCategories();
            alert(categoryId ? 'Categoria atualizada com sucesso!' : 'Categoria criada com sucesso!');
        } else {
            const error = await response.json();
            throw new Error(error.error || 'Erro ao salvar categoria');
        }
    } catch (error) {
        console.error('Erro ao salvar categoria:', error);
        alert('Erro ao salvar categoria: ' + error.message);
    }
});


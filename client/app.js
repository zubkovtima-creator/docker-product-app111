const API_URL = 'http://localhost:3000/api/products';

document.addEventListener('DOMContentLoaded', () => {
    console.log('Додаток завантажено!');
    loadProducts();
    
    checkAPIConnection();
});

async function checkAPIConnection() {
    try {
        const response = await fetch('http://localhost:3000/api/health');
        if (response.ok) {
            console.log('Підключення до API успішне');
        }
    } catch (error) {
        console.warn('API ще не готове, повторна спроба через 3 секунди...');
        setTimeout(checkAPIConnection, 3000);
    }
}

document.getElementById('productForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('name').value.trim();
    const price = document.getElementById('price').value;
    
    if (!name || !price) {
        alert('Будь ласка, заповніть всі поля');
        return;
    }
    
    const product = {
        name: name,
        price: parseFloat(price)
    };
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(product)
        });
        
        if (response.ok) {
            document.getElementById('productForm').reset();
            
            await loadProducts();
            
            showMessage('Продукт успішно додано!', 'success');
        } else {
            const error = await response.json();
            showMessage(`Помилка: ${error.error}`, 'error');
        }
    } catch (error) {
        showMessage('Помилка підключення до сервера', 'error');
        console.error('Помилка:', error);
    }
});

document.getElementById('refreshBtn').addEventListener('click', loadProducts);

async function loadProducts() {
    const productList = document.getElementById('productList');
    
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Помилка сервера');
        
        const products = await response.json();
        
        if (products.length === 0) {
            productList.innerHTML = '<div class="loading"> Список продуктів порожній</div>';
            return;
        }
        
        productList.innerHTML = '';
        
        products.forEach(product => {
            const productElement = createProductElement(product);
            productList.appendChild(productElement);
        });
        
    } catch (error) {
        productList.innerHTML = `
            <div class="loading" style="color: #ff6b6b;">
                Не вдалося завантажити продукти
                <br><small>Сервер може бути ще не готовий</small>
            </div>
        `;
        console.error('Помилка завантаження:', error);
    }
}

function createProductElement(product) {
    const div = document.createElement('div');
    div.className = 'product-item';
    div.innerHTML = `
        <div class="product-info">
            <h3>${product.name}</h3>
            <div class="product-price">$${product.price.toFixed(2)}</div>
            <small>ID: ${product.id}</small>
        </div>
        <div class="product-actions">
            <button onclick="editProduct(${product.id})" class="btn-secondary">✏️ Редагувати</button>
            <button onclick="deleteProduct(${product.id})" class="btn-danger">🗑️ Видалити</button>
        </div>
    `;
    return div;
}

async function deleteProduct(id) {
    if (!confirm('Ви впевнені, що хочете видалити цей продукт?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            await loadProducts();
            showMessage('Продукт успішно видалено', 'success');
        }
    } catch (error) {
        showMessage('Помилка при видаленні', 'error');
        console.error('Помилка:', error);
    }
}

function editProduct(id) {
    const newName = prompt('Введіть нову назву продукту:');
    const newPrice = prompt('Введіть нову ціну:');
    
    if (newName && newPrice) {
        updateProduct(id, newName, parseFloat(newPrice));
    }
}

async function updateProduct(id, name, price) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, price })
        });
        
        if (response.ok) {
            await loadProducts();
            showMessage('Продукт успішно оновлено', 'success');
        }
    } catch (error) {
        showMessage('Помилка при оновленні', 'error');
    }
}

function showMessage(text, type) {
    const message = document.createElement('div');
    message.textContent = text;
    message.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 1000;
        animation: slideIn 0.3s ease;
        background: ${type === 'success' ? '#2ecc71' : '#e74c3c'};
    `;
    
    document.body.appendChild(message);
    
    setTimeout(() => {
        message.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => message.remove(), 300);
    }, 3000);
}

const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
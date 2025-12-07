document.addEventListener('DOMContentLoaded', function() {
    setupSearchForms();
    loadImages();
    addUploadButton();
});

function setupSearchForms() {
    const forms = document.querySelectorAll('form[action*="pesquisa"]');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const input = this.querySelector('input[name="personagem"]');
            if (input && input.value.trim()) {
                window.location.href = `/pesquisa.html?q=${encodeURIComponent(input.value)}`;
            } else {
                window.location.href = '/pesquisa.html';
            }
        });
    });
}

async function loadImages() {
    const urlParams = new URLSearchParams(window.location.search);
    const searchTerm = urlParams.get('q') || urlParams.get('personagem') || '';
    
    try {
        let url;
        if (searchTerm) {
            url = `${API_URL}/api/images/search?q=${encodeURIComponent(searchTerm)}`;
        } else {
            url = `${API_URL}/api/images?limit=50`;
        }
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success) {
            displayImages(data.images, searchTerm);
        } else {
            showError('Error loading images');
        }
    } catch (error) {
        showError('Connection error');
    }
}

function displayImages(images, searchTerm) {
    const oldContainer = document.querySelector('.images-container');
    if (oldContainer) oldContainer.remove();
    
    const container = document.createElement('div');
    container.className = 'images-container';
    container.style.cssText = `
        max-width: 1400px;
        margin: 40px auto;
        padding: 20px;
    `;
    
    const title = document.createElement('h1');
    title.style.cssText = `
        font-family: 'Litebulb', sans-serif;
        font-size: 48px;
        color: #333;
        text-align: center;
        margin-bottom: 20px;
    `;
    title.textContent = searchTerm ? `Search: "${searchTerm}"` : 'All Profile Pictures';
    container.appendChild(title);
    
    const count = document.createElement('p');
    count.style.cssText = `
        text-align: center;
        font-size: 20px;
        color: #666;
        margin-bottom: 40px;
        font-family: 'Litebulb', sans-serif;
    `;
    count.textContent = `Found ${images.length} image${images.length !== 1 ? 's' : ''}`;
    container.appendChild(count);
    
    if (images.length === 0) {
        const noResults = createNoResultsElement(searchTerm);
        container.appendChild(noResults);
    } else {
        const grid = createImagesGrid(images);
        container.appendChild(grid);
    }
    
    document.body.appendChild(container);
}

function createNoResultsElement(searchTerm) {
    const div = document.createElement('div');
    div.style.cssText = `
        text-align: center;
        padding: 60px 20px;
        background: white;
        border-radius: 20px;
        box-shadow: 0 8px 25px rgba(0,0,0,0.1);
        margin: 20px 0;
    `;
    
    div.innerHTML = `
        <div style="font-size: 64px; margin-bottom: 20px;">😞</div>
        <h3 style="font-family: 'Litebulb', sans-serif; font-size: 32px; color: #333; margin-bottom: 15px;">
            ${searchTerm ? 'No images found' : 'No images uploaded yet'}
        </h3>
        <p style="font-family: 'Litebulb', sans-serif; font-size: 24px; color: #666; margin-bottom: 30px;">
            ${searchTerm ? 'Try different keywords or' : 'Be the first to'} upload an image!
        </p>
        <button onclick="showUploadModal()" style="
            background: #ffea98;
            border: none;
            padding: 15px 30px;
            border-radius: 10px;
            font-family: 'Litebulb', sans-serif;
            font-size: 24px;
            cursor: pointer;
            transition: all 0.3s;
        " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 15px rgba(0,0,0,0.2)'"
          onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
            📤 Upload Image
        </button>
    `;
    
    return div;
}

function createImagesGrid(images) {
    const grid = document.createElement('div');
    grid.style.cssText = `
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 30px;
        margin-top: 30px;
    `;
    
    images.forEach(image => {
        const card = createImageCard(image);
        grid.appendChild(card);
    });
    
    return grid;
}

function createImageCard(image) {
    const card = document.createElement('div');
    card.style.cssText = `
        background: white;
        border-radius: 20px;
        overflow: hidden;
        box-shadow: 0 8px 25px rgba(0,0,0,0.1);
        transition: transform 0.3s, box-shadow 0.3s;
    `;
    card.onmouseover = () => {
        card.style.transform = 'translateY(-8px)';
        card.style.boxShadow = '0 15px 35px rgba(0,0,0,0.15)';
    };
    card.onmouseout = () => {
        card.style.transform = 'translateY(0)';
        card.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
    };
    
    card.innerHTML = `
        <div style="width:100%; height:250px; overflow:hidden; position:relative;">
            <img src="${image.imageUrl}" 
                 alt="${image.characterName}"
                 style="width:100%; height:100%; object-fit:cover;"
                 onerror="this.src='/assets/images/logo.png'">
            <div style="position:absolute; top:10px; right:10px; background:rgba(0,0,0,0.7); color:white; padding:4px 8px; border-radius:5px; font-size:12px;">
                ${image.category}
            </div>
        </div>
        <div style="padding:25px;">
            <h4 style="
                margin:0 0 10px 0; 
                color:#333; 
                font-size:22px;
                font-family: 'Litebulb', sans-serif;
                line-height:1.2;
            ">
                ${image.characterName}
            </h4>
            
            ${image.tags && image.tags.length > 0 ? `
                <div style="margin-top:10px;">
                    ${image.tags.slice(0, 5).map(tag => `
                        <span style="
                            display:inline-block;
                            background:#f0f0f0;
                            padding:3px 10px;
                            border-radius:8px;
                            font-family: 'Litebulb', sans-serif;
                            font-size:14px;
                            margin-right:5px;
                            margin-bottom:5px;
                        ">
                            ${tag}
                        </span>
                    `).join('')}
                </div>
            ` : ''}
            
            <div style="
                margin-top:20px;
                padding-top:15px;
                border-top:1px solid #eee;
                display:flex;
                justify-content:space-between;
                font-family: 'Litebulb', sans-serif;
                font-size:16px;
                color:#666;
            ">
                <span>👤 ${image.uploadedBy || 'Anonymous'}</span>
                <span>❤️ ${image.likes || 0} likes</span>
            </div>
            
            <div style="display:flex; gap:10px; margin-top:15px;">
                <button onclick="likeImage('${image._id}')" style="
                    flex:1;
                    background:#ff7b00;
                    border:none;
                    color:white;
                    padding:10px;
                    border-radius:8px;
                    font-family: 'Litebulb', sans-serif;
                    font-size:18px;
                    cursor:pointer;
                    transition:all 0.3s;
                " onmouseover="this.style.background='#e56b00'"
                  onmouseout="this.style.background='#ff7b00'">
                    ❤️ Like
                </button>
                <button onclick="downloadImage('${image.imageUrl}', '${image.characterName}')" style="
                    flex:1;
                    background:#ffea98;
                    border:none;
                    color:#333;
                    padding:10px;
                    border-radius:8px;
                    font-family: 'Litebulb', sans-serif;
                    font-size:18px;
                    cursor:pointer;
                    transition:all 0.3s;
                " onmouseover="this.style.background='#f5e08a'"
                  onmouseout="this.style.background='#ffea98'">
                    ⬇️ Download
                </button>
            </div>
        </div>
    `;
    
    return card;
}

function addUploadButton() {
    if (document.querySelector('.upload-fab')) return;
    
    const fab = document.createElement('button');
    fab.className = 'upload-fab';
    fab.innerHTML = '📤';
    fab.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 70px;
        height: 70px;
        border-radius: 50%;
        background: #48bb78;
        color: white;
        border: none;
        font-size: 32px;
        cursor: pointer;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 1000;
        transition: all 0.3s;
    `;
    fab.onmouseover = () => {
        fab.style.transform = 'scale(1.1)';
        fab.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
    };
    fab.onmouseout = () => {
        fab.style.transform = 'scale(1)';
        fab.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
    };
    fab.onclick = showUploadModal;
    
    document.body.appendChild(fab);
}

function showUploadModal() {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
    `;
    
    modal.innerHTML = `
        <div style="
            background: white;
            border-radius: 20px;
            padding: 40px;
            max-width: 500px;
            width: 90%;
            max-height: 90vh;
            overflow-y: auto;
        ">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:30px;">
                <h2 style="margin:0; font-family:'Litebulb', sans-serif; font-size:32px; color:#333;">
                    📤 Upload Image
                </h2>
                <button onclick="this.closest('.upload-modal').remove()" style="
                    background:none;
                    border:none;
                    font-size:32px;
                    cursor:pointer;
                    color:#666;
                ">&times;</button>
            </div>
            
            <form id="uploadForm" style="display:flex; flex-direction:column; gap:20px;">
                <div>
                    <label style="display:block; margin-bottom:8px; font-family:'Litebulb', sans-serif; font-size:20px;">
                        Character Name *
                    </label>
                    <input type="text" name="characterName" required 
                           style="width:100%; padding:12px; border:2px solid #ffea98; border-radius:10px; font-size:16px;">
                </div>
                
                <div>
                    <label style="display:block; margin-bottom:8px; font-family:'Litebulb', sans-serif; font-size:20px;">
                        Category *
                    </label>
                    <select name="category" required 
                            style="width:100%; padding:12px; border:2px solid #ffea98; border-radius:10px; font-size:16px;">
                        <option value="">Select category</option>
                        <option value="Anime">Anime</option>
                        <option value="Games">Games</option>
                        <option value="Comics">Comics</option>
                        <option value="Movies">Movies</option>
                        <option value="TV Shows">TV Shows</option>
                        <option value="Cartoons">Cartoons</option>
                        <option value="Original">Original</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                
                <div>
                    <label style="display:block; margin-bottom:8px; font-family:'Litebulb', sans-serif; font-size:20px;">
                        Tags (separate with commas)
                    </label>
                    <input type="text" name="tags" 
                           placeholder="naruto, anime, hokage"
                           style="width:100%; padding:12px; border:2px solid #ffea98; border-radius:10px; font-size:16px;">
                </div>
                
                <div>
                    <label style="display:block; margin-bottom:8px; font-family:'Litebulb', sans-serif; font-size:20px;">
                        Your Name (optional)
                    </label>
                    <input type="text" name="uploadedBy" 
                           placeholder="Anonymous"
                           style="width:100%; padding:12px; border:2px solid #ffea98; border-radius:10px; font-size:16px;">
                </div>
                
                <div>
                    <label style="display:block; margin-bottom:8px; font-family:'Litebulb', sans-serif; font-size:20px;">
                        Image File *
                    </label>
                    <input type="file" name="image" accept="image/*" required 
                           style="width:100%; padding:12px; border:2px solid #ffea98; border-radius:10px; font-size:16px;">
                    <small style="display:block; margin-top:5px; color:#666;">
                        JPG, PNG, GIF, WebP, BMP (Max: 10MB)
                    </small>
                </div>
                
                <div id="previewContainer" style="display:none;">
                    <img id="imagePreview" style="max-width:100%; max-height:200px; border-radius:10px;">
                </div>
                
                <button type="submit" style="
                    background: #48bb78;
                    color: white;
                    border: none;
                    padding: 15px;
                    border-radius: 10px;
                    font-family: 'Litebulb', sans-serif;
                    font-size: 24px;
                    cursor: pointer;
                    margin-top: 10px;
                ">
                    Upload Image
                </button>
            </form>
        </div>
    `;
    
    modal.className = 'upload-modal';
    document.body.appendChild(modal);
    
    const fileInput = modal.querySelector('input[type="file"]');
    const preview = modal.querySelector('#imagePreview');
    const previewContainer = modal.querySelector('#previewContainer');
    
    fileInput.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                preview.src = e.target.result;
                previewContainer.style.display = 'block';
            };
            reader.readAsDataURL(this.files[0]);
        }
    });
    
    const form = modal.querySelector('#uploadForm');
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        
        try {
            const response = await fetch(`${API_URL}/api/upload`, {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                showMessage('✅ Image uploaded successfully!');
                modal.remove();
                loadImages();
            } else {
                showError(result.error || 'Upload failed');
            }
        } catch (error) {
            showError('Upload failed. Please try again.');
        }
    });
    
    modal.addEventListener('click', function(e) {
        if (e.target === this) {
            this.remove();
        }
    });
}

async function likeImage(imageId) {
    try {
        const response = await fetch(`${API_URL}/api/images/${imageId}/like`, {
            method: 'POST'
        });
        
        const result = await response.json();
        
        if (result.success) {
            showMessage('❤️ Liked!');
            const likeButton = document.querySelector(`[onclick="likeImage('${imageId}')"]`);
            if (likeButton) {
                likeButton.innerHTML = `❤️ ${result.likes} likes`;
            }
        }
    } catch (error) {
        showError('Failed to like image');
    }
}

function downloadImage(url, filename) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename + '.jpg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showMessage('⬇️ Download started!');
}

function showMessage(text) {
    const message = document.createElement('div');
    message.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: #4CAF50;
        color: white;
        border-radius: 10px;
        z-index: 1000;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        font-family: 'Litebulb', sans-serif;
        font-size: 18px;
    `;
    message.textContent = text;
    document.body.appendChild(message);
    
    setTimeout(() => {
        message.style.opacity = '0';
        message.style.transform = 'translateY(-20px)';
        setTimeout(() => message.remove(), 300);
    }, 3000);
}

function showError(text) {
    const message = document.createElement('div');
    message.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: #f44336;
        color: white;
        border-radius: 10px;
        z-index: 1000;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        font-family: 'Litebulb', sans-serif;
        font-size: 18px;
    `;
    message.textContent = text;
    document.body.appendChild(message);
    
    setTimeout(() => {
        message.style.opacity = '0';
        message.style.transform = 'translateY(-20px)';
        setTimeout(() =>remove(), 300);
    }, 3000);
}

window.showUploadModal = showUploadModal;
window.likeImage = likeImage;
window.downloadImage = downloadImage;
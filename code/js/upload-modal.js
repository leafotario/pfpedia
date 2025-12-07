// upload-modal.js

// Variáveis globais
let selectedTags = [];
let selectedFile = null;

// Função para mostrar erros
function showError(message) {
    const alert = document.createElement('div');
    alert.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ff6b6b;
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        font-weight: bold;
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        box-shadow: 0 5px 15px rgba(255, 107, 107, 0.3);
        font-family: Arial, sans-serif;
    `;
    alert.textContent = message;
    document.body.appendChild(alert);
    
    setTimeout(() => {
        alert.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => alert.remove(), 300);
    }, 3000);
}

// Adicionar animações CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
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

// Abrir modal quando clicar no botão "upload pfp" - VERSÃO CORRIGIDA
document.addEventListener('DOMContentLoaded', function() {
    // Método 1: Procurar pelo botão com texto "upload pfp"
    const uploadButtons = document.querySelectorAll('button.botaohomepage');
    let uploadButtonFound = null;
    
    uploadButtons.forEach(button => {
        const span = button.querySelector('span');
        if (span && span.textContent.toLowerCase().includes('upload')) {
            uploadButtonFound = button;
        }
    });
    
    // Método 2: Procurar pelo link específico (mais direto)
    const uploadLink = document.querySelector('a[href="#"] button.botaohomepage:has(img[alt="upload"])');
    
    // Método 3: Procurar pela div específica com a classe temlink que tem o botão de upload
    const uploadDiv = document.querySelector('.col-12.col-sm-8.col-lg-2.temlink');
    
    // Seleciona o melhor método
    const targetElement = uploadLink || uploadButtonFound || uploadDiv;
    
    if (targetElement) {
        const clickableElement = targetElement.tagName === 'A' ? targetElement : targetElement.closest('a') || targetElement;
        
        clickableElement.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            document.getElementById('uploadModal').style.display = 'block';
            document.body.style.overflow = 'hidden';
            console.log('Modal aberto!'); // Para debug
        });
        
        console.log('Botão de upload encontrado e configurado'); // Para debug
    } else {
        console.error('Botão de upload não encontrado!'); // Para debug
        // Fallback: adicionar manualmente se não encontrar
        setTimeout(() => {
            const manualUploadDiv = document.querySelector('.col-12.col-sm-8.col-lg-2.temlink');
            if (manualUploadDiv) {
                const link = manualUploadDiv.querySelector('a');
                if (link) {
                    link.addEventListener('click', function(e) {
                        e.preventDefault();
                        document.getElementById('uploadModal').style.display = 'block';
                        document.body.style.overflow = 'hidden';
                    });
                    console.log('Botão configurado manualmente'); // Para debug
                }
            }
        }, 1000);
    }
    
    // Fechar modal
    const closeBtn = document.querySelector('.modal-upload-close');
    const cancelBtn = document.querySelector('.cancel-btn');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeUploadModal);
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeUploadModal);
    }
    
    // Fechar ao clicar fora
    const modal = document.getElementById('uploadModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeUploadModal();
            }
        });
    }
    
    // Contadores de caracteres
    const nameInput = document.getElementById('characterName');
    const descInput = document.getElementById('description');
    
    if (nameInput) {
        nameInput.addEventListener('input', updateCharCount);
    }
    
    if (descInput) {
        descInput.addEventListener('input', updateCharCount);
    }
    
    // Sistema de tags
    const tagsInput = document.getElementById('tagsInput');
    if (tagsInput) {
        tagsInput.addEventListener('focus', function() {
            const tagsContainer = document.getElementById('tagsContainer');
            if (tagsContainer && tagsContainer.querySelector('.tag-example')) {
                tagsContainer.innerHTML = '';
            }
        });
        
        tagsInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                addTag();
            }
        });
    }
    
    const addTagBtn = document.querySelector('.btn-add-tag');
    if (addTagBtn) {
        addTagBtn.addEventListener('click', addTag);
    }
    
    // Upload de arquivo
    const dropArea = document.getElementById('dropArea');
    const fileInput = document.getElementById('imageFile');
    const browseBtn = document.querySelector('.file-browse-btn');
    
    if (browseBtn) {
        browseBtn.addEventListener('click', () => {
            if (fileInput) fileInput.click();
        });
    }
    
    if (dropArea) {
        dropArea.addEventListener('click', () => {
            if (fileInput) fileInput.click();
        });
        
        dropArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropArea.classList.add('dragover');
        });
        
        dropArea.addEventListener('dragleave', () => {
            dropArea.classList.remove('dragover');
        });
        
        dropArea.addEventListener('drop', (e) => {
            e.preventDefault();
            dropArea.classList.remove('dragover');
            if (e.dataTransfer.files.length) {
                handleFileSelect(e.dataTransfer.files[0]);
            }
        });
    }
    
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length) {
                handleFileSelect(e.target.files[0]);
            }
        });
    }
    
    // Remover imagem
    const removeImageBtn = document.querySelector('.preview-remove-btn');
    if (removeImageBtn) {
        removeImageBtn.addEventListener('click', function() {
            selectedFile = null;
            if (fileInput) fileInput.value = '';
            const previewContainer = document.getElementById('previewContainer');
            if (previewContainer) previewContainer.style.display = 'none';
            const fileInfoText = document.querySelector('.file-info-text');
            if (fileInfoText) {
                fileInfoText.textContent = 'Nenhuma imagem selecionada';
                fileInfoText.style.color = '';
                fileInfoText.style.fontWeight = '';
            }
        });
    }
    
    // Envio do formulário
    const uploadForm = document.getElementById('uploadForm');
    if (uploadForm) {
        uploadForm.addEventListener('submit', handleFormSubmit);
    }
    
    console.log('Modal de upload configurado com sucesso!'); // Para debug
});

function updateCharCount() {
    const nameInput = document.getElementById('characterName');
    const descInput = document.getElementById('description');
    
    if (nameInput) {
        const nameCount = nameInput.value.length;
        const nameCountEl = document.getElementById('nameCount');
        if (nameCountEl) nameCountEl.textContent = `${nameCount}/50`;
    }
    
    if (descInput) {
        const descCount = descInput.value.length;
        const descCountEl = document.getElementById('descCount');
        if (descCountEl) descCountEl.textContent = `${descCount}/500`;
    }
}

function addTag() {
    const tagsInput = document.getElementById('tagsInput');
    if (!tagsInput) return;
    
    const tag = tagsInput.value.trim().toLowerCase();
    
    if (tag && tag.length > 1 && !selectedTags.includes(tag)) {
        if (selectedTags.length >= 10) {
            showError('Máximo de 10 tags permitidas');
            return;
        }
        
        selectedTags.push(tag);
        renderTags();
        tagsInput.value = '';
        updateHiddenTags();
    }
}

function removeTag(tagToRemove) {
    selectedTags = selectedTags.filter(tag => tag !== tagToRemove);
    renderTags();
    updateHiddenTags();
}

function renderTags() {
    const tagsContainer = document.getElementById('tagsContainer');
    if (!tagsContainer) return;
    
    tagsContainer.innerHTML = selectedTags.map(tag => `
        <div class="tag-item">
            ${tag}
            <span class="tag-remove" onclick="removeTag('${tag}')">&times;</span>
        </div>
    `).join('');
}

function updateHiddenTags() {
    const tagsHiddenInput = document.getElementById('tags');
    if (tagsHiddenInput) {
        tagsHiddenInput.value = selectedTags.join(',');
        
        if (selectedTags.length === 0) {
            tagsHiddenInput.classList.add('invalid');
        } else {
            tagsHiddenInput.classList.remove('invalid');
        }
    }
}

function handleFileSelect(file) {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const maxSize = 10 * 1024 * 1024;
    
    if (!validTypes.includes(file.type)) {
        showError('Tipo de arquivo inválido. Use: JPEG, PNG, WEBP ou GIF.');
        return;
    }
    
    if (file.size > maxSize) {
        showError('Arquivo muito grande. Máximo: 10MB');
        return;
    }
    
    selectedFile = file;
    
    const fileInfoText = document.querySelector('.file-info-text');
    if (fileInfoText) {
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
        fileInfoText.textContent = `${file.name} (${fileSizeMB} MB)`;
        fileInfoText.style.color = '#000000';
        fileInfoText.style.fontWeight = 'bold';
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
        const imagePreview = document.getElementById('imagePreview');
        const previewContainer = document.getElementById('previewContainer');
        
        if (imagePreview) imagePreview.src = e.target.result;
        if (previewContainer) previewContainer.style.display = 'block';
    };
    reader.readAsDataURL(file);
}

async function handleFormSubmit(e) {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const submitBtn = document.querySelector('.submit-btn');
    const btnText = submitBtn?.querySelector('.btn-text');
    const spinner = submitBtn?.querySelector('.btn-spinner');
    const progressContainer = document.getElementById('uploadProgress');
    
    if (submitBtn) submitBtn.disabled = true;
    if (btnText) btnText.textContent = 'ENVIANDO...';
    if (spinner) spinner.style.display = 'inline-block';
    if (progressContainer) progressContainer.style.display = 'block';
    
    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('characterName', document.getElementById('characterName').value);
    formData.append('description', document.getElementById('description').value);
    formData.append('tags', selectedTags.join(','));
    
    const xhr = new XMLHttpRequest();
    const progressFill = document.getElementById('progressFill');
    const progressPercent = document.getElementById('progressPercent');
    const progressText = document.getElementById('progressText');
    
    xhr.upload.onprogress = function(e) {
        if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            if (progressFill) progressFill.style.width = percent + '%';
            if (progressPercent) progressPercent.textContent = percent + '%';
            if (progressText && percent < 100) {
                progressText.textContent = `Enviando: ${percent}%`;
            }
        }
    };
    
    xhr.onload = function() {
        if (xhr.status === 200) {
            try {
                const response = JSON.parse(xhr.responseText);
                
                if (progressFill) progressFill.style.width = '100%';
                if (progressPercent) progressPercent.textContent = '100%';
                if (progressText) progressText.textContent = 'Upload concluído! ✅';
                if (btnText) btnText.textContent = 'CONCLUÍDO';
                
                setTimeout(() => {
                    alert(`✅ Upload realizado com sucesso!\n\nPersonagem: ${response.characterName}\nID: ${response.imageId}`);
                    closeUploadModal();
                }, 1000);
                
            } catch (error) {
                handleUploadError('Erro ao processar resposta do servidor');
            }
        } else {
            handleUploadError('Erro no servidor');
        }
    };
    
    xhr.onerror = function() {
        handleUploadError('Erro de conexão');
    };
    
    try {
        xhr.open('POST', 'http://localhost:4000/api/upload');
        xhr.send(formData);
    } catch (error) {
        handleUploadError(error.message);
    }
}

function validateForm() {
    const nameInput = document.getElementById('characterName');
    const descInput = document.getElementById('description');
    
    if (!nameInput?.value.trim()) {
        showError('Por favor, insira o nome do personagem');
        nameInput?.focus();
        return false;
    }
    
    if (nameInput.value.length > 50) {
        showError('Nome muito longo (max 50 caracteres)');
        nameInput.focus();
        return false;
    }
    
    if (selectedTags.length === 0) {
        showError('Adicione pelo menos uma tag');
        document.getElementById('tagsInput')?.focus();
        return false;
    }
    
    if (!descInput?.value.trim()) {
        showError('Por favor, insira uma descrição');
        descInput?.focus();
        return false;
    }
    
    if (descInput.value.length > 500) {
        showError('Descrição muito longa (max 500 caracteres)');
        descInput.focus();
        return false;
    }
    
    if (!selectedFile) {
        showError('Por favor, selecione uma imagem');
        return false;
    }
    
    return true;
}

function handleUploadError(message) {
    const submitBtn = document.querySelector('.submit-btn');
    const btnText = submitBtn?.querySelector('.btn-text');
    const spinner = submitBtn?.querySelector('.btn-spinner');
    
    if (submitBtn) submitBtn.disabled = false;
    if (btnText) btnText.textContent = 'FAZER UPLOAD';
    if (spinner) spinner.style.display = 'none';
    
    showError(`Erro no upload: ${message}`);
}

function closeUploadModal() {
    const modal = document.getElementById('uploadModal');
    if (modal) modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    resetUploadForm();
}

function resetUploadForm() {
    const form = document.getElementById('uploadForm');
    if (form) form.reset();
    
    selectedTags = [];
    selectedFile = null;
    
    const tagsContainer = document.getElementById('tagsContainer');
    if (tagsContainer) {
        tagsContainer.innerHTML = `
            <div class="tag-example">
                <span>anime</span>
                <span class="tag-example-close">&times;</span>
            </div>
            <div class="tag-example">
                <span>protagonista</span>
                                <span class="tag-example-close">&times;</span>
            </div>
        `;
    }
    
    const previewContainer = document.getElementById('previewContainer');
    if (previewContainer) previewContainer.style.display = 'none';
    
    const fileInfoText = document.querySelector('.file-info-text');
    if (fileInfoText) {
        fileInfoText.textContent = 'Nenhuma imagem selecionada';
        fileInfoText.style.color = '';
        fileInfoText.style.fontWeight = '';
    }
    
    updateCharCount();
    
    const submitBtn = document.querySelector('.submit-btn');
    const btnText = submitBtn?.querySelector('.btn-text');
    const submitSpinner = submitBtn?.querySelector('.btn-spinner');
    
    if (submitBtn) submitBtn.disabled = false;
    if (btnText) btnText.textContent = 'FAZER UPLOAD';
    if (submitSpinner) submitSpinner.style.display = 'none';
    
    const progressContainer = document.getElementById('uploadProgress');
    if (progressContainer) progressContainer.style.display = 'none';
    
    const progressFill = document.getElementById('progressFill');
    if (progressFill) progressFill.style.width = '0%';
    
    const progressPercent = document.getElementById('progressPercent');
    if (progressPercent) progressPercent.textContent = '0%';
}

// Adicionar função global para debug
window.openUploadModal = function() {
    document.getElementById('uploadModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
};
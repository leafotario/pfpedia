// Preview e validação da imagem quando o usuário seleciona um arquivo
document.getElementById('pfp-image').addEventListener('change', function(e) {
    const file = e.target.files[0];
    const preview = document.getElementById('image-preview');
    const placeholder = document.querySelector('.preview-placeholder');
    const submitButton = document.querySelector('.submit-button');
    
    if (!file) {
        preview.innerHTML = '';
        preview.classList.remove('active');
        placeholder.style.display = 'flex';
        submitButton.disabled = false;
        return;
    }
    
    // Validação de tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
        alert('Invalid file type. Please upload a JPEG, PNG, or WebP image.');
        this.value = '';
        return;
    }
    
    // Validação de tamanho (5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB em bytes
    if (file.size > maxSize) {
        alert('File is too large. Maximum size is 5MB.');
        this.value = '';
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const img = new Image();
        
        img.onload = function() {
            // Validação de dimensões
            const minDimension = 256;
            const maxDimension = 2048;
            
            if (img.width < minDimension || img.height < minDimension) {
                alert(`Image is too small. Minimum dimensions are ${minDimension}x${minDimension} pixels.`);
                document.getElementById('pfp-image').value = '';
                return;
            }
            
            if (img.width > maxDimension || img.height > maxDimension) {
                alert(`Image is too large. Maximum dimensions are ${maxDimension}x${maxDimension} pixels.`);
                document.getElementById('pfp-image').value = '';
                return;
            }
            
            // Se passar em todas as validações, mostra o preview
            preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
            preview.classList.add('active');
            placeholder.style.display = 'none';
        };
        
        img.src = e.target.result;
    };
    
    reader.readAsDataURL(file);
});

// Validação adicional no submit do formulário
document.getElementById('upload-form').addEventListener('submit', function(e) {
    const fileInput = document.getElementById('pfp-image');
    const termsCheckbox = document.getElementById('terms-checkbox');
    
    if (!fileInput.files[0]) {
        e.preventDefault();
        alert('Please select an image to upload.');
        return;
    }
    
    if (!termsCheckbox.checked) {
        e.preventDefault();
        alert('You must agree to the terms of service and content guidelines.');
        return;
    }
});

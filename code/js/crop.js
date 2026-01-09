        // Variáveis globais
        let cropper = null;
        let currentFile = null;
        let croppedBlob = null;

        const fileInput = document.getElementById('pfp-image');
        const cropModal = document.getElementById('crop-modal');
        const cropImage = document.getElementById('crop-image');
        const cropClose = document.getElementById('crop-close');
        const cropCancel = document.getElementById('crop-cancel');
        const cropConfirm = document.getElementById('crop-confirm');
        const preview = document.getElementById('image-preview');
        const placeholder = document.querySelector('.preview-placeholder');

        // Quando seleciona arquivo
        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            
            if (!file) {
                resetPreview();
                return;
            }
            
            // Validação de tipo
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                alert('Invalid file type. Please upload a JPEG, PNG, or WebP image.');
                this.value = '';
                return;
            }
            
            // Validação de tamanho (5MB)
            const maxSize = 5 * 1024 * 1024;
            if (file.size > maxSize) {
                alert('File is too large. Maximum size is 5MB.');
                this.value = '';
                return;
            }
            
            currentFile = file;
            openCropModal(file);
        });

        // Abre modal de crop
        function openCropModal(file) {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                cropImage.src = e.target.result;
                cropModal.classList.add('active');
                
                // Inicializa cropper
                if (cropper) {
                    cropper.destroy();
                }
                
                cropper = new Cropper(cropImage, {
                    aspectRatio: 1,
                    viewMode: 1,
                    dragMode: 'move',
                    autoCropArea: 1,
                    restore: false,
                    guides: true,
                    center: true,
                    highlight: false,
                    cropBoxMovable: true,
                    cropBoxResizable: true,
                    toggleDragModeOnDblclick: false,
                });
            };
            
            reader.readAsDataURL(file);
        }

        // Fecha modal
        function closeCropModal() {
            cropModal.classList.remove('active');
            if (cropper) {
                cropper.destroy();
                cropper = null;
            }
        }

        cropClose.addEventListener('click', function() {
            closeCropModal();
            fileInput.value = '';
            resetPreview();
        });

        cropCancel.addEventListener('click', function() {
            closeCropModal();
            fileInput.value = '';
            resetPreview();
        });

        // Confirma crop
        cropConfirm.addEventListener('click', function() {
            if (!cropper) return;
            
            const canvas = cropper.getCroppedCanvas({
                width: 800,
                height: 800,
                imageSmoothingEnabled: true,
                imageSmoothingQuality: 'high',
            });
            
            canvas.toBlob(function(blob) {
                croppedBlob = blob;
                
                // Mostra preview da imagem cropada
                const url = URL.createObjectURL(blob);
                preview.innerHTML = `<img src="${url}" alt="Preview">`;
                preview.classList.add('active');
                placeholder.style.display = 'none';
                
                closeCropModal();
            }, 'image/jpeg', 0.95);
        });

        // Reset preview
        function resetPreview() {
            preview.innerHTML = '';
            preview.classList.remove('active');
            placeholder.style.display = 'flex';
            croppedBlob = null;
        }

        // Validação no submit
        document.getElementById('upload-form').addEventListener('submit', function(e) {
            const termsCheckbox = document.getElementById('terms-checkbox');
            
            if (!croppedBlob && !fileInput.files[0]) {
                e.preventDefault();
                alert('Please select an image to upload.');
                return;
            }
            
            if (!termsCheckbox.checked) {
                e.preventDefault();
                alert('You must agree to the terms of service and content guidelines.');
                return;
            }

            // Se tem imagem cropada, substitui o arquivo original
            if (croppedBlob) {
                e.preventDefault();
                
                const formData = new FormData(this);
                formData.delete('pfp-image');
                formData.append('pfp-image', croppedBlob, currentFile.name);
                
                // Aqui você enviaria o formData via fetch/ajax
                console.log('Sending cropped image...');
                // fetch('/upload', { method: 'POST', body: formData })
            }
        });

        // Fecha modal ao clicar fora
        cropModal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeCropModal();
                fileInput.value = '';
                resetPreview();
            }
        });

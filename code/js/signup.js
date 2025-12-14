// ================================================================================
// SIGNUP.JS - FUNCIONALIDADE DA PÁGINA DE CADASTRO
// ================================================================================
// 
// Este arquivo gerencia toda a interação do formulário de cadastro, incluindo:
// - Validação de campos em tempo real
// - Mostrar/ocultar senhas
// - Verificação de senhas correspondentes
// - Envio do formulário
// - Exibição de mensagens de erro
// - Animação de sucesso
// 
// ================================================================================

// Aguarda o DOM carregar completamente
document.addEventListener('DOMContentLoaded', function() {
    
    // ===== ELEMENTOS DO FORMULÁRIO =====
    const form = document.getElementById('signup-form');
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const termsCheckbox = document.getElementById('terms');
    
    // ===== ELEMENTOS DE ERRO =====
    const usernameError = document.getElementById('username-error');
    const emailError = document.getElementById('email-error');
    const passwordError = document.getElementById('password-error');
    const confirmPasswordError = document.getElementById('confirm-password-error');
    const termsError = document.getElementById('terms-error');
    
    // ===== BOTÕES DE MOSTRAR/OCULTAR SENHA =====
    const togglePassword = document.getElementById('toggle-password');
    const toggleConfirmPassword = document.getElementById('toggle-confirm-password');
    
    // ===== MENSAGEM DE SUCESSO =====
    const successMessage = document.getElementById('success-message');
    
    
    // ================================================================================
    // FUNÇÕES DE MOSTRAR/OCULTAR SENHA
    // ================================================================================
    
    togglePassword.addEventListener('click', function() {
        togglePasswordVisibility(passwordInput, this);
    });
    
    toggleConfirmPassword.addEventListener('click', function() {
        togglePasswordVisibility(confirmPasswordInput, this);
    });
    
    function togglePasswordVisibility(input, button) {
        const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
        input.setAttribute('type', type);
        
        // Alterna o ícone do olho
        const eyeIcon = button.querySelector('.eye-icon');
        eyeIcon.textContent = type === 'password' ? '👁️' : '🙈';
    }
    
    
    // ================================================================================
    // VALIDAÇÕES EM TEMPO REAL
    // ================================================================================
    
    // Validação do username
    usernameInput.addEventListener('input', function() {
        clearError(usernameError);
        
        const username = this.value.trim();
        
        if (username.length > 0 && username.length < 3) {
            showError(usernameError, 'username must be at least 3 characters');
        } else if (username.length > 20) {
            showError(usernameError, 'username cannot exceed 20 characters');
        } else if (!/^[a-zA-Z0-9]*$/.test(username)) {
            showError(usernameError, 'username can only contain letters and numbers');
        }
    });
    
    // Validação do email
    emailInput.addEventListener('input', function() {
        clearError(emailError);
        
        const email = this.value.trim();
        
        if (email.length > 0 && !isValidEmail(email)) {
            showError(emailError, 'please enter a valid email address');
        }
    });
    
    // Validação da senha
    passwordInput.addEventListener('input', function() {
        clearError(passwordError);
        
        const password = this.value;
        
        if (password.length > 0 && password.length < 8) {
            showError(passwordError, 'password must be at least 8 characters');
        }
        
        // Revalidar confirmação se já foi preenchida
        if (confirmPasswordInput.value.length > 0) {
            validatePasswordMatch();
        }
    });
    
    // Validação da confirmação de senha
    confirmPasswordInput.addEventListener('input', function() {
        validatePasswordMatch();
    });
    
    // Validação dos termos
    termsCheckbox.addEventListener('change', function() {
        clearError(termsError);
    });
    
    
    // ================================================================================
    // VALIDAÇÃO DO FORMULÁRIO NO SUBMIT
    // ================================================================================
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Limpa todos os erros
        clearAllErrors();
        
        let isValid = true;
        
        // Valida username
        const username = usernameInput.value.trim();
        if (username.length === 0) {
            showError(usernameError, 'username is required');
            isValid = false;
        } else if (username.length < 3) {
            showError(usernameError, 'username must be at least 3 characters');
            isValid = false;
        } else if (username.length > 20) {
            showError(usernameError, 'username cannot exceed 20 characters');
            isValid = false;
        } else if (!/^[a-zA-Z0-9]+$/.test(username)) {
            showError(usernameError, 'username can only contain letters and numbers');
            isValid = false;
        }
        
        // Valida email
        const email = emailInput.value.trim();
        if (email.length === 0) {
            showError(emailError, 'email is required');
            isValid = false;
        } else if (!isValidEmail(email)) {
            showError(emailError, 'please enter a valid email address');
            isValid = false;
        }
        
        // Valida senha
        const password = passwordInput.value;
        if (password.length === 0) {
            showError(passwordError, 'password is required');
            isValid = false;
        } else if (password.length < 8) {
            showError(passwordError, 'password must be at least 8 characters');
            isValid = false;
        }
        
        // Valida confirmação de senha
        const confirmPassword = confirmPasswordInput.value;
        if (confirmPassword.length === 0) {
            showError(confirmPasswordError, 'please confirm your password');
            isValid = false;
        } else if (password !== confirmPassword) {
            showError(confirmPasswordError, 'passwords do not match');
            isValid = false;
        }
        
        // Valida termos
        if (!termsCheckbox.checked) {
            showError(termsError, 'you must agree to the community rules');
            isValid = false;
        }
        
        // Se tudo estiver válido, processa o formulário
        if (isValid) {
            processForm();
        } else {
            // Foca no primeiro campo com erro
            const firstError = document.querySelector('.input-error.show');
            if (firstError) {
                const inputId = firstError.id.replace('-error', '');
                const input = document.getElementById(inputId);
                if (input) {
                    input.focus();
                }
            }
        }
    });
    
    
    // ================================================================================
    // FUNÇÕES AUXILIARES
    // ================================================================================
    
    function validatePasswordMatch() {
        clearError(confirmPasswordError);
        
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        if (confirmPassword.length > 0 && password !== confirmPassword) {
            showError(confirmPasswordError, 'passwords do not match');
        }
    }
    
    function isValidEmail(email) {
        // Regex simples para validação de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    function showError(errorElement, message) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }
    
    function clearError(errorElement) {
        errorElement.textContent = '';
        errorElement.classList.remove('show');
    }
    
    function clearAllErrors() {
        const allErrors = document.querySelectorAll('.input-error');
        allErrors.forEach(error => clearError(error));
    }
    
    function processForm() {
        // Aqui você implementaria a lógica real de cadastro
        // Por enquanto, apenas simula um cadastro bem-sucedido
        
        console.log('Form submitted successfully!');
        console.log({
            username: usernameInput.value.trim(),
            email: emailInput.value.trim(),
            password: '***hidden***',
            termsAccepted: termsCheckbox.checked
        });
        
        // Esconde o formulário e mostra mensagem de sucesso
        form.style.display = 'none';
        successMessage.classList.add('show');
        
        // Scroll suave até o topo
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        
        // AQUI VOCÊ ADICIONARIA:
        // - Chamada para API de cadastro
        // - Envio de dados para o servidor
        // - Tratamento de erros do servidor
        // - Redirecionamento após sucesso
        
        // Exemplo de como seria com uma API:
        /*
        fetch('/api/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: usernameInput.value.trim(),
                email: emailInput.value.trim(),
                password: passwordInput.value,
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                form.style.display = 'none';
                successMessage.classList.add('show');
            } else {
                // Mostrar erro do servidor
                showError(emailError, data.message || 'An error occurred');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showError(emailError, 'Network error. Please try again.');
        });
        */
    }
});

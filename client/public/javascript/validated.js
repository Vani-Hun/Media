const emailInput = document.querySelector('input[name="email"]')
const phoneInput = document.querySelector('input[name="phone"]')
const cicInput = document.querySelector('input[name="card"]')
const buttonFile = document.getElementById('cv')
const fileInput = document.querySelector('input[name="cv"]')
const btnSubmit = document.querySelector('#btnSubmit')
function validateForm() {
    let errorCount = 0
    // validate email
    let emailRegex = /^\S+@\S+\.\S+$/
    let emailValue = emailInput.value.trim()
    let emailError = document.getElementById('email-error')
    if (emailValue !== '' && !emailRegex.test(emailValue)) {
        emailError.innerHTML = 'Invalid email'
        emailInput.classList.add('error-border')
        errorCount++
    } else {
        emailError.innerHTML = ''
        emailInput.classList.remove('error-border')
        errorCount
    }
    // validate phone
    let phoneRegex = /^[0-9]{10,11}$/
    let phoneValue = phoneInput.value.trim()
    let phoneError = document.getElementById('phone-error')
    if (phoneValue !== '' && !phoneRegex.test(phoneValue)) {
        phoneError.innerHTML = 'Invalid phone number'
        phoneInput.classList.add('error-border')
        errorCount++
    } else {
        phoneError.innerHTML = ''
        phoneInput.classList.remove('error-border')
        errorCount
    }
    // validate cic
    let cicRegex = /^[0-9]{12}$/
    let cicValue = cicInput.value.trim()
    let cicError = document.getElementById('cic-error')
    if (cicValue !== '' && !cicRegex.test(cicValue)) {
        cicError.innerHTML = 'Invalid citizen identification'
        cicInput.classList.add('error-border')
        errorCount++
    } else {
        cicError.innerHTML = ''
        cicInput.classList.remove('error-border')
        errorCount
    }
    // validate file
    const file = fileInput.files[0]
    const fileError = document.getElementById('file-error')
    if (typeof file !== 'undefined' && file.size > 5242880) {
        fileError.innerHTML = 'File size is too large ( less than 5MB )'
        buttonFile.classList.add('error-upload')
        errorCount++
    } else {
        fileError.innerHTML = ''
        buttonFile.classList.remove('error-upload')
        errorCount
    }
    if (errorCount > 0) {
        btnSubmit.disabled = true
    } else {
        btnSubmit.disabled = false
    }
}
emailInput.addEventListener('input', validateForm)
phoneInput.addEventListener('input', validateForm)
cicInput.addEventListener('input', validateForm)
fileInput.addEventListener('change', validateForm)

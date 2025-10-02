// contact.js — registration form handler
// Wait for DOM to be ready (defer in head also ensures DOM is ready)

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registrationForm');
    const confirmationMessage = document.getElementById('confirmationMessage');

    if (!form) {
        console.warn('Registration form not found.');
        return;
    }

    // Replace with your Google Apps Script / server endpoint that accepts POST
    const scriptURL = 'https://script.google.com/macros/s/AKfycbznrSkMUiLEAiHqcurTdIqUZ6SgTjV9UWk8iawineix6T9fq6nAJr4YeKxleOoMD8YXyA/exec';

    // Set the form to post directly to the Apps Script and target the hidden iframe
    form.action = scriptURL;
    form.target = 'hidden_iframe';

    // When the hidden iframe loads, show confirmation (the response page from Apps Script will have loaded)
    const iframe = document.getElementById('hidden_iframe');
    if (iframe) {
        iframe.addEventListener('load', () => {
            if (confirmationMessage) confirmationMessage.style.display = 'block';
        });
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // simple validation
        const fullName = (document.getElementById('fullName') || {}).value?.trim() || '';
        const email = (document.getElementById('email') || {}).value?.trim() || '';
        if (!fullName) { alert('Please enter your full name.'); return; }
        if (!email) { alert('Please enter your email.'); return; }

        // Submit the form (browser will post to Apps Script via the iframe and avoid fetch/CORS)
        form.submit();
        form.reset();
    });
});

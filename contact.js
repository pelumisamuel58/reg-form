// contact.js — registration form handler
// Wait for DOM to be ready (defer in head also ensures DOM is ready)

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registrationForm');
    const confirmationMessage = document.getElementById('confirmationMessage');

    if (!form) {
        console.warn('Registration form not found.');
        return;
    }

    

    // Set the form action and ensure we target the hidden iframe for background POST
    // If the form has a data-redirect attribute, we prefer redirect behavior and do not set a POST target.
    // If it has a data-google-action that looks like a formResponse endpoint, use it for background POSTs.
    const googleAction = (form.dataset.googleAction || '').trim();
    const redirect = (form.dataset.redirect || '').trim();
    if (redirect) {
        // Leave action/target alone; form's onsubmit fallback will handle no-JS case.
        console.log('Form configured to redirect to:', redirect);
    } else if (googleAction && googleAction.includes('/formResponse')) {
        form.action = googleAction;
        form.target = 'hidden_iframe';
        console.log('Form will post in background to:', googleAction);
    } else {
        // No redirect and no valid googleAction — avoid setting an action that posts to the local page.
        console.warn('No redirect or valid Google Form action found; form will not be posted automatically.');
    }

    // When the hidden iframe loads, show confirmation (the response page from Apps Script will have loaded)
    const iframe = document.getElementById('hidden_iframe');
    if (iframe) {
        iframe.addEventListener('load', () => {
            console.log('hidden_iframe loaded — server responded');
            if (confirmationMessage) {
                confirmationMessage.style.display = 'block';
                confirmationMessage.textContent = 'Thank you for registering! We received your details.';
            }
            // Re-enable submit button and only reset the form after the iframe response arrives
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = false;
                // restore original label if we changed it
                if (submitBtn.dataset && submitBtn.dataset.origText) {
                    submitBtn.textContent = submitBtn.dataset.origText;
                    delete submitBtn.dataset.origText;
                }
            }
            if (form._submitted) {
                try { form.reset(); } catch (err) { console.warn('form.reset failed', err); }
                form._submitted = false;
                // After a short delay, silently reload the page so the UI is fresh.
                setTimeout(() => {
                    try {
                        // Use reload that may use cache; if you prefer hard reload, set true
                        window.location.reload();
                    } catch (err) {
                        console.warn('reload failed', err);
                    }
                }, 800);
            }
        });
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // simple validation
        const fullName = (document.getElementById('fullName') || {}).value?.trim() || '';
        const email = (document.getElementById('email') || {}).value?.trim() || '';
        if (!fullName) { alert('Please enter your full name.'); return; }
        if (!email) { alert('Please enter your email.'); return; }

        // If the form has a data-redirect attribute, navigate there after validation
        const redirectUrl = form.dataset.redirect && form.dataset.redirect.trim();
        if (redirectUrl) {
            // optional: add a short delay to show disabled state before redirecting
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.dataset.origText = submitBtn.textContent;
                submitBtn.textContent = 'Redirecting...';
            }
            window.location.href = redirectUrl;
            return;
        }

        // Submit the form (browser will post to Apps Script or Google Form via the iframe)
        // Disable submit button to prevent duplicate submissions and show a sending state
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            // optionally update the label to indicate sending
            submitBtn.dataset.origText = submitBtn.textContent;
            submitBtn.textContent = 'Sending...';
        }
        if (confirmationMessage) confirmationMessage.style.display = 'none';
        form._submitted = true; // flag so iframe load handler knows to reset
        try {
            form.submit();
        } catch (err) {
            console.error('form.submit() failed', err);
            if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = submitBtn.dataset.origText || 'SUBMIT'; }
        }
    });
});

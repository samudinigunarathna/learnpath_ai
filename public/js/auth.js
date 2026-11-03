document.addEventListener("DOMContentLoaded", () => {

    const form = document.querySelector("form");

    if (!form) return;

    const isRegisterPage = form.dataset.authForm === "register";
    const isLoginPage = form.dataset.authForm === "login";

    const message = document.getElementById("formMessage");

    // Display an error
    function showError(fieldId, text) {
        const error = document.getElementById(fieldId + "Error");

        if (error) {
            error.textContent = text;
        }
    }

    // Clear an error
    function clearError(fieldId) {
        const error = document.getElementById(fieldId + "Error");

        if (error) {
            error.textContent = "";
        }
    }

    // Validate text fields
    function validateText(fieldId, min, max) {
        const field = document.getElementById(fieldId);

        if (!field) return false;

        const value = field.value.trim();

        if (value.length < min || value.length > max) {
            showError(fieldId, `Must contain ${min}-${max} characters.`);
            return false;
        }

        clearError(fieldId);
        return true;
    }

    // Validate email
    function validateEmail() {
        const field = document.getElementById("email");

        if (!field) return false;

        const email = field.value.trim();
        const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (
            email.length < 12 ||
            email.length > 50 ||
            !pattern.test(email)
        ) {
            showError(
                "email",
                "Enter a valid email address (12-50 characters)."
            );
            return false;
        }

        clearError("email");
        return true;
    }

    // Validate registration password
    function validateRegistrationPassword() {
        const field = document.getElementById("password");

        if (!field) return false;

        const pattern =
            /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9\s]).{8,12}$/;

        if (!pattern.test(field.value)) {
            showError(
                "password",
                "Use 8-12 characters with a letter, number and symbol."
            );
            return false;
        }

        clearError("password");
        return true;
    }

    // Validate login password
    function validateLoginPassword() {
        const field = document.getElementById("password");

        if (!field || field.value.trim() === "") {
            showError("password", "Password is required.");
            return false;
        }

        clearError("password");
        return true;
    }

    // Confirm password
    function validateConfirmPassword() {
        const password = document.getElementById("password");
        const confirm = document.getElementById("confirmPassword");

        if (!password || !confirm) return false;

        if (confirm.value === "" || password.value !== confirm.value) {
            showError("confirmPassword", "Passwords do not match.");
            return false;
        }

        clearError("confirmPassword");
        return true;
    }

    // Validate language
    function validateLanguage() {
        const field = document.getElementById("language");

        if (!field || !["en", "si", "ta"].includes(field.value)) {
            showError("language", "Please select a language.");
            return false;
        }

        clearError("language");
        return true;
    }

    // Validate terms
    function validateTerms() {
        const field = document.getElementById("terms");

        if (!field || !field.checked) {
            showError("terms", "Please accept the Terms and Conditions.");
            return false;
        }

        clearError("terms");
        return true;
    }

    // Validate registration form
    function validateRegistration() {
        return (
            validateText("fullName", 12, 100) &&
            validateText("schoolName", 12, 100) &&
            validateText("grade", 1, 30) &&
            validateEmail() &&
            validateRegistrationPassword() &&
            validateConfirmPassword() &&
            validateLanguage() &&
            validateTerms()
        );
    }

    // Validate login form
    function validateLogin() {
        return validateEmail() && validateLoginPassword();
    }

    // Show form message
    function showMessage(text, success = false) {
        if (!message) return;

        message.textContent = text;
        message.style.color = success ? "green" : "red";
    }

    // Submit school registration to backend
    async function registerStudent() {
        const formData = {
            fullName: document.getElementById("fullName").value.trim(),
            schoolName: document.getElementById("schoolName").value.trim(),
            grade: document.getElementById("grade").value.trim(),
            email: document.getElementById("email").value.trim(),
            password: document.getElementById("password").value,
            confirmPassword: document.getElementById("confirmPassword").value,
            language: document.getElementById("language").value,
            terms: document.getElementById("terms").checked
        };

        try {
            const response = await fetch("/api/students/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                showMessage(data.message || "Registration failed.");
                return;
            }

            showMessage(data.message || "Registration successful!", true);

            form.reset();

        } catch (error) {
            console.error("Registration error:", error);
            showMessage(
                "Unable to connect to the server. Please try again."
            );
        }
    }

    // Submit student login to backend
    async function loginStudent() {
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        try {
            const response = await fetch("/api/students/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                showMessage(data.message || "Login failed.");
                return;
            }

            // Store login information for this browser session
            sessionStorage.setItem("studentToken", data.token);
            sessionStorage.setItem(
                "studentData",
                JSON.stringify(data.student)
            );

            showMessage("Login successful! Welcome back.", true);

            console.log("Student logged in:", data.student);

        } catch (error) {
            console.error("Login error:", error);
            showMessage(
                "Unable to connect to the server. Please try again."
            );
        }
    }

    // Form submission
    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (isRegisterPage) {

            if (!validateRegistration()) {
                showMessage("Please correct the errors above.");
                return;
            }

            const submitButton = form.querySelector('[type="submit"]');

            if (submitButton) submitButton.disabled = true;

            showMessage("Creating your account...", true);

            try {
                await registerStudent();
            } finally {
                if (submitButton) submitButton.disabled = false;
            }

        } else if (isLoginPage) {

            if (!validateLogin()) {
                showMessage("Please correct the errors above.");
                return;
            }

            const submitButton = form.querySelector('[type="submit"]');

            if (submitButton) submitButton.disabled = true;

            showMessage("Logging in...", true);

            try {
                await loginStudent();
            } finally {
                if (submitButton) submitButton.disabled = false;
            }
        }
    });

    // Clear errors when editing fields
    form.querySelectorAll("input, select").forEach(field => {
        field.addEventListener("input", () => clearError(field.id));
        field.addEventListener("change", () => clearError(field.id));
    });

    // Show / Hide password
    document.querySelectorAll(".toggle-password").forEach(button => {
        button.addEventListener("click", () => {
            const target = document.getElementById(button.dataset.target);

            if (!target) return;

            if (target.type === "password") {
                target.type = "text";
                button.textContent = "Hide";
            } else {
                target.type = "password";
                button.textContent = "Show";
            }
        });
    });

});
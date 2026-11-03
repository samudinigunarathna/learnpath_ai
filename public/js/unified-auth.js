document.addEventListener("DOMContentLoaded", () => {

    const modal = document.getElementById("authModal");
    const modalTitle = document.getElementById("modalTitle");
    const closeButton = document.getElementById("closeModal");

    const tabs = document.querySelectorAll(".auth-tab");
    const categoryButtons = document.querySelectorAll(".open-auth");

    let selectedCategory = "school";
    let selectedMode = "register";

    // All authentication forms
    const forms = {
        school: {
            register: document.getElementById("schoolRegisterForm"),
            login: document.getElementById("schoolLoginForm")
        },

        university: {
            register: document.getElementById("universityRegisterForm"),
            login: document.getElementById("universityLoginForm")
        }
    };

    // Update the visible form
    function updateAuthForm() {

        // Hide all forms
        Object.values(forms).forEach(category => {
            Object.values(category).forEach(form => {
                form.hidden = true;
            });
        });

        // Show selected form
        const activeForm = forms[selectedCategory][selectedMode];

        if (activeForm) {
            activeForm.hidden = false;
        }

        // Update title
        modalTitle.textContent =
            selectedCategory === "school"
                ? "School Student Authentication"
                : "University Student Authentication";

        // Update active tab
        tabs.forEach(tab => {
            tab.classList.toggle(
                "active",
                tab.dataset.mode === selectedMode
            );
        });
    }

    // Open authentication popup
    categoryButtons.forEach(button => {

        button.addEventListener("click", () => {

            selectedCategory = button.dataset.category;
            selectedMode = "register";

            updateAuthForm();

            modal.hidden = false;

            document.body.style.overflow = "hidden";

        });

    });

    // Switch between Register and Login
    tabs.forEach(tab => {

        tab.addEventListener("click", () => {

            selectedMode = tab.dataset.mode;

            updateAuthForm();

        });

    });

    // Close popup
    function closeModal() {

        modal.hidden = true;

        document.body.style.overflow = "";

    }

    closeButton.addEventListener("click", closeModal);

    // Close when clicking outside the popup
    modal.addEventListener("click", (event) => {

        if (event.target === modal) {
            closeModal();
        }

    });

    // Close using Escape key
    document.addEventListener("keydown", (event) => {

        if (event.key === "Escape" && !modal.hidden) {
            closeModal();
        }

    });

});
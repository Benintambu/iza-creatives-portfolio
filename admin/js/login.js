import { supabase } from "../../js/supabase.js";

const form = document.getElementById("loginForm");

if (form) {
    form.addEventListener("submit", async (e) => {

        e.preventDefault();

        const email = document.getElementById("email").value;

        const password = document.getElementById("password").value;

        const { error } = await supabase.auth.signInWithPassword({

            email,
            password

        });

        if (error) {

            alert(error.message);

            return;

        }

        window.location.href = "/admin/dashboard.html";

    });
}

export function initializePasswordToggle(password, passwordToogle) {
    const passwordInput = document.getElementById(password);
    const passwordToggle = document.querySelector(passwordToogle);

    if (!passwordInput || !passwordToggle || passwordToggle.dataset.toggleInitialized === "true") return;

    passwordToggle.dataset.toggleInitialized = "true";

    const togglePasswordVisibility = () => {
        const isPassword = passwordInput.type === "password";
        passwordInput.type = isPassword ? "text" : "password";

        if (passwordToggle.classList.contains("fa-eye") || passwordToggle.classList.contains("fa-eye-slash")) {
            passwordToggle.classList.toggle("fa-eye", isPassword);
            passwordToggle.classList.toggle("fa-eye-slash", !isPassword);
        } else {
            passwordToggle.classList.toggle("bx-eye", isPassword);
            passwordToggle.classList.toggle("bx-eye-slash", !isPassword);
        }
    };

    passwordToggle.addEventListener("click", togglePasswordVisibility);
    passwordToggle.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            togglePasswordVisibility();
        }
    });
}

if (document.getElementById("password") && document.querySelector(".password-toggle")) {
    initializePasswordToggle("password", ".password-toggle");
}
import { supabase } from "../../js/supabase.js";

const form = document.getElementById("loginForm");

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

function initializePasswordToggle() {
    const passwordInput = document.getElementById("password");
    const passwordToggle = document.querySelector(".password-toggle");

    if (!passwordInput || !passwordToggle) return;

    const togglePasswordVisibility = () => {
        const isPassword = passwordInput.type === "password";
        passwordInput.type = isPassword ? "text" : "password";
        passwordToggle.classList.toggle("bx-eye", isPassword);
        passwordToggle.classList.toggle("bx-eye-slash", !isPassword);
    };

    passwordToggle.addEventListener("click", togglePasswordVisibility);
    passwordToggle.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            togglePasswordVisibility();
        }
    });
}

initializePasswordToggle();
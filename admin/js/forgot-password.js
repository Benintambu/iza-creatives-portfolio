import { supabase } from "../../js/supabase.js";

const form = document.getElementById("resetRequestForm");

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const email = document.getElementById("email").value;

    const { error } = await supabase.auth.resetPasswordForEmail(
        email,
        {
            redirectTo:
                "http://iza-creatives.com/admin/reset-password"
        }
    );

    const message = document.getElementById("message");

    if (error) {

        message.textContent = error.message;

    } else {

        message.textContent =
            "Un email de réinitialisation a été envoyé.";

    }

});
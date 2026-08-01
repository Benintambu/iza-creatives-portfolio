import { supabase } from "../../js/supabase.js";
import { initializePasswordToggle } from "./login.js";


const form = document.getElementById("newPasswordForm");

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const password =
        document.getElementById("password").value;

    const { error } =
        await supabase.auth.updateUser({
            password
        });

    if (error) {

        alert(error.message);

    } else {

        alert("Mot de passe modifié avec succès.");

        window.location.href = "./login.html";

    }

});

initializePasswordToggle("password", ".password-toggle");

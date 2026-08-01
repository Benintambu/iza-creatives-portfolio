/* BUTTON DECONNEXION */

const logoutBtn = document.getElementById("logout");
if (logoutBtn) {
    logoutBtn.addEventListener("click", async (event) => {
        event.preventDefault();
        event.stopPropagation();

        try {
            await supabase.auth.signOut({ scope: "global" });
        } catch (error) {
            console.error("Erreur lors de la déconnexion :", error);
        }

        Object.keys(localStorage)
            .filter((key) => key.startsWith("sb-"))
            .forEach((key) => localStorage.removeItem(key));

        sessionStorage.clear();
        window.location.assign("/admin/index.html");
    });
}
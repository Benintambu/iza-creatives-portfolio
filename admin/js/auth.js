import { supabase } from "../../js/supabase.js";

console.log("Auth lancé");

const { data, error } = await supabase.auth.getSession();


if (!data.session) {
    window.location.href = "/admin//index.html";
} else {
}
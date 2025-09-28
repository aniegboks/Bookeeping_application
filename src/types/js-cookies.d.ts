import Cookies from "js-cookie";

// Example
Cookies.set("token", "abc123", { expires: 7 });
const token = Cookies.get("token"); // type: string | undefined

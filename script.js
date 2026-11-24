
async function checkPassword() {
    let password = document.getElementById("password").value;
    let strengthBar = document.getElementById("strength-bar");
    let result = document.getElementById("result");

    let strength = 0;

    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[!@#$%^&*()_+\-]/.test(password)) strength++;

    if (strength <= 2) {
        strengthBar.style.width = "30%";
        strengthBar.style.background = "red";
        result.innerHTML = "Weak Password";
    } 
    else if (strength <= 4) {
        strengthBar.style.width = "60%";
        strengthBar.style.background = "orange";
        result.innerHTML = "Medium Password";
    } 
    else {
        strengthBar.style.width = "100%";
        strengthBar.style.background = "green";
        result.innerHTML = "Strong Password";
    }

    if (password.length > 0) {
        checkBreach(password);
    } else {
        strengthBar.style.width = "0%";
        result.innerHTML = "";

        let breachMsg = document.getElementById("breach");
        if (breachMsg) {
            breachMsg.remove();
        }
    }
}


// ---------------- PASSWORD SHOW / HIDE ----------------

function togglePasswordVisibility() {

    const password = document.getElementById("password");
    const eyeIcon = document.getElementById("eyeIcon");
    const toggleButton = document.getElementById("togglePassword");

    if (password.type === "password") {

        // Show Password
        password.type = "text";

        eyeIcon.innerHTML = `
            <path d="M3 3l18 18"/>
            <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8"/>
            <path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c6.4 0 10 7 10 7a15 15 0 0 1-3 3.9"/>
            <path d="M6.6 6.6C3.7 8.4 2 12 2 12s3.6 7 10 7c1 0 2-.2 2.9-.5"/>
        `;

        toggleButton.setAttribute("aria-label", "Hide password");
        toggleButton.setAttribute("title", "Hide password");

    } 
    else {

        // Hide Password
        password.type = "password";

        eyeIcon.innerHTML = `
            <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z"/>
            <circle cx="12" cy="12" r="3"/>
        `;

        toggleButton.setAttribute("aria-label", "Show password");
        toggleButton.setAttribute("title", "Show password");
    }
}


// ---------------- BREACH CHECK ----------------

async function checkBreach(password) {

    try {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);

        const hashBuffer = await crypto.subtle.digest("SHA-1", data);

        const hashArray = Array.from(new Uint8Array(hashBuffer));

        const hash = hashArray
            .map(b => b.toString(16).padStart(2, '0'))
            .join('')
            .toUpperCase();

        const prefix = hash.substring(0, 5);
        const suffix = hash.substring(5);

        const response = await fetch(
            `https://api.pwnedpasswords.com/range/${prefix}`
        );

        if (!response.ok) {
            throw new Error("Breach API request failed");
        }

        const text = await response.text();

        let breachCount = 0;

        text.split("\n").forEach(line => {

            const [hashSuffix, count] = line.trim().split(":");

            if (hashSuffix === suffix) {
                breachCount = Number(count);
            }

        });

        // Create Breach Message
        let breachMsg = document.getElementById("breach");

        if (!breachMsg) {
            breachMsg = document.createElement("p");
            breachMsg.id = "breach";
            document.querySelector(".container").appendChild(breachMsg);
        }

        if (breachCount > 0) {

            breachMsg.style.color = "red";

            breachMsg.innerHTML =
                `⚠️ This password was found in <b>${breachCount}</b> data breaches`;

        } 
        else {

            breachMsg.style.color = "lightgreen";

            breachMsg.innerHTML =
                "✅ This password was not found in any known data breach";

        }

    } 
    catch (error) {

        console.error("Breach Check Error:", error);

    }
}

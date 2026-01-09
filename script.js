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
    } else if (strength <= 4) {
        strengthBar.style.width = "60%";
        strengthBar.style.background = "orange";
        result.innerHTML = "Medium Password";
    } else {
        strengthBar.style.width = "100%";
        strengthBar.style.background = "green";
        result.innerHTML = "Strong Password";
    }

    if (password.length > 0) {
        checkBreach(password);
    }
}

// ---------------- BREACH CHECK ----------------

async function checkBreach(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-1", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();

    const prefix = hash.substring(0, 5);
    const suffix = hash.substring(5);

    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
    const text = await response.text();

    let breachCount = 0;

    text.split("\n").forEach(line => {
        const [hashSuffix, count] = line.split(":");
        if (hashSuffix === suffix) {
            breachCount = count;
        }
    });

    let breachMsg = document.getElementById("breach");
    if (!breachMsg) {
        breachMsg = document.createElement("p");
        breachMsg.id = "breach";
        document.querySelector(".container").appendChild(breachMsg);
    }

    if (breachCount > 0) {
        breachMsg.style.color = "red";
        breachMsg.innerHTML = `⚠️ This password was found in <b>${breachCount}</b> data breaches`;
    } else {
        breachMsg.style.color = "lightgreen";
        breachMsg.innerHTML = "✅ This password was not found in any known data breach";
    }
}

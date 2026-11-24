
const passwordInput = document.getElementById("password");
const strengthBar = document.getElementById("strengthBar");
const strengthText = document.getElementById("strengthText");
const scoreText = document.getElementById("scoreText");
const timeText = document.getElementById("timeText");
const suggestionText = document.getElementById("suggestionText");

const requirements = {
    length: document.getElementById("req-length"),
    upper: document.getElementById("req-upper"),
    lower: document.getElementById("req-lower"),
    number: document.getElementById("req-number"),
    special: document.getElementById("req-special"),
    unique: document.getElementById("req-unique")
};

const commonPasswords = [
    "password", "password123", "12345678",
    "qwerty123", "admin123", "welcome123",
    "iloveyou", "abc12345", "letmein"
];

// Check repeated characters and simple sequences
function hasRepeatedPatterns(value) {
    if (/(.)\1{2,}/.test(value)) {
        return true;
    }

    for (let i = 0; i <= value.length - 4; i++) {
        let ascending = true;
        let descending = true;

        for (let j = 1; j < 4; j++) {
            let difference =
                value.charCodeAt(i + j) -
                value.charCodeAt(i + j - 1);

            if (difference !== 1) ascending = false;
            if (difference !== -1) descending = false;
        }

        if (ascending || descending) return true;
    }

    return false;
}

// Update individual requirement
function updateRequirement(name, valid) {
    const element = requirements[name];

    element.classList.toggle("valid", valid);

    element.querySelector(".check").textContent =
        valid ? "✓" : "·";
}

// Main password analysis
function analyzePassword() {
    const value = passwordInput.value;

    if (!value) {
        resetAnalyzer();
        return;
    }

    const checks = {
        length: value.length >= 8,
        upper: /[A-Z]/.test(value),
        lower: /[a-z]/.test(value),
        number: /[0-9]/.test(value),
        special: /[^A-Za-z0-9]/.test(value),
        unique: !hasRepeatedPatterns(value)
    };

    Object.keys(checks).forEach(key => {
        updateRequirement(key, checks[key]);
    });

    const completed = Object.values(checks)
        .filter(Boolean).length;

    document.getElementById("requirementCount")
        .textContent = `${completed} / 6 completed`;

    // Calculate password score
    let score = completed * 10;

    if (value.length >= 12) score += 10;
    if (value.length >= 16) score += 10;

    const characterPool =
        (/[a-z]/.test(value) ? 26 : 0) +
        (/[A-Z]/.test(value) ? 26 : 0) +
        (/[0-9]/.test(value) ? 10 : 0) +
        (/[^A-Za-z0-9]/.test(value) ? 32 : 0);

    if (characterPool >= 62) score += 10;
    if (characterPool >= 90) score += 10;

    const isCommon = commonPasswords.includes(
        value.toLowerCase()
    );

    if (isCommon) score = Math.min(score, 20);

    score = Math.min(score, 100);

    // Determine strength level
    let level;
    let color;

    if (isCommon || score < 40) {
        level = "Weak";
        color = "#ff5b6e";
    } else if (score < 70) {
        level = "Moderate";
        color = "#ffb84d";
    } else if (score < 90) {
        level = "Strong";
        color = "#42cda0";
    } else {
        level = "Very Strong";
        color = "#39d9a2";
    }

    strengthText.textContent = level;
    strengthText.style.color = color;

    strengthBar.style.width = score + "%";
    strengthBar.style.background = color;

    scoreText.textContent = score + " / 100";

    timeText.textContent =
        "Heuristic score, not a crack-time prediction";

    // Personalized suggestions
    let suggestions = [];

    if (isCommon) {
        suggestions.push("Avoid commonly used passwords.");
    }

    if (value.length < 8) {
        suggestions.push("Use at least 8 characters.");
    }

    if (value.length < 16) {
        suggestions.push("Try using 16 or more characters.");
    }

    if (!checks.upper) {
        suggestions.push("Add uppercase letters.");
    }

    if (!checks.lower) {
        suggestions.push("Add lowercase letters.");
    }

    if (!checks.number) {
        suggestions.push("Include numbers.");
    }

    if (!checks.special) {
        suggestions.push("Include special characters.");
    }

    if (!checks.unique) {
        suggestions.push("Avoid repeated or sequential patterns.");
    }

    if (suggestions.length === 0) {
        suggestions.push(
            "Great! Your password meets all these checks. Use it only for one account."
        );
    }

    suggestionText.textContent = suggestions.join(" ");
}

// Reset analyzer
function resetAnalyzer() {
    Object.keys(requirements).forEach(key => {
        updateRequirement(key, false);
    });

    document.getElementById("requirementCount")
        .textContent = "0 / 6 completed";

    strengthText.textContent = "Not tested";
    strengthText.style.color = "#929db3";

    strengthBar.style.width = "0%";
    strengthBar.style.background = "transparent";

    scoreText.textContent = "0 / 100";
    timeText.textContent = "Enter a password to begin";

    suggestionText.textContent =
        "Use a long, unique password with a mix of characters.";
}

// Live analysis
passwordInput.addEventListener("input", analyzePassword);

// Show and hide password
document.getElementById("toggleBtn")
    .addEventListener("click", function () {

        const isHidden = passwordInput.type === "password";

        passwordInput.type = isHidden ? "text" : "password";

        this.textContent = isHidden ? "⊘" : "◉";

        this.setAttribute(
            "aria-label",
            isHidden ? "Hide password" : "Show password"
        );
    });

// Generate secure random password
function secureRandomIndex(max) {
    const limit = Math.floor(4294967296 / max) * max;
    const array = new Uint32Array(1);

    do {
        crypto.getRandomValues(array);
    } while (array[0] >= limit);

    return array[0] % max;
}

// Securely shuffle an array
function secureShuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = secureRandomIndex(i + 1);

        [array[i], array[j]] = [array[j], array[i]];
    }

    return array;
}

// Generate password with all character types
function generatePassword() {

    if (!window.crypto || !crypto.getRandomValues) {
        alert("Secure password generation is not supported.");
        return;
    }

    const length = Number(
        document.getElementById("passwordLength").value
    );

    const groups = [
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        "abcdefghijklmnopqrstuvwxyz",
        "0123456789",
        "!@#$%^&*()_+-="
    ];

    const allCharacters = groups.join("");

    let result = groups.map(group =>
        group[secureRandomIndex(group.length)]
    );

    while (result.length < length) {
        result.push(
            allCharacters[secureRandomIndex(allCharacters.length)]
        );
    }

    result = secureShuffle(result);

    const generated = result.join("");

    document.getElementById("generatedPassword").value =
        generated;

    document.getElementById("copyMessage").textContent =
        "Strong random password generated.";

    // Analyze generated password too
    passwordInput.value = generated;
    analyzePassword();
}

// Generate button
document.getElementById("generateBtn")
    .addEventListener("click", generatePassword);

// Copy generated password
document.getElementById("copyBtn")
    .addEventListener("click", async function () {

        const generated = document.getElementById(
            "generatedPassword"
        ).value;

        const message = document.getElementById("copyMessage");

        if (!generated) {
            message.textContent = "Generate a password first.";
            return;
        }

        try {
            await navigator.clipboard.writeText(generated);
            message.textContent = "Password copied successfully!";
        } catch (error) {
            message.textContent =
                "Copy unavailable. Please select and copy manually.";
        }
    });

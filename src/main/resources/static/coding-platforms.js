const API_URL = "/api/coding-platforms";

let platforms = [];

document.addEventListener("DOMContentLoaded", () => {
    loadPlatforms();

    const searchInput = document.getElementById("platformSearch");

    if (searchInput) {
        searchInput.addEventListener("input", filterPlatforms);
    }
});


/* =========================================================
   LOAD PLATFORMS
   ========================================================= */

async function loadPlatforms() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Failed to load coding platforms");
        }

        platforms = await response.json();

        renderPlatforms(platforms);
        updateStats(platforms);
        updatePlatformOptions();

    } catch (error) {
        console.error("Error loading coding platforms:", error);

        const grid = document.getElementById("platformGrid");

        if (grid) {
            grid.innerHTML = `
                <div class="empty-platforms">
                    <div>⚠</div>
                    <h3>Unable to load platforms</h3>
                    <p>
                        Please check your backend connection
                        and try again.
                    </p>
                </div>
            `;
        }
    }
}


/* =========================================================
   RENDER PLATFORM CARDS
   ========================================================= */

function renderPlatforms(platformList) {
    const grid = document.getElementById("platformGrid");

    if (!grid) {
        return;
    }

    if (!platformList || platformList.length === 0) {
        grid.innerHTML = `
            <div class="empty-platforms">
                <div>◈</div>

                <h3>No coding platforms found</h3>

                <p>
                    Add your LeetCode, Codeforces,
                    CodeChef or other coding profiles.
                </p>

                <button
                    class="primary-button"
                    onclick="showAddPlatformForm()">
                    + Add Your First Platform
                </button>
            </div>
        `;

        return;
    }

    grid.innerHTML = platformList.map(platform => `
        <article class="platform-card">

            <div class="platform-card-header">

                <div class="platform-logo">
                    ${getPlatformIcon(platform.name)}
                </div>

                <span class="platform-status">
                    ● Connected
                </span>

            </div>

            <div class="platform-card-body">

                <h3>
                    ${escapeHtml(platform.name)}
                </h3>

                <p class="platform-username">
                    @${escapeHtml(
                        platform.username || "Not connected"
                    )}
                </p>

            </div>

            <div class="platform-card-actions">

                <a
                    href="${escapeAttribute(platform.url)}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="platform-button">
                    Open Profile ↗
                </a>

            </div>

        </article>
    `).join("");
}


/* =========================================================
   UPDATE STATISTICS
   ========================================================= */

function updateStats(platformList) {
    const count = platformList.length;

    const platformCount =
        document.getElementById("platformCount");

    const profileCount =
        document.getElementById("profileCount");

    if (platformCount) {
        platformCount.textContent = count;
    }

    if (profileCount) {
        profileCount.textContent =
            platformList.filter(
                platform =>
                    platform.username &&
                    platform.username.trim() !== ""
            ).length;
    }
}


/* =========================================================
   UPDATE ADD PLATFORM DROPDOWN
   ========================================================= */

function updatePlatformOptions() {
    const select =
        document.getElementById("platformName");

    if (!select) {
        return;
    }

    /*
     * Create a Set containing all platforms
     * that already exist in the database.
     *
     * Example:
     *
     * ["leetcode", "codeforces"]
     */

    const existingPlatforms = new Set(
        platforms.map(platform =>
            (platform.name || "")
                .trim()
                .toLowerCase()
        )
    );


    /*
     * Check every option in the dropdown.
     */

    Array.from(select.options).forEach(option => {

        /*
         * Keep the placeholder visible.
         */

        if (!option.value) {
            return;
        }


        const platformName =
            option.value
                .trim()
                .toLowerCase();


        /*
         * If the platform already exists,
         * hide and disable it.
         */

        const alreadyExists =
            existingPlatforms.has(platformName);

        option.hidden = alreadyExists;
        option.disabled = alreadyExists;

    });


    /*
     * If the currently selected platform
     * already exists, reset the dropdown.
     */

    if (
        select.value &&
        existingPlatforms.has(
            select.value.trim().toLowerCase()
        )
    ) {
        select.value = "";
    }
}


/* =========================================================
   SEARCH / FILTER
   ========================================================= */

function filterPlatforms(event) {

    const searchTerm =
        event.target.value
            .toLowerCase()
            .trim();


    const filtered =
        platforms.filter(platform => {

            const name =
                (platform.name || "")
                    .toLowerCase();

            const username =
                (platform.username || "")
                    .toLowerCase();


            return (
                name.includes(searchTerm) ||
                username.includes(searchTerm)
            );
        });


    renderPlatforms(filtered);
}


/* =========================================================
   SHOW ADD PLATFORM FORM
   ========================================================= */

function showAddPlatformForm() {

    const form =
        document.getElementById("platformForm");

    if (form) {

        form.style.display = "block";

        form.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

        /*
         * Refresh dropdown every time the form opens.
         * This ensures newly added platforms
         * cannot be selected again.
         */

        updatePlatformOptions();
    }
}


/* =========================================================
   HIDE ADD PLATFORM FORM
   ========================================================= */

function hideAddPlatformForm() {

    const form =
        document.getElementById("platformForm");

    if (form) {
        form.style.display = "none";
    }
}


/* =========================================================
   ADD PLATFORM
   ========================================================= */

async function addPlatform() {

    const name =
        document.getElementById("platformName").value;

    const username =
        document
            .getElementById("platformUsername")
            .value
            .trim();

    const url =
        document
            .getElementById("platformUrl")
            .value
            .trim();


    /* -------------------------
       VALIDATION
       ------------------------- */

    if (!name || !username || !url) {

        alert("Please fill in all fields.");

        return;
    }


    /*
     * Extra frontend protection:
     * prevent adding a platform that
     * already exists.
     */

    const alreadyExists =
        platforms.some(
            platform =>
                (platform.name || "")
                    .trim()
                    .toLowerCase() ===
                name.trim().toLowerCase()
        );


    if (alreadyExists) {

        alert(
            `${name} has already been added.`
        );

        updatePlatformOptions();

        return;
    }


    /* -------------------------
       SEND POST REQUEST
       ------------------------- */

    try {

        const response =
            await fetch(API_URL, {

                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    name: name,
                    username: username,
                    url: url
                })
            });


        if (!response.ok) {

            throw new Error(
                `Server returned ${response.status}`
            );
        }


        await response.json();


        alert(
            `${name} added successfully.`
        );


        /* -------------------------
           CLEAR FORM
           ------------------------- */

        document.getElementById(
            "platformName"
        ).value = "";

        document.getElementById(
            "platformUsername"
        ).value = "";

        document.getElementById(
            "platformUrl"
        ).value = "";


        hideAddPlatformForm();


        /*
         * Reload from backend.
         *
         * This also updates the dropdown,
         * so the newly added platform
         * disappears from the options.
         */

        await loadPlatforms();


    } catch (error) {

        console.error(
            "Error adding platform:",
            error
        );

        alert(
            "Unable to add the coding platform. " +
            "Please check the backend."
        );
    }
}


/* =========================================================
   PLATFORM ICONS
   ========================================================= */

function getPlatformIcon(name) {

    const icons = {

        "LeetCode": "LC",

        "Codeforces": "CF",

        "CodeChef": "CC",

        "HackerRank": "HR",

        "CSES": "CS",

        "SPOJ": "SP"
    };


    return icons[name] || "CP";
}


/* =========================================================
   HTML SECURITY
   ========================================================= */

function escapeHtml(value) {

    return String(value)

        .replaceAll("&", "&amp;")

        .replaceAll("<", "&lt;")

        .replaceAll(">", "&gt;")

        .replaceAll('"', "&quot;")

        .replaceAll("'", "&#039;");
}


function escapeAttribute(value) {

    return escapeHtml(value);
}
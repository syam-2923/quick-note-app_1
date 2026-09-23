// =====================================
// PAGE LOAD
// =====================================

window.onload = function () {

    console.log("🌐 Page loaded");

    loadNotes();
};


// =====================================
// SAVE NOTE
// =====================================

async function saveNote() {

    const noteInput = document.getElementById("noteInput");
    const message = document.getElementById("message");

    const content = noteInput.value.trim();

    console.log("✏️ Save button clicked");

    if (content === "") {

        console.log("⚠️ Note is empty");

        message.innerText = "Please write a note.";

        return;
    }

    console.log("📤 Sending note to server...");

    try {

        const response = await fetch("/api/notes", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                content: content
            })

        });

        const data = await response.json();

        if (response.ok) {

            console.log("✅ Note saved:", data);

            message.innerText = "✅ Note saved successfully!";

            noteInput.value = "";

            loadNotes();

        } else {

            console.log("❌ Server error:", data.error);

            message.innerText = data.error;
        }

    } catch (error) {

        console.log("❌ Connection error:", error);

        message.innerText = "Server connection failed.";
    }
}


// =====================================
// LOAD NOTES
// =====================================

async function loadNotes() {

    console.log("📥 Loading notes...");

    try {

        const response = await fetch("/api/notes");

        const notes = await response.json();

        console.log(`✅ ${notes.length} notes received`);

        const notesList = document.getElementById("notesList");

        notesList.innerHTML = "";

        if (notes.length === 0) {

            notesList.innerHTML = "<p>No notes yet.</p>";

            return;
        }

        notes.forEach(function (note) {

            const div = document.createElement("div");

            div.className = "note";

            if (note.favourite === 1) {

                div.classList.add("favourite");

            }

            div.innerHTML = `

                <div class="note-text">
                    ${escapeHTML(note.content)}
                </div>

                <small>
                    ${note.created_at}
                </small>

                <div class="note-buttons">

                    <button
                        class="favourite-btn"
                        onclick="toggleFavourite(${note.id})">

                        ${note.favourite === 1
                            ? "⭐ Favourite"
                            : "☆ Favourite"}

                    </button>

                    <button
                        class="delete-btn"
                        onclick="deleteNote(${note.id})">

                        🗑️ Delete

                    </button>

                </div>

            `;

            notesList.appendChild(div);

        });

    } catch (error) {

        console.log("❌ Failed to load notes:", error);

    }
}


// =====================================
// DELETE NOTE
// =====================================

async function deleteNote(id) {

    console.log(`🗑️ Delete button clicked for note ${id}`);

    const confirmDelete = confirm(
        "Are you sure you want to delete this note?"
    );

    if (!confirmDelete) {

        console.log("❌ Delete cancelled");

        return;
    }

    try {

        const response = await fetch(
            `/api/notes/${id}`,
            {
                method: "DELETE"
            }
        );

        const data = await response.json();

        if (response.ok) {

            console.log(`✅ Note ${id} deleted`);

            document.getElementById("message").innerText =
                "🗑️ Note deleted successfully!";

            loadNotes();

        } else {

            console.log("❌ Delete error:", data.error);

        }

    } catch (error) {

        console.log("❌ Delete connection error:", error);

    }
}


// =====================================
// FAVOURITE / UNFAVOURITE
// =====================================

async function toggleFavourite(id) {

    console.log(`⭐ Favourite button clicked for note ${id}`);

    try {

        const response = await fetch(
            `/api/notes/${id}/favourite`,
            {
                method: "PUT"
            }
        );

        const data = await response.json();

        if (response.ok) {

            if (data.favourite === 1) {

                console.log(`⭐ Note ${id} added to favourites`);

            } else {

                console.log(`☆ Note ${id} removed from favourites`);

            }

            loadNotes();

        } else {

            console.log("❌ Favourite error:", data.error);

        }

    } catch (error) {

        console.log(
            "❌ Favourite connection error:",
            error
        );

    }
}


// =====================================
// SECURITY
// =====================================

function escapeHTML(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}
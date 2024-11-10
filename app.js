// Validate form fields before submission
document.getElementById('ticketForm').onsubmit = function(event) {
    const title = document.getElementById('title').value.trim();
    const description = document.getElementById('description').value.trim();
    const urgency = document.getElementById('urgency').value;
    const category = document.getElementById('category').value;

    if (!title || !description || !urgency || !category) {
        alert("All fields are required.");
        event.preventDefault();
        return false; // Prevent form submission
    }

    alert("Ticket submitted successfully!");
};

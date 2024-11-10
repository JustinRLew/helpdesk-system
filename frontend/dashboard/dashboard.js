document.addEventListener('DOMContentLoaded', () => {
    fetchTickets();

    // Filter event listeners
    document.getElementById('filterStatus').addEventListener('change', fetchTickets);
    document.getElementById('filterUrgency').addEventListener('change', fetchTickets);
});

function fetchTickets() {
    const filterStatus = document.getElementById('filterStatus').value;
    const filterUrgency = document.getElementById('filterUrgency').value;

    // Retrieve token from localStorage and attach to fetch requests
    const token = localStorage.getItem('token');

    fetch('/tickets', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (response.status === 401 || response.status === 403) {
            alert("Unauthorized access. Please log in.");
            window.location.href = "/login.html"; // Redirect to login page
            return;
        }
        return response.json();
    })
    .then(data => {
        let tickets = data.tickets;

        // Filter tickets based on dropdown selections
        if (filterStatus !== 'all') {
            tickets = tickets.filter(ticket => ticket.status === filterStatus);
        }
        if (filterUrgency !== 'all') {
            tickets = tickets.filter(ticket => ticket.urgency === filterUrgency);
        }

        displayTickets(tickets);
    })
    .catch(error => console.error("Error fetching tickets:", error));
}

function displayTickets(tickets) {
    const tableBody = document.getElementById('ticketsTable').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';

    tickets.forEach(ticket => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${ticket.id}</td>
            <td>${ticket.title}</td>
            <td>${ticket.description}</td>
            <td>${ticket.urgency}</td>
            <td>${ticket.status}</td>
            <td>
                <button onclick="updateTicketStatus(${ticket.id}, 'In Progress')">In Progress</button>
                <button onclick="updateTicketStatus(${ticket.id}, 'Resolved')">Resolve</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function updateTicketStatus(ticketId, newStatus) {
    // Retrieve token from localStorage
    const token = localStorage.getItem('token');

    fetch(`/tickets/${ticketId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
    })
    .then(response => {
        if (response.status === 401 || response.status === 403) {
            alert("Unauthorized access. Please log in.");
            window.location.href = "/login.html"; // Redirect to login page
            return;
        }
        return response.json();
    })
    .then(() => fetchTickets()) // Refresh tickets after update
    .catch(error => console.error("Error updating ticket status:", error));
}

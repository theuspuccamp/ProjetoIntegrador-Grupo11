// Função para buscar eventos com o status "Aprovado"
async function getEvents() {
    const eventStatus = "Aprovado";

    try {
        const response = await fetch("http://localhost:3001/getEvents", {
            method: "GET",
            headers: {
                "status_event": eventStatus,
            },
        });

        if (!response.ok) {
            throw new Error("Erro ao carregar eventos.");
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Erro na busca dos eventos:", error);
        return [];
    }
}

async function renderEvents() {
    const container = document.getElementById("events-container");
    container.innerHTML = ""; 

    const events = await getEvents(); // Busca os eventos aprovados

    if (events.length === 0) {
        container.innerHTML = "<p class='text-center'>Nenhum evento aprovado disponível.</p>";
        return;
    }

    events.forEach((event) => {
        const eventCard = document.createElement("div");
        eventCard.className = "col-md-4 mb-4";

        eventCard.innerHTML = `
            <div class="card p-3 shadow-sm">
            <h3>${event.EVENT_TITLE}</h3>
            <p><strong>Descrição:</strong> ${event.EVENT_DESCRIPTION}</p>
            <p><strong>Data de Início:</strong> ${event.EVENTSTARTDATE}</p>
            <p><strong>Data de Fim:</strong> ${event.EVENTFINALDATE}</p>
            <button class="btn-warning bet-btn" data-id="${event.EVENT_ID}" data-title="${event.EVENT_TITLE}">
                Apostar
            </button>
            <p style="font-size: 10px;"> Código do evento: ${event.EVENT_ID}</p>
            </div>
        `;
        container.appendChild(eventCard);
        });

        // Adiciona os eventos de clique para abrir o modal de aposta
        document.querySelectorAll(".bet-btn").forEach((button) => {
        button.addEventListener("click", (e) => {
            const eventId = e.target.getAttribute("data-id");
            const eventTitle = e.target.getAttribute("data-title");

            document.getElementById("eventName").value = eventTitle;
            document.getElementById("betForm").dataset.eventId = eventId;

            const modal = new bootstrap.Modal(document.getElementById("betModal"));
            modal.show();
        });
        });
}

// Função para lidar com a submissão da aposta
async function handleBetSubmission(event) {
    event.preventDefault();

    const betForm = document.getElementById("betForm");
    const eventId = betForm.dataset.eventId;
    const betOption = document.querySelector("input[name='betOption']:checked")?.value;
    const betAmount = document.getElementById("betAmount").value;

    if (!betOption) {
        alert("Por favor, selecione uma opção de aposta.");
        return;
    }

    if (!betAmount || betAmount <= 0) {
        alert("Por favor, insira um valor válido para a aposta.");
        return;
    }

    const h = new Headers();
    h.append("Content-Type", "application/json");
    h.append("Authorization", `Bearer ${localStorage.getItem("authToken")}`);  
    h.append("event_id", eventId);
    h.append("bet_option", betOption);
    h.append("bet_value", betAmount);


    try {
        const response = await fetch("http://localhost:3001/betOnEvent", {
            method: "PUT",
            headers: h,
        });

        if (!response.ok) {
            throw new Error("Erro ao enviar a aposta.");
        }

        alert("Aposta realizada com sucesso!");

        // Fecha o modal
        const modal = bootstrap.Modal.getInstance(document.getElementById("betModal"));
        modal.hide();
    } catch (error) {
        console.error("Erro ao enviar a aposta:", error);
        alert("Erro ao realizar a aposta. Tente novamente.");
    }
}

// Adiciona o evento de submissão ao formulário de aposta
document.addEventListener("DOMContentLoaded", () => {
    renderEvents();

    const betForm = document.getElementById("betForm");
    betForm.addEventListener("submit", handleBetSubmission);
});

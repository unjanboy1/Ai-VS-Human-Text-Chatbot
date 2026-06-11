function sendMessage() {
    let input = document.getElementById("user-input");
    let message = input.value.trim();
    let btn = document.getElementById("analyze-btn");
    let loader = document.getElementById("loader");
    let btnText = btn.querySelector('.btn-text');
    let chatBox = document.getElementById("chat-box");

    if (message === "" || message.split(' ').length < 20) {
        alert("Please enter at least 20 words for a precision scan.");
        return;
    }

    // UI Feedback
    btnText.style.display = "none";
    loader.style.display = "block";
    btn.disabled = true;

    fetch("/get_response", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ message: message })
    })
    .then(res => res.json())
    .then(data => {
        btnText.style.display = "block";
        loader.style.display = "none";
        btn.disabled = false;

        if (data.error) {
            alert(data.error);
            return;
        }

        // --- THE FIX: Clear previous results before adding new one ---
        chatBox.innerHTML = "";

        // Create Result Card
        let resultCard = document.createElement("div");
        resultCard.className = "message bot";

        // Dynamic color based on result
        let resultColor = data.is_ai ? "#ff0000" : "#00ff88";

        resultCard.innerHTML = `
            <div style="font-size:12px; opacity:0.5; margin-bottom:10px;">ANALYSIS COMPLETE</div>
            <div>VERDICT: <span style="color:${resultColor}">${data.response.toUpperCase()}</span></div>
            <div class="confidence-bar" style="color:${resultColor}">
                AI: ${data.ai}% | HUMAN: ${data.human}%
            </div>
        `;

        chatBox.appendChild(resultCard);

        // Optional: play sound
        new Audio("https://www.soundjay.com/button/sounds/button-3.mp3").play();
    })
    .catch(err => {
        console.error(err);
        btnText.style.display = "block";
        loader.style.display = "none";
        btn.disabled = false;
    });
}
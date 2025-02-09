// script.js

document.querySelector(".message-input").addEventListener("keydown", function(event) {
    if (event.key === "Enter" && this.value.trim() !== "") {
        const message = document.createElement("div");
        message.classList.add("message", "sent");
        message.textContent = this.value;
        
        document.querySelector(".chat-messages").appendChild(message);
        this.value = ""; // Clear the input
        document.querySelector(".chat-messages").scrollTop = document.querySelector(".chat-messages").scrollHeight;
    }
});

<script lang="ts">
  import { onMount } from "svelte";

  type Message = {
    sender: "user" | "ai";
    text: string;
  };

  let messages: Message[] = [];
  let input = "";
  let loading = false;
  let sessionId: string | null = null;
  let chatEnd: HTMLDivElement;

  onMount(() => {
    sessionId = localStorage.getItem("sessionId");
  });

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    messages = [...messages, { sender: "user", text: userMsg }];
    input = "";
    loading = true;

    try {
        const payload: any = { message: userMsg };
        if (sessionId) payload.sessionId = sessionId;

      const res = await fetch("https://ai-chat-groq.onrender.com/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Request failed");
      }

      messages = [...messages, { sender: "ai", text: data.reply }];
      sessionId = data.sessionId;
      localStorage.setItem("sessionId", sessionId!);
    } catch (err: any) {
      messages = [
        ...messages,
        { sender: "ai", text: "Sorry, something went wrong. Please try again." },
      ];
    } finally {
      loading = false;
      scrollToBottom();
    }
  }

  function scrollToBottom() {
    setTimeout(() => {
      chatEnd?.scrollIntoView({ behavior: "smooth" });
    }, 0);
  }
</script>

<style>
  .chat-container {
    max-width: 600px;
    margin: 40px auto;
    border: 1px solid #ddd;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    height: 80vh;
  }

  .messages {
    flex: 1;
    padding: 16px;
    overflow-y: auto;
    background: #fafafa;
  }

  .msg {
    margin-bottom: 12px;
    max-width: 80%;
    padding: 10px 12px;
    border-radius: 8px;
    line-height: 1.4;
    font-size: 14px;
  }

  .user {
    background: #2563eb;
    color: white;
    align-self: flex-end;
  }

  .ai {
    background: #e5e7eb;
    color: #111;
    align-self: flex-start;
  }

  .input-area {
    display: flex;
    border-top: 1px solid #ddd;
  }

  input {
    flex: 1;
    padding: 12px;
    border: none;
    outline: none;
    font-size: 14px;
  }

  button {
    padding: 0 16px;
    border: none;
    background: #2563eb;
    color: white;
    cursor: pointer;
  }

  button:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }
</style>

<div class="chat-container">
  <div class="messages">
    {#each messages as m}
      <div class="msg {m.sender}">
        {m.text}
      </div>
    {/each}
    {#if loading}
      <div class="msg ai">Agent is typing…</div>
    {/if}
    <div bind:this={chatEnd}></div>
  </div>

  <div class="input-area">
    <input
      bind:value={input}
      placeholder="Type your message…"
      on:keydown={(e) => e.key === "Enter" && sendMessage()}
      disabled={loading}
    />
    <button on:click={sendMessage} disabled={loading}>
      Send
    </button>
  </div>
</div>

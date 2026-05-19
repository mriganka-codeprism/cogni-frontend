export async function getConversationId(
  userId: string,
  conversationId?: string,
  jobId?: string,
  inviteToken?: string,
) {
  const response = await fetch(
    `${process.env.REACT_APP_API_URL}/communication/conversations`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify({
        userId,
        conversationId,
        jobId,
        inviteToken,
      }),
    }
  );
  if (!response.ok) {
    throw new Error("Failed to get conversation ID");
  }
  const data = await response.json();
  return data;
}

export async function getLivekitToken(
  userId: string,
  roomId: string,
  conversationId: string
) {
  const response = await fetch(
    `${process.env.REACT_APP_API_URL}/livekit/token?userId=${userId}&roomId=${roomId}&conversationId=${conversationId}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    }
  );
  if (!response.ok) {
    throw new Error("Failed to fetch LiveKit token");
  }
  const data = await response.json();
  return data;
}

export async function addLivekitBot(roomId: string, conversationId: string) {
  const response = await fetch(
    `${process.env.REACT_APP_API_URL}/livekit/bot-join`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ room: roomId, conversationId: conversationId }),
    }
  );
  if (!response.ok) {
    throw new Error("Failed to add LiveKit bot");
  }
  const data = await response.json();
  return data;
}

export async function endInterview(conversationId: string, comment: string) {
  const response = await fetch(
    `${process.env.REACT_APP_API_URL}/users/endInterview`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify({
        id: conversationId,
        conversationStatus: "closed",
        comment,
      }),
    }
  );
  if (!response.ok) {
    throw new Error("Failed to end interview");
  }
  const data = await response.json();
  return data;
}

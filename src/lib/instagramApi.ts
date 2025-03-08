interface ButtonParam {
  title: string;
  url: string;
}

interface MessageBody {
  text?: string;
  attachment?: {
    type: "template";
    payload: {
      template_type: "button";
      text: string;
      buttons: Array<{
        type: "web_url";
        url: string;
        title: string;
      }>;
    };
  };
}

export async function sendInstagramReply(
  commentId: string,
  message: string,
  accessToken: string,
  buttons?: ButtonParam[]
) {
  try {
    const messageBody = createMessageBody(message, buttons);
    const url = `https://graph.facebook.com/v20.0/${commentId}/replies`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: messageBody,
        access_token: accessToken,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Instagram API error: ${JSON.stringify(error)}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

function createMessageBody(message: string, buttons?: ButtonParam[]): MessageBody {
  if (buttons && buttons.length > 0) {
    return {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: message,
          buttons: buttons.map(button => ({
            type: "web_url",
            url: button.url,
            title: button.title,
          }))
        }
      }
    };
  }
  return { text: message };
} 
import { ChatMessage } from "./ChatMessage";
import { useEffect, useRef } from "react";

export type ChatMessageType = {
  name: string;
  message: string;
  isSelf: boolean;
  timestamp: number;
};

type ChatTileProps = {
  messages: ChatMessageType[];
};

export const ChatTile = ({ messages }: ChatTileProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [containerRef, messages]);

  return (
      <div
        ref={containerRef}
        style={{
          flex: 1,
          paddingTop: "20px",
          paddingBottom: "20px",
          overflowY: "scroll",
          scrollbarWidth: "none", 
          msOverflowStyle: "none", 
          borderRadius: "0.5rem",
          backgroundColor: "#F3F3F3E0",
        }}
      >
        <div style={{
            display: "flex",
            flexDirection: "column",
            minHeight: "100%",
        }}>
          {messages.map((message, index, allMsg) => {
            // const hideName =
            //   index >= 1 && allMsg[index - 1].name === message.name;

            return (
              <ChatMessage
                key={index}
                hideName={false}
                name={message.name}
                message={message.message}
                isSelf={message.isSelf}
              />
            );
          })}
        </div>
        <style>
        {`
          div::-webkit-scrollbar {
            display: none; 
          }
        `}
      </style>
      </div>
      
  );
};

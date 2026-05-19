type ChatMessageProps = {
  message: string;
  name: string;
  isSelf: boolean;
  hideName?: boolean;
};

export const ChatMessage = ({
  name,
  message,
  isSelf,
  hideName,
}: ChatMessageProps) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 1,
        margin: "10px",
      }}
    >
      {!hideName && (
        <div
          style={{
            color: isSelf ? "#86161B" : "#393939",
            fontSize: "10px",
            textTransform: "uppercase",
            marginLeft: isSelf ? "auto" : "0",
          }}
        >
          {name}
        </div>
      )}
      <div
        style={{
        marginLeft: isSelf ? "auto" : "0",
        width: "fit-content",
        maxWidth: "80%",
        backgroundColor: isSelf ? "#FEECED" : "#4A5767",
        borderRadius: "6px",
        borderTopLeftRadius: isSelf ? "6px" : "0",
        borderTopRightRadius: isSelf ? "0" : "6px",
        padding: "10px",
          color: isSelf ? "#86161B" : "#ffffff",
          fontSize: "14px",
          whiteSpace: "pre-line",
        }}
      >
        {message}
      </div>
    </div>
  );
};

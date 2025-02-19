export function ChatMessageBubble({ message, aiEmoji, sources }) {
  const colorClassName = message.role === "user" ? "bg-sky-600" : "bg-slate-50 text-black";
  const alignmentClassName = message.role === "user" ? "ml-auto" : "mr-auto";
  const prefix = message.role === "user" ? "🧑" : aiEmoji;
  
  return (
    <div className={`${alignmentClassName} ${colorClassName} rounded px-4 py-2 max-w-[80%] mb-8 flex`}>
      <div className="mr-2">{prefix}</div>
      <div className="whitespace-pre-wrap flex flex-col">
        <span>{message.content}</span>
      </div>
    </div>
  );
} 
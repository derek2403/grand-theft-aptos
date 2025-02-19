import { useState } from "react";

export function IntermediateStep({ message }) {
  const parsedInput = JSON.parse(message.content);
  const action = parsedInput.action;
  const observation = parsedInput.observation;
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="ml-auto bg-green-600 rounded px-4 py-2 max-w-[80%] mb-8 whitespace-pre-wrap flex flex-col cursor-pointer">
      <div 
        className={`text-right ${expanded ? "w-full" : ""}`} 
        onClick={() => setExpanded(!expanded)}
      >
        <code className="mr-2 bg-slate-600 px-2 py-1 rounded hover:text-blue-600">
          🛠 <b>{action.name}</b>
        </code>
        <span>{expanded ? "🔼" : "🔽"}</span>
      </div>
      {expanded && (
        <div className="mt-2">
          <div className="bg-slate-600 rounded p-4 mt-1">
            <code>
              Tool Input:
              <br />
              <br />
              {JSON.stringify(action.args, null, 2)}
            </code>
          </div>
          <div className="bg-slate-600 rounded p-4 mt-1">
            <code>{observation}</code>
          </div>
        </div>
      )}
    </div>
  );
} 
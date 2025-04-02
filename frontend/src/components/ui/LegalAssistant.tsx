
import React, { useState } from 'react';
import { sendToGemini } from '../../../lib/ai';
import { MessageSquare, X } from 'lucide-react';

export default function LegalAssistant() {
  const [visible, setVisible] = useState(false);
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResponse('');
    try {
      const reply = await sendToGemini("سؤال قانوني: " + input);
      setResponse(reply);
    } catch {
      setResponse("حدث خطأ أثناء الاتصال بالمساعد الذكي.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {visible ? (
        <div className="w-80 bg-white border rounded shadow-lg p-4 space-y-2">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold">المساعد القانوني</span>
            <button onClick={() => setVisible(false)}><X size={18} /></button>
          </div>
          <textarea
            className="w-full border rounded p-2 text-sm"
            rows={3}
            placeholder="اكتب سؤالك القانوني..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            className="bg-indigo-600 text-white w-full py-1 rounded text-sm"
            onClick={handleSend}
            disabled={loading}
          >
            {loading ? "جارٍ المعالجة..." : "إرسال"}
          </button>
          {response && (
            <div className="bg-gray-100 border rounded p-2 text-sm whitespace-pre-wrap max-h-48 overflow-y-auto">
              {response}
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={() => setVisible(true)}
          className="bg-indigo-600 text-white rounded-full p-3 shadow-lg hover:bg-indigo-700"
        >
          <MessageSquare size={20} />
        </button>
      )}
    </div>
  );
}

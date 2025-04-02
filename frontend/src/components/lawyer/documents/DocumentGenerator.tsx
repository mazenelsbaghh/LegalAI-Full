
import React, { useState } from 'react';
import { sendToGemini } from '../../../lib/ai';

const TEMPLATE_TYPES = {
  defense: 'مذكرة دفاع',
  lawsuit: 'صحيفة دعوى',
  objection: 'طلب اعتراض',
  notice: 'إنذار رسمي',
};

export default function DocumentGenerator() {
  const [formData, setFormData] = useState({
    type: 'defense',
    opponent: '',
    court: '',
    caseNumber: '',
    facts: '',
    requests: '',
    notes: '',
  });

  const [generatedDoc, setGeneratedDoc] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    const prompt = `
أنشئ ${TEMPLATE_TYPES[formData.type]} قانونية استنادًا إلى البيانات التالية:
- الخصم: ${formData.opponent}
- المحكمة: ${formData.court}
- رقم الدعوى: ${formData.caseNumber}
- الوقائع: ${formData.facts}
- الطلبات: ${formData.requests}
- ملاحظات إضافية: ${formData.notes}
صياغة رسمية قانونية باللغة العربية.`;

    try {
      const result = await sendToGemini(prompt);
      setGeneratedDoc(result);
    } catch (err) {
      setGeneratedDoc('حدث خطأ أثناء توليد المستند.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded shadow space-y-4">
      <h2 className="text-xl font-semibold mb-4">توليد مستند قانوني</h2>

      <select
        className="border rounded p-2 w-full"
        value={formData.type}
        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
      >
        {Object.entries(TEMPLATE_TYPES).map(([key, label]) => (
          <option key={key} value={key}>{label}</option>
        ))}
      </select>

      <input className="border rounded p-2 w-full" placeholder="اسم الخصم" value={formData.opponent} onChange={(e) => setFormData({ ...formData, opponent: e.target.value })} />
      <input className="border rounded p-2 w-full" placeholder="المحكمة" value={formData.court} onChange={(e) => setFormData({ ...formData, court: e.target.value })} />
      <input className="border rounded p-2 w-full" placeholder="رقم الدعوى" value={formData.caseNumber} onChange={(e) => setFormData({ ...formData, caseNumber: e.target.value })} />
      <textarea className="border rounded p-2 w-full" placeholder="الوقائع" rows={3} value={formData.facts} onChange={(e) => setFormData({ ...formData, facts: e.target.value })} />
      <textarea className="border rounded p-2 w-full" placeholder="الطلبات" rows={2} value={formData.requests} onChange={(e) => setFormData({ ...formData, requests: e.target.value })} />
      <textarea className="border rounded p-2 w-full" placeholder="ملاحظات إضافية" rows={2} value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />

      <button
        onClick={handleGenerate}
        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        disabled={loading}
      >
        {loading ? '...جار التوليد' : 'توليد المستند'}
      </button>

      {generatedDoc && (
        <div className="mt-6 p-4 border rounded bg-gray-50 whitespace-pre-wrap">
          <h3 className="font-bold mb-2">النص المُولد:</h3>
          {generatedDoc}
        </div>
      )}
    </div>
  );
}

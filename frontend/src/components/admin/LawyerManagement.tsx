
import React, { useState, useEffect } from 'react';
import { Plus, Trash, Edit } from 'lucide-react';

interface Lawyer {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export default function LawyerManagement() {
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [newLawyer, setNewLawyer] = useState<Partial<Lawyer>>({});

  useEffect(() => {
    const stored = localStorage.getItem('lawyers');
    if (stored) setLawyers(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem('lawyers', JSON.stringify(lawyers));
  }, [lawyers]);

  const addLawyer = () => {
    if (!newLawyer.name || !newLawyer.email) return;
    const newEntry = {
      id: Date.now().toString(),
      name: newLawyer.name,
      email: newLawyer.email,
      phone: newLawyer.phone || '',
    };
    setLawyers([...lawyers, newEntry]);
    setNewLawyer({});
  };

  const deleteLawyer = (id: string) => {
    setLawyers(lawyers.filter(l => l.id !== id));
  };

  return (
    <div className="p-6 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-4">إدارة المحامين</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <input
          type="text"
          placeholder="اسم المحامي"
          className="border p-2 rounded"
          value={newLawyer.name || ''}
          onChange={e => setNewLawyer({ ...newLawyer, name: e.target.value })}
        />
        <input
          type="email"
          placeholder="البريد الإلكتروني"
          className="border p-2 rounded"
          value={newLawyer.email || ''}
          onChange={e => setNewLawyer({ ...newLawyer, email: e.target.value })}
        />
        <input
          type="tel"
          placeholder="رقم الهاتف"
          className="border p-2 rounded"
          value={newLawyer.phone || ''}
          onChange={e => setNewLawyer({ ...newLawyer, phone: e.target.value })}
        />
      </div>
      <button
        onClick={addLawyer}
        className="mb-6 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 flex items-center gap-2"
      >
        <Plus size={16} /> إضافة محامي
      </button>

      <table className="w-full text-right border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">الاسم</th>
            <th className="p-2">البريد الإلكتروني</th>
            <th className="p-2">الهاتف</th>
            <th className="p-2">إجراءات</th>
          </tr>
        </thead>
        <tbody>
          {lawyers.map(lawyer => (
            <tr key={lawyer.id} className="border-t">
              <td className="p-2">{lawyer.name}</td>
              <td className="p-2">{lawyer.email}</td>
              <td className="p-2">{lawyer.phone}</td>
              <td className="p-2 flex gap-2 justify-end">
                <button onClick={() => deleteLawyer(lawyer.id)} className="text-red-600 hover:text-red-800">
                  <Trash size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

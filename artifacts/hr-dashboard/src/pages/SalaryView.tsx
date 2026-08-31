import React from 'react';
import { DollarSign, Download, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

export const SalaryView: React.FC = () => {
  const payroll = [
    { name: 'Priya Sharma', entity: 'EHM', base: '$95,000', allowances: '$12,000', deductions: '$8,500', netPay: '$98,500' },
    { name: 'Rahul Verma', entity: 'CAG', base: '$115,000', allowances: '$15,000', deductions: '$10,200', netPay: '$119,800' },
    { name: 'Anita Desai', entity: 'EHM', base: '$105,000', allowances: '$13,500', deductions: '$9,100', netPay: '$109,400' },
    { name: 'Vikram Mehta', entity: 'CAG', base: '$98,000', allowances: '$11,000', deductions: '$8,200', netPay: '$100,800' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Salary & Payroll</h2>
          <p className="text-xs text-gray-500 font-medium">Compensation breakdown & net pay calculations.</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200/80 rounded-xl p-5 shadow-xs overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
              <th className="py-3 px-3">Employee</th>
              <th className="py-3 px-3">Entity</th>
              <th className="py-3 px-3">Base Salary</th>
              <th className="py-3 px-3">Allowances</th>
              <th className="py-3 px-3">Deductions</th>
              <th className="py-3 px-3 font-bold text-emerald-700">Net Annual Pay</th>
              <th className="py-3 px-3 text-right">Payslip</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-700">
            {payroll.map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                <td className="py-3.5 px-3 font-bold text-gray-900">{row.name}</td>
                <td className="py-3.5 px-3 font-semibold text-gray-500">{row.entity}</td>
                <td className="py-3.5 px-3">{row.base}</td>
                <td className="py-3.5 px-3 text-emerald-600">+{row.allowances}</td>
                <td className="py-3.5 px-3 text-red-500">-{row.deductions}</td>
                <td className="py-3.5 px-3 font-extrabold text-emerald-600">{row.netPay}</td>
                <td className="py-3.5 px-3 text-right">
                  <button onClick={() => toast.success(`Downloaded payslip for ${row.name}`)} className="text-xs text-emerald-600 hover:underline font-bold">
                    PDF Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

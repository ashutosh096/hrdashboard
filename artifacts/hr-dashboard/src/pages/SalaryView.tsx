import React from 'react';
import { DollarSign, Download, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

import { useEntity } from '../contexts/EntityContext';

export const SalaryView: React.FC = () => {
  const { selectedEntity } = useEntity();

  const payroll = [
    { name: 'Ashutosh Mishra', entity: 'EHM', base: '₹14,50,000', allowances: '₹1,50,000', deductions: '₹85,000', netPay: '₹15,15,000' },
    { name: 'Priyanka Sharma', entity: 'EHM', base: '₹11,00,000', allowances: '₹1,20,000', deductions: '₹65,000', netPay: '₹11,55,000' },
    { name: 'Utkarsh Mishra', entity: 'EHM', base: '₹12,50,000', allowances: '₹1,30,000', deductions: '₹75,000', netPay: '₹13,05,000' },
    { name: 'Prerna Shukla', entity: 'EHM', base: '₹10,50,000', allowances: '₹1,10,000', deductions: '₹60,000', netPay: '₹11,00,000' },
    { name: 'Shreyansh Siladar', entity: 'EHM', base: '₹9,80,000', allowances: '₹1,00,000', deductions: '₹55,000', netPay: '₹10,25,000' },
    { name: "Tarul Ma'am", entity: 'CAG', base: '₹8,50,000', allowances: '₹90,000', deductions: '₹48,000', netPay: '₹8,92,000' },
    { name: 'Dr. Harshit Mishra', entity: 'EHM', base: '₹22,00,000', allowances: '₹2,50,000', deductions: '₹1,40,000', netPay: '₹23,10,000' },
    { name: 'Neha Shukla', entity: 'EHM', base: '₹11,50,000', allowances: '₹1,25,000', deductions: '₹68,000', netPay: '₹12,07,000' },
    { name: 'Dr. Utsav Mishra', entity: 'CAG', base: '₹16,00,000', allowances: '₹1,80,000', deductions: '₹95,000', netPay: '₹16,85,000' },
    { name: 'Jitendra Sir', entity: 'EHM', base: '₹25,00,000', allowances: '₹3,00,000', deductions: '₹1,60,000', netPay: '₹26,40,000' },
    { name: 'Pranshu Dubey', entity: 'EHM', base: '₹13,00,000', allowances: '₹1,40,000', deductions: '₹78,000', netPay: '₹13,62,000' },
    { name: 'Himanshu Tiwari', entity: 'CAG', base: '₹9,20,000', allowances: '₹95,000', deductions: '₹52,000', netPay: '₹9,63,000' },
  ].filter(emp => selectedEntity === 'ALL' || emp.entity === selectedEntity);

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

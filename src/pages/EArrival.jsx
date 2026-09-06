import React from 'react';


export default function EArrival() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="mb-10 border-b border-border-dark pb-8">
        <p className="uppercase tracking-widest text-sm text-primary mb-2 font-bold">Separate pre-arrival requirement</p>
        <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">India e-Arrival Card</h1>
        <p className="text-xl text-text-secondary leading-relaxed">Foreign nationals and OCI/eOCI cardholders should complete the official online arrival-information form within 72 hours before arriving in India.</p>
      </div>

      <div className="bg-amber-50 border border-amber-300 p-5 rounded mb-10">
        <p className="font-bold text-amber-950 mb-1">Arrival information only</p>
        <p className="text-sm text-amber-900">The e-Arrival Card does not grant entry, replace an e-Visa, replace the dedicated Afghan visa/ETA route, or replace the Visa-on-Arrival Annexure I form. Please complete your card submission directly on the official pre-flight portal.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <section className="border border-border rounded-xl p-6 bg-white shadow-xs">
          <h2 className="text-lg font-serif font-bold mb-3 text-gray-900">Before Opening the Form</h2>
          <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-text-secondary leading-relaxed">
            <li>Complete it only within the published 72-hour pre-arrival window.</li>
            <li>Use the same passport and personal details as your travel documents.</li>
            <li>Have the address, state, and district where you will stay in India.</li>
            <li>Have your recent travel history and contact details ready.</li>
          </ul>
        </section>

        <section className="border border-border rounded-xl p-6 bg-white shadow-xs">
          <h2 className="text-lg font-serif font-bold mb-3 text-gray-900">What the Official Form Asks</h2>
          <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-text-secondary leading-relaxed">
            <li>Full name, nationality/region, passport number, and purpose.</li>
            <li>Arrival date and countries visited during the previous six days.</li>
            <li>Address, state, and district in India.</li>
            <li>Email, contact number, and optional emergency contact.</li>
            <li>Any additional travellers and an accuracy declaration.</li>
          </ul>
        </section>
      </div>

      {/* Calendar Reminder Tool */}
      <div className="bg-[#FAF7F0] border border-[#D4AF37]/50 rounded-2xl p-6 sm:p-8 mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-sm">
        <div>
          <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#C4762A] block mb-1">
            Travel Reminder Utility
          </span>
          <h3 className="text-xl font-serif font-bold text-[#1E2A4F] mb-1">
            Add 72-Hour Pre-Flight Reminder
          </h3>
          <p className="text-xs text-gray-600 max-w-md">
            Download a standard calendar (.ics) reminder to complete your mandatory arrival declaration 3 days before your departure.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            const eventStart = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
            const icsContent = [
              'BEGIN:VCALENDAR',
              'VERSION:2.0',
              'PRODID:-//India Visa Seva//Pre-Flight Reminder//EN',
              'BEGIN:VEVENT',
              `DTSTART:${eventStart.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
              `DTEND:${new Date(eventStart.getTime() + 60 * 60 * 1000).toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
              'SUMMARY:Complete Mandatory India e-Arrival Card (within 72h)',
              'DESCRIPTION:Reminder to submit your mandatory online e-Arrival declaration before boarding your flight to India.',
              'STATUS:CONFIRMED',
              'END:VEVENT',
              'END:VCALENDAR',
            ].join('\r\n');

            const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'india-e-arrival-72h-reminder.ics';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
          }}
          className="bg-[#1E2A4F] hover:bg-[#0B2540] text-white px-5 py-3 rounded-lg text-xs font-sans font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          <svg className="w-4 h-4 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>Download .ICS Reminder</span>
        </button>
      </div>


    </div>
  );
}

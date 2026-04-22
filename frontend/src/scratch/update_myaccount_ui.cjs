const fs = require('fs');
const path = 'c:/Users/MAKESH/my-app/electronics-store/frontend/src/MyAccount.jsx';
let content = fs.readFileSync(path, 'utf8');

const target = `<div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-stone-100 mt-8">
                               <button className="bg-white border border-stone-200 text-stone-900 px-8 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-stone-50 transition shadow-sm active:scale-95">
                                 Download Invoice
                               </button>
                               <button className="bg-stone-900 text-amber-500 px-8 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-stone-800 transition shadow-md active:scale-95">
                                 Track Package
                               </button>
                            </div>`.replace(/\s+/g, ' ');

const replacement = `<div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-stone-100 mt-8">
                               {isCancellingOrder ? (
                                  <div className="w-full space-y-4">
                                     <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-stone-500">Reason for cancellation</label>
                                        <textarea 
                                          placeholder="Please tell us why you are cancelling..."
                                          className="w-full bg-stone-50 p-4 rounded-xl border border-stone-200 outline-none focus:border-red-500 text-sm font-medium resize-none h-24"
                                          value={cancellationReason}
                                          onChange={(e) => setCancellationReason(e.target.value)}
                                        />
                                     </div>
                                     <div className="flex gap-3 justify-end items-center">
                                        <button onClick={() => setIsCancellingOrder(false)} className="text-[10px] font-black uppercase tracking-widest text-stone-500 hover:text-stone-900 px-4 py-2 transition-colors">
                                          Keep Order
                                        </button>
                                        <button onClick={handleCancelOrderSubmit} className="text-[10px] font-black uppercase tracking-widest text-white bg-red-600 hover:bg-red-700 px-6 py-3 rounded-xl shadow-sm transition-colors">
                                          Confirm Cancellation
                                        </button>
                                     </div>
                                  </div>
                               ) : (
                                  <>
                                     {selectedOrder.status !== 'Cancelled' && selectedOrder.status !== 'Delivered' && (
                                       <button onClick={() => setIsCancellingOrder(true)} className="bg-white border border-red-200 text-red-600 px-8 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-red-50 transition shadow-sm active:scale-95">
                                         Cancel Order
                                       </button>
                                     )}
                                     <button className="bg-white border border-stone-200 text-stone-900 px-8 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-stone-50 transition shadow-sm active:scale-95">
                                       Download Invoice
                                     </button>
                                     <button className="bg-stone-900 text-amber-500 px-8 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-stone-800 transition shadow-md active:scale-95">
                                       Track Package
                                     </button>
                                  </>
                               )}
                            </div>`;

// Use simple string search with lines split
const lines = content.split('\n');
let blockStart = -1;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('Download Invoice') && lines[i+1]?.includes('Track Package') && lines[i-1]?.includes('flex flex-col sm:flex-row justify-end')) {
        blockStart = i - 1;
        break;
    }
}

if (blockStart !== -1) {
    lines.splice(blockStart, 8, replacement);
    fs.writeFileSync(path, lines.join('\n'));
    console.log("Successfully updated MyAccount.jsx with cancellation UI.");
} else {
    console.log("Could not find cancellation UI block in MyAccount.jsx.");
}

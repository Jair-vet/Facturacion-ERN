import React from 'react';

export const Summary = ({ venta }) => {
  const { subtotal, iva, total } = venta;

  return (
    <div className="flex gap-4 mb-6">
      <div className='w-full'>
        <div className="flex flex-col md:items-end text-center">
          <p className="font-semibold">
            Subtotal: <span className=' text-gray-500 font-thin md:pl-10 ml-2'>${subtotal.toFixed(2)}</span>
          </p>
          <p className="font-semibold">
            IVA 16%:  <span className=' text-gray-500 font-thin md:pl-10 ml-5'>${iva.toFixed(2)}</span>
          </p>
          <p className="font-semibold">
            Total:    <span className=' text-gray-500 font-thin md:pl-10 ml-8'>${total.toFixed(2)}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

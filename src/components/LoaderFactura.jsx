import React from 'react';

export const LoaderFactura = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px]">
      {/* Circulitos animados */}
      <div className="flex space-x-2">
        <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce"></div>
        <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce delay-200"></div>
        <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce delay-400"></div>
      </div>
      <p className="mt-4 text-blue-500 font-semibold text-lg">Generando factura...</p>
    </div>
  );
};

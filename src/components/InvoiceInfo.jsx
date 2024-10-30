import React from 'react'

export const InvoiceInfo = () => {
  return (
    <div>
        <div className='w-full'>
            <h2 className='text-3xl uppercase text-center text-gray-600'>Genera tu Factura</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 text-gray-600">
            <div className="text-sm p-4">
                <ul className='list-disc m-2'>
                    <li>Para un mejor servicio, tienes 30 días naturales a partir de la fecha de tu compra para solicitar tu factura.</li>
                    <li>Recuerda que tienes hasta el último día del mes para generar tu factura.</li>
                </ul>
            </div>
            <div className="text-sm p-4">
                <ul className='list-disc m-2'>
                    <li>Ingresa el folio de tu ticket o nota de venta.</li>
                    <li>Revisa que tus datos fiscales sean correctos.</li>
                    <p>(RFC, Razón social, Regimen Fiscal, Uso de CFDI)</p>
                    <li>Una vez timbrada la factura no podrá ser Cancelada.</li>
                </ul>
            </div>
        </div>
    </div>
  )
}

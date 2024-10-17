import React, { useState, useEffect } from 'react';
import { ItemsTable } from './ItemsTable';
import { Summary } from './Summary';
import axios from 'axios';
import Swal from 'sweetalert2'; // Asegúrate de haber instalado sweetalert2


export const InvoiceForm = () => {
  const [formData, setFormData] = useState({
    sucursal: '',
    folio: '',
    razonSocial: '',
    rfc: '',
    fiscal: '',
    cp: '',
    usoCfdi: '',
    correo: '',
    metodoPago: '', 
    metodoPago2: 'PUE', 
    metodoPagoDescripcion: 'EFECTIVO',
    metodoPagoDescripcion2: 'PAGO EN UNA SOLA EXHIBICIÓN',
    produccion: 'No',
    tipo: 'tasa16',
    ruta_csd: '',
    ruta_key: '',
    password: '12345678a', 
    ruta_xml: '',
    ruta_pdf: '',
    ruta_logotipo: '',
    is_return_paths: true,
    serie: 'F',
    tipo_comprobante: 'I',
    moneda: 'MXN',
    tipo_cambio: '1',
    lugar_expedicion: '',
    subtotal: '',
    total: '',
    exportacion: '01',
    rfc_emisor: '',
    razon_social_emisor: '',
    regimen_fiscal_emisor: '',
    rfc_receptor: '',
    razon_social_receptor: '',
    domicilio_fiscal_receptor: '',
    address_receptor: '',
    regimen_fiscal_receptor: '',
    bank: '',
    num_acount: '',
    clabe: '',
    conceptos: [],
    base_iva: '',
    impuesto_iva: '002',
    impuesto_ieps: '001',
    importe_iva: '',
    importe_ieps: '0.00',
    tasa_cuota_iva: '0.160000',
    tipo_factor_iva: 'Tasa',
  });

  const [isValidated, setIsValidated] = useState(false);
  const [sucursales, setSucursales] = useState([]);
  const [salidas, setSalidas] = useState([]);
  const [venta, setVenta] = useState([]);
  
  const cfdiParts = formData.usoCfdi.split(' ', 2); 
  const cfdiCode = cfdiParts[0]; 
  const cfdiDescription = formData.usoCfdi.substring(cfdiCode.length + 1); 

  useEffect(() => {
    const obtenerSucursales = async () => {
      try {
        const response = await axios.get('https://binteapi.com:8095/api/sucursales/');
        setSucursales(response.data);
      } catch (error) {
        console.error('Error al cargar las sucursales:', error);
      }
    };
    obtenerSucursales();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleCfdiChange = (e) => {
    const { name, value } = e.target;
    let newCfdiCode = cfdiCode;
    let newCfdiDescription = cfdiDescription;

    if (name === 'cfdiCode') {
      newCfdiCode = value;
    } else if (name === 'cfdiDescription') {
      newCfdiDescription = value;
    }

    setFormData({
      ...formData,
      usoCfdi: `${newCfdiCode} ${newCfdiDescription}`
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.sucursal || !formData.folio) {
      Swal.fire('Error', 'Por favor, selecciona una sucursal e ingresa un folio', 'error');
      return;
    }

    const url = `https://binteapi.com:8095/api/ventas/${formData.sucursal}/${formData.folio}/`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      const result = await response.json();
      if (response.ok) {
        setIsValidated(true);
        setFormData({
          ...formData,
          ruta_xml: `https://sgp-web.nyc3.digitaloceanspaces.com/sgp-web/${result.rutas.url_carpeta_facturacion}XML`,
          ruta_pdf: `https://sgp-web.nyc3.digitaloceanspaces.com/sgp-web/${result.rutas.url_carpeta_facturacion}PDF`,
          ruta_logotipo: result.rutas.url_logo,
          lugar_expedicion: result.empresa.cp,
          subtotal: result.venta.subtotal,
          total: result.venta.total,
          rfc_emisor: result.empresa.rfc,
          razon_social_emisor: result.empresa.razonsocial,
          regimen_fiscal_emisor: result.empresa.regimenfiscal,
          rfc_receptor: result.cliente.rfc,
          razon_social_receptor: result.cliente.empresa,
          domicilio_fiscal_receptor: result.cliente.domicilio,
          address_receptor: result.cliente.domicilio,
          regimen_fiscal_receptor: '612', 
          bank: result.banco.banco,
          num_acount: result.banco.no_cuenta,
          clabe: result.banco.clabe_inter,
          conceptos: result.salidas.map((salida) => ({
            clave_sat: salida.clave_sat,
            clave_prod: salida.numparte,
            cantidad: salida.cantidad,
            unidad_sat: salida.unidad_sat,
            descripcion: salida.descripcion,
            valor_unitario: salida.precio,
            importe: salida.importe,
            objeto_imp: '02',
            base: salida.importe,
            impuesto: '002',
            tasaOcuota: '0.16',
            tipoFactor: 'Tasa',
          })),
          base_iva: result.venta.subtotal,
          importe_iva: result.venta.iva,
        });
        setSalidas(result.salidas);
        setVenta(result.venta);
        Swal.fire('Éxito', 'El folio es válido', 'success');
      } else {
        Swal.fire('Error', result.message || 'El folio no es válido', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Error al conectar con el servidor', 'error');
    }
  };

  const handleGenerateFactura = async () => {
    try {
      const response = await axios.post(
        'https://www.binteapi.com:8085/src/cfdi40.php',
        formData
      );
      if (response.status === 200) {
        Swal.fire('Factura generada', 'La factura se ha generado correctamente', 'success');
      } else {
        Swal.fire('Error', 'Hubo un problema al generar la factura', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Error al generar la factura', 'error');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Validación de Folio */}
      <div className="grid grid-cols-3 gap-4 mb-1">
        <div>
          <label className="block text-sm font-medium text-gray-700">Selecciona la sucursal:</label>
          <select
            name="sucursal"
            value={formData.sucursal}
            onChange={handleChange}
            className="bg-gray-300 mt-1 block w-full border border-gray-300 rounded-md p-1"
          >
            <option value="">Selecciona una sucursal</option>
            {sucursales.map((sucursal) => (
              <option key={sucursal.id} value={sucursal.nombre}>{sucursal.nombre}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Ingresa folio de ticket:</label>
          <input
            type="text"
            name="folio"
            value={formData.folio}
            onChange={handleChange}
            className="bg-gray-300 mt-1 block w-full border border-gray-300 rounded-md p-1"
          />
        </div>
        <div className="flex justify-center items-center text-sm font-medium">
          <button
            type="submit"
            className="text-white bg-[#365326] shadow-lg p-2 pl-5 pr-5 rounded-3xl text-[12px] uppercase hover:bg-[#3e662a]"
          >
            Validar
          </button>
        </div>
      </div>

      {/* Mostrar los otros campos solo si la validación fue exitosa */}
      {isValidated && (
        <>
          <div className="col-span-3">
            <label className="block text-sm font-medium text-gray-700">Razón Social:</label>
              <input
                type="text"
                name="razonSocial"
                value={formData.razonSocial}
                className="bg-gray-300 mt-1 block w-full border border-gray-300 rounded-md p-1"
              />
          </div>

          <div className="parent grid grid-cols-7 gap-x-1 gap-y-0">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">RFC:</label>
              <input
                type="text"
                name="rfc"
                value={formData.rfc}
                onChange={handleChange}
                className="bg-gray-300 mt-1 block w-full border border-gray-300 rounded-md p-1"
              />
            </div>
            <div className="col-start-3 col-end-4">
              <label className="block text-sm font-medium text-gray-700">R. Fiscal:</label>
              <input
                type="text"
                name="fiscal"
                value={formData.fiscal}
                onChange={handleChange}
               className="bg-gray-300 mt-1 block w-full border border-gray-300 rounded-md p-1"
              />
            </div>
            <div className="col-start-4 col-end-5">
              <label className="block text-sm font-medium text-gray-700">C.P.:</label>
              <input
                type="text"
                name="cp"
                value={formData.cp}
                onChange={handleChange}
                className="bg-gray-300 mt-1 block w-full border border-gray-300 rounded-md p-1"
              />
            </div>
            <div className="col-start-5 col-end-6 pl-16">
              <label className="block text-sm font-medium text-gray-700 mt-6"></label>
              <input
                type="text"
                name="cfdiCode"
                value={cfdiCode} // Mostrar solo la primera parte (código)
                onChange={handleCfdiChange} // Actualiza el valor del código
                className="bg-gray-300 mt-1 block w-full border border-gray-300 rounded-md p-1"
              />
            </div>
            <div className="col-span-2 col-start-6">
              <label className="block text-sm font-medium text-gray-700">Uso CFDI:</label>
              <input
                type="text"
                name="cfdiDescription"
                value={cfdiDescription} // Mostrar solo la segunda parte (descripción)
                onChange={handleCfdiChange} // Actualiza el valor de la descripción
                className="bg-gray-300 mt-1 block w-full border border-gray-300 rounded-md p-1"
              />
            </div>
          </div>

          <div className="parent grid grid-cols-7 gap-x-1 gap-y-0">
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mt-7"></label>
              <input
                type="text"
                name="metodoPago"
                value={formData.metodoPago}
                // onChange={handleChange}
                readOnly
                className="campo_sin_editar"
              />
            </div>
            <div className="col-start-2 col-end-5">
              <label className="text-sm font-medium text-gray-700">Método de Pago:</label>
              <input
                name="metodoPagoDescripcion"
                value={formData.metodoPagoDescripcion} 
                // onChange={handleChangeMetodoPago} 
                readOnly
                className="campo_sin_editar"
              >
              </input>
            </div>
            <div className="col-start-5 col-end-6">
              <label className="block text-sm font-medium text-gray-700  mt-1">Pago:</label>
              <input
                value={formData.metodoPago2}
                type="text"
                readOnly
                className="campo_sin_editar"
              />
            </div>
            <div className="col-start-6 col-span-2 mt-6">
              <label className="text-sm font-medium text-gray-700"></label>
              <input
                value={formData.metodoPagoDescripcion2}
                type="text"
                readOnly
                className="campo_sin_editar"
              />
            </div>
          </div>

          <div className="grid col-span-6 gap-4 mb-2">
            <div className="grid col-span-2">
              <label className="block text-sm font-medium text-gray-700">Correo:</label>
              <input
                type="text"
                name="email_envio_facturacion"
                value={formData.email_envio_facturacion}
                onChange={handleChange}
                className="bg-gray-300 mt-1 block w-full border border-gray-300 rounded-md p-1"
              />
            </div>
          </div>
          <ItemsTable salidas={salidas} />
          <Summary venta={venta}/>
          <button 
            className="w-full bg-[#365326] text-white px-4 py-2 mt-4 hover:bg-[#3e662a] rounded-3xl uppercase"
            type="button"
            onClick={handleGenerateFactura}
          >
            Generar Factura
          </button>
        </>
      )}
    </form>
  );
};

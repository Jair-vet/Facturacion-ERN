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
    produccion: '',
    tipo: '',
    ruta_csd: '',
    ruta_key: '',
    password: '',
    ruta_xml: '',
    ruta_pdf: '',
    ruta_logotipo: '',
    is_return_paths: '',
  
    //datos facturacion
    serie: '',
    folio: '',
    // "metodo_pago": '',
    // "forma_pago": '', //01 - EFECTIVO 03 - TRANSFERENCIA 04 - TARJETA CREDITO 28 - TARJETA DEBITO
    tipo_comprobante: '',
    moneda: '',
    tipo_cambio: '',
    lugar_expedicion: '', //CP DE LA SUCURSA''L
    subtotal: '',
    total: '',
    exportacion: '',

    //DATOS DE EMISOR - SUCURSAL
    // "rfc_emisor": '',
    razon_social_emisor: '',
    regimen_fiscal_emisor: '',
    // "address_emisor": '',
    //DATOS DEL RECEPTOR - CLIENTE
    rfc_receptor: '',
    razon_social_receptor: '',
    // "uso_cfdi": '',
    domicilio_fiscal_receptor: '',
    address_receptor: '',
    regimen_fiscal_receptor: '',
    //DATOS DEL BANCO - TABLA MIBANCO
    bank: '',
    num_acount: '',
    clabe: '',
    //CONCEPTOS
    conceptos: [
        {
            clave_sat: '',
            clave_prod: '',
            cantidad: '',
            unidad_sat: '',
            descripcion: '',
            valor_unitario: '', //657.93
            importe: '',
            objeto_imp: '',
            base: '',
            // importe_iva_concepto: '',
            impuesto: '',
            tasaOcuota: '',
            tipoFactor: ''
        }
    ],
    new_concepts: [],
    //IMPUESTOS
    base_iva: '', //SUMA TOTAL DE LA BASE DE TODOS LOS CONCEPTOS
    impuesto_iva: '',
    impuesto_ieps: '',
    importe_iva: '', //SUMA TOTAL DEL IVA DE TODOS LOS CONCEPTOS
    importe_ieps: '',
    tasa_cuota_iva: '',
    tipo_factor_iva: '',
    days: '',
    date: '',
    reference: "",
  });

  const [isValidated, setIsValidated] = useState(false); // Estado para mostrar u ocultar los otros campos
  const [sucursales, setSucursales] = useState([]);
  const [ventaData, setVentaData] = useState(null);
  const [salidas, setSalidas] = useState([]);
  const [venta, setVenta] = useState([]);
  
  // Dividimos `usoCfdi` en dos partes
  const cfdiParts = formData.usoCfdi.split(' ', 2); 
  const cfdiCode = cfdiParts[0]; 
  const cfdiDescription = formData.usoCfdi.substring(cfdiCode.length + 1); 

  const metodosDePago = [
    { id: '01', metodo: 'EFECTIVO' },
    { id: '02', metodo: 'TARJETA' },
    { id: '03', metodo: 'DEPOSITO' },
  ];

  const metodosDePago2 = [
    { id: 'PUE', metodo: 'PAGO EN UNA SOLA EXHIBICIÓN' },
  ];

  // Función para manejar el cambio de inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Actualización dinámica de CFDI (código y descripción por separado)
  const handleCfdiChange = (e) => {
    const { name, value } = e.target;

    // Actualizamos las partes del CFDI según el input modificado
    let newCfdiCode = cfdiCode;
    let newCfdiDescription = cfdiDescription;

    if (name === 'cfdiCode') {
      newCfdiCode = value;
    } else if (name === 'cfdiDescription') {
      newCfdiDescription = value;
    }

    // Unimos ambos valores en el campo `usoCfdi`
    setFormData({
      ...formData,
      usoCfdi: `${newCfdiCode} ${newCfdiDescription}`
    });
  };

// 
//   // Función para manejar cambios en los inputs
  const handleChangeMetodoPago = (e) => {
    const selectedMetodo = metodosDePago.find(
      (metodo) => metodo.metodo === e.target.value
    );
    
    if (selectedMetodo) {
      setFormData({
        ...formData,
        metodoPago: selectedMetodo.id, // Actualiza el ID (01, 02, 03)
        metodoPagoDescripcion: selectedMetodo.metodo, // Actualiza la descripción (EFECTIVO, TARJETA, etc.)
      });
    }
  };


  // useEffect para cargar las sucursales desde la API al montar el componente
  useEffect(() => {
    const obtenerSucursales = async () => {
      try {
        const response = await axios.get('https://binteapi.com:8095/api/sucursales/');
        setSucursales(response.data); // la respuesta tiene un array de sucursales
      } catch (error) {
        console.error('Error al cargar las sucursales:', error);
      }
    };

    obtenerSucursales();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Comprobar si se ha seleccionado una sucursal y si el folio está presente
    if (!formData.sucursal || !formData.folio) {
      Swal.fire('Error', 'Por favor, selecciona una sucursal e ingresa un folio', 'error');
      return;
    }

    // URL construida
    const url = `https://binteapi.com:8095/api/ventas/${formData.sucursal}/${formData.folio}/`;

    try {
      const response = await fetch(url, {
        method: 'GET', // Cambiamos a GET porque es una solicitud para obtener datos
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      console.log(result);

      if (response.ok) {
        setIsValidated(true); // Si la validación es exitosa, mostrar los otros campos
        setVentaData(result); // Guardamos los datos de la venta en el estado
        Swal.fire('Éxito', 'El folio es válido', 'success');
        setFormData({
          ...formData,
          // Creación del objeto unificado
          produccion: "No",
          tipo: "tasa16",
          ruta_csd: "",
          ruta_key: "",
          password: "12345678a", // Empresa contraseña
          ruta_xml: `https://sgp-web.nyc3.digitaloceanspaces.com/sgp-web/${result.rutas.url_carpeta_facturacion}XML`,
          ruta_pdf: `https://sgp-web.nyc3.digitaloceanspaces.com/sgp-web/${result.rutas.url_carpeta_facturacion}PDF`,
          ruta_logotipo: result.rutas.url_logo,
          is_return_paths: true,
        
          //datos facturacion
          serie: "F",
          folio: formData.folio,
          metodo_pago: "PUE",
          "forma_pago": "03", //01 - EFECTIVO 03 - TRANSFERENCIA 04 - TARJETA CREDITO 28 - TARJETA DEBITO
          tipo_comprobante: "I",
          moneda: "MXN",
          tipo_cambio: "1",
          lugar_expedicion: result.empresa.cp,
          subtotal: result.venta.subtotal,
          total: result.venta.total,
          exportacion: result.venta.exportacion,

          //DATOS DE EMISOR - SUCURSAL
          rfc_emisor: result.empresa.rfc, 
          razon_social_emisor: formData.razonSocial,
          regimen_fiscal_emisor: result.empresa.regimenfiscal,
          "address_emisor": "Calle Ejemplo, 123567",
          //DATOS DEL RECEPTOR - CLIENTE
          rfc_receptor: formData.rfc,  // cliente
          razon_social_receptor: result.cliente.empresa,
          "uso_cfdi": "G03",  // Solo el codigo
          domicilio_fiscal_receptor: formData.cp,
          address_receptor: result.cliente.domicilio,
          regimen_fiscal_receptor: "612",  // ! regimen fiscal  TODO: Editar
          //DATOS DEL BANCO - TABLA MIBANCO
          bank: result.banco.banco,
          num_acount: result.banco.no_cuenta,
          clabe: result.banco.clabe_inter,
          //CONCEPTOS
          conceptos: [
              {
                  clave_sat: result.salidas.clave_sat,
                  clave_prod: result.salidas.numparte,
                  cantidad: result.salidas.cantidad,
                  unidad_sat: result.salidas.unidad_sat,
                  descripcion: result.salidas.descripcion,
                  valor_unitario: result.salidas.precio, //657.93
                  importe: result.salidas.importe,
                  objeto_imp: "02",
                  base: result.salidas.importe,
                  // "importe_iva_concepto": "362.99",
                  impuesto: "002",
                  tasaOcuota: "0.16",
                  tipoFactor: "Tasa"
              }
          ],
          new_concepts: [],
          //IMPUESTOS
          "base_iva": "2268.72", //SUMA TOTAL DE LA BASE DE TODOS LOS CONCEPTOS todos los importes
          impuesto_iva: "002",
          impuesto_ieps: "001",
          "importe_iva": "362.99", //SUMA TOTAL DEL IVA DE TODOS LOS CONCEPTOS todos los productos
          importe_ieps: "0.00",
          tasa_cuota_iva: "0.160000",
          tipo_factor_iva: "Tasa",
          days: 0,
          date: null,
          reference: "",

          // Rellenar Formulario
          razonSocial: result.empresa.razonsocial,
          fiscal: result.empresa.regimenfiscal,
          rfc: result.empresa.rfc,
          cp: result.empresa.cp,
          usoCfdi: '',
          correo: result.rutas.email_envio_facturacion,
          metodoPago: result.venta.formapago, 

        });

        setSalidas(result.salidas);
        setVenta(result.venta);
      } else {
        setIsValidated(false); // Ocultamos los campos si la validación falla
        Swal.fire('Error', result.message || 'El folio no es válido', 'error');
      }
    } catch (error) {
      setIsValidated(false); // Ocultamos los campos si ocurre un error
      Swal.fire('Error', 'Error al conectar con el servidor', 'error');
      console.error('Error al conectar:', error);
    }
  };

  
  const handleGenerateFactura = async () => {
  }

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

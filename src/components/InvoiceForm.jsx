import React, { useState, useEffect } from 'react';
import { ItemsTable } from './ItemsTable';
import { Summary } from './Summary';
import axios from 'axios';
import Swal from 'sweetalert2'; // Asegúrate de haber instalado sweetalert2
import { Loader } from './Loader';


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
    Produccion: "NO",
    type: "tasa16",
    id_invoice: "", 
    rutaCSD: "", // SE AGREGA VACIO
    rutaKEY: "", // SE AGREGA VACIO
    password: '',
    rutaXML: "",
    rutaPDF: "",
    rutaLogotipo: "",
    is_return_paths: true,
    
    // Datos de facturación
    serie: "",
    folio: "",
    metodo_pago: "PUE",
    forma_pago: "03",
    tipo_comprobante: "I",  
    moneda: "MXN",
    tipo_cambio: "1",
    fecha_expedicion: "",  // SE AGREGA VACIO
    lugar_expedicion: "",
    subtotal: "",
    total: "",
    exportacion: "01",

    // Datos del Emisor - Sucursal
    rfc_emisor: "",
    razonSocial_emisor: "", 
    regimenFiscal_emisor: "",
    address_emisor: "Calle Ejemplo, 123567",  // PENDIENTE

    // Datos del Receptor - Cliente
    rfc_receptor: "",
    razonSocial_receptor: "",
    usoCFDI: "G03", // SE CAMBIO NOMBRE DE VARIABLE
    domicilioFiscal_receptor: "",
    address_receptor: "",
    regimenFiscal_receptor: "",

    // Datos del Banco - Tabla MiBanco
    bank: "",
    num_acount: "",
    clabe: "",

    // Conceptos
    conceptos: [
      {
        clave_sat: "",
        clave_prod: "",
        cantidad: "",
        unidad_sat: "",
        descripcion: "",
        valor_unitario: "", // 657.93
        importe: "", // 2631.72
        base: "",
        importe_iva_concepto: '',
        Importe: '',
        objeto_imp: "02",
        impuesto: "002",
        tasaOcuota: "0.160000",
        tipoFactor: "Tasa",
      },
    ],

    newConcepts: [], // SE CAMBIO EL NOMBRE

    // Impuestos
    Base_iva: "",
    impuesto_iva: "002",
    impuesto_ieps: "001",
    importe_iva: "",
    importe_ieps: "0.00",
    tasaOcuota_iva: "0.160000", // SE CAMBIO NOMBRE DE VARIABLE
    tipoFactor_iva: "Tasa", // SE CAMBIO NOMBRE DE VARIABLE

    // Otros datos
    days: 0,
    date: null,
    reference: "",
    refpago: "",
    cfdi: '',
    cliente: '',
    correo_cliente: ''
  });

  const [isValidated, setIsValidated] = useState(false);
  const [sucursales, setSucursales] = useState([]);
  const [salidas, setSalidas] = useState([]);
  const [venta, setVenta] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInvoiceGenerated, setIsInvoiceGenerated] = useState(false);
  const [pdfUrl, setPdf] = useState(false);
  const [xmlUrl, setXml] = useState(false);
  
  // Separar el cfdi en dos partes
  const cfdiParts = formData.cfdi.split(' ', 2);
  const cfdiCode = cfdiParts[0] || ''; 
  const cfdiDescription = cfdiParts.slice(1).join(' ') || ''; 

  useEffect(() => {
    setIsLoading(true);
    const obtenerSucursales = async () => {
      try {
        const response = await axios.get('https://binteapi.com:8095/api/sucursales/');
        setSucursales(response.data);
      } catch (error) {
        console.error('Error al cargar las sucursales:', error);
      }finally {
        setIsLoading(false); // Detener el loader
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

  const handleCfdiChange = (e, type) => {
    const { value } = e.target;
    
    if (type === 'code') {
      setFormData({
        ...formData,
        cfdi: `${value} ${cfdiDescription}`, // Mantener la descripción existente
      });
    } else if (type === 'description') {
      setFormData({
        ...formData,
        cfdi: `${cfdiCode} ${value}`, // Mantener el código existente
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
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
          rutaXML: `https://sgp-web.nyc3.digitaloceanspaces.com/sgp-web/${result.rutas.url_carpeta_facturacion}XML`,
          rutaPDF: `https://sgp-web.nyc3.digitaloceanspaces.com/sgp-web/${result.rutas.url_carpeta_facturacion}PDF`,
          password: result.empresa.contrasena_csd,
          rutaLogotipo: result.rutas.url_logo,
          lugar_expedicion: result.empresa.cp,
          subtotal: result.venta.subtotal,
          total: result.venta.total,
          rfc_emisor: result.empresa.rfc,
          razonSocial_emisor: result.empresa.razonsocial,
          regimenFiscal_emisor: result.empresa.regimenfiscal,
          rfc_receptor: result.cliente.rfc,
          razonSocial_receptor: result.cliente.empresa,
          domicilioFiscal_receptor: result.cliente.cp,
          address_receptor: result.cliente.domicilio,
          // usoCFDI: result.cliente.domicilio,
          regimenFiscal_receptor: '612', 
          bank: result.banco.banco,
          num_acount: result.banco.no_cuenta,
          clabe: result.banco.clabe_inter,
          serie: result.rutas.serie,
          folio: result.factura.id,
          conceptos: result.salidas.map((salida) => ({
            clave_sat: salida.clave_sat,
            clave_prod: salida.numparte,
            cantidad: salida.cantidad,
            unidad_sat: salida.unidad_sat,
            descripcion: salida.descripcion,
            valor_unitario: salida.precio,
            importe: salida.importe,
            base: salida.importe,
            importe_iva_concepto: salida.iva_importe,
            Importe: salida.importe,
            objeto_imp: '02',
            impuesto: "002",
            tasaOcuota: "0.160000",
            tipoFactor: "Tasa",
            // impuesto: '002',
            // tasaOcuota: '0.16',
            // tipoFactor: 'Tasa',
          })),
          Base_iva: result.venta.subtotal,
          // impuesto_iva: result.salidas.importe,
          importe_iva: result.venta.iva,
          correo: result.rutas.email_envio_facturacion,
          cp: result.empresa.cp,
          fiscal: result.empresa.regimenfiscal,
          metodoPago: result.venta.formapago,
          importe_iva_concepto: result.salidas.iva_importe,
          refpago: result.venta.refpago,
          cfdi: result.cliente.cfdi,
          cliente: result.cliente.empresa,
          correo_cliente: result.cliente.correo
          // Importe: result.salidas.iva_importe,
        });
        setSalidas(result.salidas);
        setVenta(result.venta);
        Swal.fire('Éxito', 'El folio es válido', 'success');
      } else {
        Swal.fire('Error', result.message || 'El folio no es válido', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Error al conectar con el servidor', 'error');
    } finally {
      setIsLoading(false); // Detener el loader
    }
  };

  const handleGenerateFactura = async () => {
    console.log(formData);
    setIsLoading(true);
    try {
      const response = await axios.post(
        'https://www.binteapi.com:8085/src/cfdi40.php',
        formData
      );
      console.log(response);

      if (response.status === 200) {
        // Mostrar el Swal y luego ejecutar la descarga al presionar "OK"
        Swal.fire('Factura Generada', 'La factura se ha generado correctamente', 'success')
          .then((result) => {
            if (result.isConfirmed) {
              // Extraer los paths para el PDF y XML de la respuesta
              const { path_pdf, path_xml } = response.data;

              // Generar las URLs completas para la descarga
              const baseUrl = 'https://sgp-web.nyc3.cdn.digitaloceanspaces.com/sgp-web/pruebas/ern-melaminas/';
              const pdfUrl = `${baseUrl}${path_pdf}`;
              const xmlUrl = `${baseUrl}${path_xml}`;

              setPdf(pdfUrl)
              setXml(xmlUrl)

              // Abrir el PDF en una nueva pestaña
              openFileInNewTab(pdfUrl);
              
              // Opcionalmente, descarga el XML automáticamente
              downloadFile(xmlUrl, 'factura.xml');

              setIsInvoiceGenerated(true); // Marcar que la factura fue generada
            }
          });
      } else {
        Swal.fire('Error', 'Hubo un problema al generar la factura', 'error');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al generar la factura';
      Swal.fire('Error', errorMessage, 'error');
    } finally {
      setIsLoading(false); // Detener el loader
    }
  };
  
  // Función para abrir archivos en una nueva pestaña
  const openFileInNewTab = (url) => {
    const newWindow = window.open(url, '_blank');
    if (newWindow) {
      newWindow.focus(); // Asegurarse de que la nueva pestaña tenga el foco
    } else {
      Swal.fire('Error', 'No se pudo abrir el archivo en una nueva pestaña', 'error');
    }
  };
  
  // Función auxiliar para descargar archivos
  const downloadFile = (url, filename) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSendInvoiceEmail = async () => {
    // console.log('Enviando..');
    
    setIsLoading(true);
    try {
      
      // Función para convertir un archivo en base64
      const convertToBase64 = async (url) => {
        const response = await fetch(url);
        const blob = await response.blob();
        
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(reader.result.split(',')[1]); // Regresa solo la parte Base64
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      };
      // Convertir el PDF y el XML a base64
      const pdfBase64 = await convertToBase64(pdfUrl);
      const xmlBase64 = await convertToBase64(xmlUrl);
  
      // Preparar los datos para la solicitud
      const emailData = {
        to_email: formData.correo_cliente, // correo del cliente
        to_name: formData.razonSocial, // razón social del cliente
        number_template: 4178982,
        from_email: "soporte@gruposped.com", // correo de la sucursal
        from_name: "Factura",
        vars_submit: {
          logo: "undefined", // ruta del logotipo de la sucursal
          Cliente: formData.cliente, // razón social del cliente
          Emisor: "vacio", // razón social de la sucursal
          Serie: "F", // serie de la factura
          Folio:  formData.folio, // folio de la factura
          correo: "soporte@binteconsulting.com", // correo de la sucursal
        },
        more_emails: [],
        with_copy_emails: [],
        with_copy_secret_emails: [],
        subject: "Factura",
        attachments_files: [
          {
            ContentType: "application/pdf",
            Filename: "factura.pdf",
            Base64Content: pdfBase64,
          },
          {
            ContentType: "application/xml",
            Filename: "factura.xml",
            Base64Content: xmlBase64,
          },
        ],
      };

      // console.log(emailData);
      
  
      // Enviar los datos a la API
      const emailResponse = await axios.post(
        'https://developer.binteapi.com:8083/submit-email',
        emailData
      );
  
      if (emailResponse.status === 200) {
        Swal.fire('Correo Enviado', 'La factura ha sido enviada correctamente', 'success');
      } else {
        Swal.fire('Error', 'Hubo un problema al enviar el correo', 'error');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al enviar el correo';
      Swal.fire('Error', errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  console.log(cfdiCode);
  

  return (
    <form onSubmit={handleSubmit}>
      {/* Mostrar el loader */}
      {isLoading && <div className=" flex justify-center items-center"><Loader /></div>}

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
            disabled={isLoading}
          >
            {isLoading ? 'Cargando...' : 'Validar'}
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
                value={formData.razonSocial_emisor}
                onChange={handleChange}
                className="bg-gray-300 mt-1 block w-full border border-gray-300 rounded-md p-1"
              />
          </div>

          <div className="parent grid grid-cols-7 gap-x-1 gap-y-0">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">RFC:</label>
              <input
                type="text"
                name="rfc_receptor"
                value={formData.rfc_receptor}
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
            <div className="col-start-5 col-end-6">
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
                defaultValue={formData.refpago}
                // onChange={handleChange}
                // readOnly
                className="campo_sin_editar"
              />
            </div>
            <div className="col-start-2 col-end-5">
              <label className="text-sm font-medium text-gray-700">Método de Pago:</label>
              <input
                name="metodoPagoDescripcion"
                defaultValue={formData.metodoPagoDescripcion} 
                // onChange={handleChangeMetodoPago} 
                // readOnly
                className="campo_sin_editar"
              >
              </input>
            </div>
            <div className="col-start-5 col-end-6">
              <label className="block text-sm font-medium text-gray-700  mt-1">Pago:</label>
              <input
                defaultValue={formData.metodoPago2}
                type="text"
                // readOnly
                className="campo_sin_editar"
              />
            </div>
            <div className="col-start-6 col-span-2 mt-6">
              <label className="text-sm font-medium text-gray-700"></label>
              <input
                defaultValue={formData.metodoPagoDescripcion2}
                type="text"
                // readOnly
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
                value={formData.correo}
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
            disabled={isLoading}
          >
            {isLoading ? 'Cargando...' : 'Generar Factura'}
          </button>
          {isInvoiceGenerated && (
            <button 
              className="w-full bg-[#365326] text-white px-4 py-2 mt-4 hover:bg-[#3e662a] rounded-3xl uppercase"
              type="button"
              onClick={handleSendInvoiceEmail}
              disabled={isLoading} // Deshabilitar si está cargando
            >
              {isLoading ? 'Enviando...' : 'Enviar por Correo'}
            </button>
          )}
        </>
      )}
    </form>
  );
};

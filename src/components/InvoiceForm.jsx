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
    folioSucursal: '',
    correo: '',
    razonSocial: '',
    rfc: '',
    regimenFiscal: '',
    cp: '',
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
    // !
    usoCFDI: '',
    cfdi: '',
    codigoCDFI: '',
    usoCfdi: '',
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
    cliente: '',
    correo_cliente: '',
    correo_sucursal: '',
  });

  const [isValidated, setIsValidated] = useState(false);
  const [sucursales, setSucursales] = useState([]);
  const [salidas, setSalidas] = useState([]);
  const [venta, setVenta] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInvoiceGenerated, setIsInvoiceGenerated] = useState(false);
  const [pdfUrl, setPdf] = useState(false);
  const [xmlUrl, setXml] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState('');

  // Separar el cfdi en dos partes
  const cfdiParts = formData.cfdi.split(' ', 2);
  const cfdiCode = cfdiParts[0] || ''; 
  const cfdiDescription = cfdiParts.slice(1).join(' ') || ''; 

  const arregloCDFI = [
    { codigoCDFI: 'G01', cfdi: 'ADQUISICIÓN DE MERCANCIAS' },
    { codigoCDFI: 'G03', cfdi: 'GASTOS EN GENERAL' },
    { codigoCDFI: 'I01', cfdi: 'CONSTRUCCIONES' },
    { codigoCDFI: 'I02', cfdi: 'MOBILIARIO Y EQUIPO DE OFICINA POR INVERSIONES' },
    { codigoCDFI: 'I03', cfdi: 'EQUIPO DE TRANSPORTE' },
    { codigoCDFI: 'I04', cfdi: 'EQUIPO DE COMPUTO Y ACCESORIOS' },
    { codigoCDFI: 'I05', cfdi: 'DADOS, TOQUELES, MOLDES, MATRICES Y HERRAMENTAL' },
    { codigoCDFI: 'I08', cfdi: 'OTRA MAQUINARIA Y EQUIPO' },
  ];

  useEffect(() => {
    setIsLoading(true);
    const obtenerSucursales = async () => {
      try {
        // Obtén la URL actual
        const currentUrl = window.location.href;
        // Extrae la primera palabra después del dominio
        const pathSegment = currentUrl.split('/')[2]; // Índice 3 después de "https://"
  
        // Construye la URL de la petición
        const requestUrl = `https://binteapi.com:8095/api/sucursales/${pathSegment}`;
  
        // Realiza la petición
        const response = await axios.get(requestUrl);
        setSucursales(response.data);
      } catch (error) {
        console.error('Error al cargar las sucursales:', error);
      } finally {
        setIsLoading(false); // Detener el loader
      }
    };
  
    obtenerSucursales();
  }, []);
  
  // https://binteapi.com:8095/api/sucursales/http://localhost:5173/factura-ERN/

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleCfdiChange = (event) => {
    const selectedCfdi = event.target.value;

    // Encuentra el CFDI seleccionado en el arreglo
    const selectedItem = arregloCDFI.find(item => item.cfdi === selectedCfdi);
    
    if (selectedItem) {
      setFormData({
        ...formData,
        usoCFDI: selectedItem.codigoCDFI,
        usoCfdi: selectedItem.codigoCDFI,
        cfdi: selectedItem.cfdi,
        codigoCDFI: selectedItem.codigoCDFI
      });
    }
  };

  const handleIconClick = (src) => {
    setImageSrc(src);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    if (!formData.sucursal || !formData.folio) {
      Swal.fire({
        title: 'WARNING',
        text: 'Por favor, selecciona una sucursal e ingresa un folio',
        icon: 'warning',
        iconColor: '#4782f6', // Color azul para el icono
        confirmButtonColor: '#007bff', // Color azul para el botón de confirmación
      });
      setIsLoading(false);
      return;
    }
    

    const url = `https://binteapi.com:8095/api/ventas/${formData.sucursal}/${formData.folio}/`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      const config = {
        headers: {
          Authorization: `Bearer iIxMDUxOjM5MSIsInZlciI6IjIuMCIs`, // Access token
        },
      };

      const result = await response.json();
      if (response.ok) {

        // Validar si result.cliente.cfdi tiene valor
        const validaCFDI = result.cliente.cfdi && arregloCDFI.includes(result.cliente.cfdi) ? result.cliente.cfdi : 'G01';

        const codigoCDFI = result.cliente.cfdi || 'G01';
        

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
          rfc_receptor: result.cliente.rfc,
          razonSocial_emisor: result.empresa.razonsocial,
          razonSocial_receptor: result.cliente.empresa,
          regimenFiscal_emisor: result.empresa.regimenfiscal,
          rfc: result.cliente.rfc,
          razonSocial: result.cliente.empresa,
          domicilioFiscal_receptor: result.cliente.cp,
          address_receptor: result.cliente.domicilio,
          regimenFiscal_receptor: '612', 
          bank: result.banco.banco,
          num_acount: result.banco.no_cuenta,
          clabe: result.banco.clabe_inter,
          serie: result.rutas.serie,
          folioSucursal: formData.folio,
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
          })),
          Base_iva: result.venta.subtotal,
          // impuesto_iva: result.salidas.importe,
          importe_iva: result.venta.iva,
          correo: result.cliente.correo,
          cp: result.empresa.cp,
          regimenFiscal: result.empresa.regimenfiscal,
          metodoPago: result.venta.formapago,
          importe_iva_concepto: result.salidas.iva_importe,
          refpago: result.venta.refpago,
          cfdi: result.cliente.cfdi || '',
          usoCFDI: validaCFDI,
          usoCfdi: validaCFDI,
          cliente: result.cliente.empresa,
          codigoCDFI: 'G01' || '00',
          correo_sucursal: result.rutas.email_envio_facturcion
        });
        setSalidas(result.salidas);
        setVenta(result.venta);
        Swal.fire('Éxito', 'El folio es válido', 'success');
      } else {
        Swal.fire({
          title: 'WARNING',
          text: result.error || 'El folio no es válido',
          icon: 'warning',
          iconColor: '#4782f6', 
          confirmButtonColor: '#007bff', 
        });
      }
    } catch (error) {
      Swal.fire({
        title: 'UPPPS!!',
        text: error.message || 'Error al conectar con el servidor',
        icon: 'WARNING',
        iconColor: '#4782f6', 
        confirmButtonColor: '#007bff', 
      });
    } finally {
      setIsLoading(false); // Detener el loader
    }
  };
  

  const handleGenerateFactura = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post('https://www.binteapi.com:8085/src/cfdi40.php', formData);
      
      if (response.status === 200) {
        Swal.fire('Factura Generada', 'La factura se ha generado correctamente', 'success')
          .then(async (result) => {
            if (result.isConfirmed) {
              // Extraer los paths para el PDF, XML y UUID de la respuesta
              const { path_pdf, path_xml, UUID } = response.data;
  
              const baseUrl = 'https://sgp-web.nyc3.cdn.digitaloceanspaces.com/sgp-web/pruebas/ern-melaminas/';
              const pdfUrl = `${baseUrl}${path_pdf}`;
              const xmlUrl = `${baseUrl}${path_xml}`;
  
              setPdf(pdfUrl);
              setXml(xmlUrl);
              openFileInNewTab(pdfUrl);
              downloadFile(xmlUrl, 'factura.xml');
              setIsInvoiceGenerated(true);
  
              try {
                const sucursal = encodeURIComponent(formData.sucursal.trim());
                const folioTicket = encodeURIComponent(formData.folioSucursal.trim());
                const saveFacturaUrl = `https://binteapi.com:8095/api/factura/${sucursal}/${folioTicket}/`;
                
                const saveResponse = await axios.put(saveFacturaUrl, {
                  path_pdf: `ern-melaminas/${path_pdf}`,
                  path_xml: `ern-melaminas/${path_xml}`,
                  UUID
                });
                
                if (saveResponse.status === 200 && saveResponse.data?.id) {
                  Swal.fire('Factura Guardada', 'La factura ha sido guardada en la base de datos correctamente', 'success');
                } else {
                  Swal.fire({
                    title: 'UPPPS!!',
                    text: result.message || 'Error al guardar la factura en la base de datos',
                    icon: 'WARNING',
                    iconColor: '#4782f6', 
                    confirmButtonColor: '#007bff', 
                  });
                }
              } catch (saveError) {
                const saveErrorMessage = saveError.response?.data?.error || 'Error al guardar la factura en la base de datos';
                console.error('Error al guardar la factura:', saveErrorMessage);
                Swal.fire({
                  title: 'UPPPS!!',
                  text: saveErrorMessage,
                  icon: 'WARNING',
                  iconColor: '#4782f6', 
                  confirmButtonColor: '#007bff', 
                });
              }
            }
          });
      } else {
        Swal.fire('Error', 'Hubo un problema al generar la factura', 'error');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al generar la factura';
      console.error('Error en la generación de factura:', errorMessage);
      Swal.fire({
        title: 'UPPPS!!',
        text: errorMessage,
        icon: 'WARNING',
        iconColor: '#4782f6', 
        confirmButtonColor: '#007bff', 
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Función para abrir archivos en una nueva pestaña
  const openFileInNewTab = (url) => {
    const newWindow = window.open(url, '_blank');
    if (newWindow) {
      newWindow.focus(); // Asegurarse de que la nueva pestaña tenga el foco
    } else {
      Swal.fire({
        title: 'UPPPS!!',
        text: 'No se pudo abrir el archivo en una nueva pestaña',
        icon: 'WARNING',
        iconColor: '#4782f6', 
        confirmButtonColor: '#007bff', 
      });
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
        to_email: formData.correo, // correo del cliente
        to_name: formData.razonSocial, // razón social del cliente
        number_template: 4178982,
        from_email: formData.correo, // correo de la sucursal
        from_name: "Factura",
        vars_submit: {
          logo: formData.rutaLogotipo, // ruta del logotipo de la sucursal
          Cliente: formData.cliente, // razón social del cliente
          Emisor: formData.razonSocial_emisor, // razón social de la sucursal
          Serie: "F", // serie de la factura
          Folio:  formData.folio, // folio de la factura
          correo: formData.correo, // correo de la sucursal
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

      // Configurar el encabezado con el access_token
      const config = {
        headers: {
          Authorization: `Bearer iIxMDUxOjM5MSIsInZlciI6IjIuMCIs`, // Access token
        },
      };
  
      // Enviar los datos a la API
      const emailResponse = await axios.post(
        'https://developer.binteapi.com:8083/submit-email',
        emailData,
        config
      );
  
      if (emailResponse.status === 200) {
        Swal.fire('Correo Enviado', 'La factura ha sido enviada correctamente', 'success');
      } else {
        const errorMessage = response.response.Messages[0].Errors[0].ErrorMessage.replace(/\"\" /, '');
        Swal.fire({
          title: 'UPPPS!!',
          text: errorMessage, // Mensaje sin las comillas
          icon: 'warning',
          iconColor: '#4782f6',
          confirmButtonColor: '#007bff'
        });
      }
    } catch (error) {
      // const errorMessage = error.response?.data?.message || 'Error al enviar el correo';
      const errorMessage = response.response.Messages[0].Errors[0].ErrorMessage.replace(/\"\" /, '');
      Swal.fire({
        title: 'UPPPS!!',
        text: errorMessage, // Mensaje sin las comillas
        icon: 'warning',
        iconColor: '#4782f6',
        confirmButtonColor: '#007bff'
      });
    } finally {
      setIsLoading(false);
    }
  };

  

  return (
    <form onSubmit={handleSubmit}>
      {/* Mostrar el loader */}
      {isLoading && <div className=" flex justify-center items-center"><Loader /></div>}

      {/* Validación de Folio */}
      <div className="md:grid md:grid-cols-3 gap-4 mb-1">
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
        {/* Seleccionar Folio */}
        <div className='flex gap-2 w-full'>
          <div className='w-full'>
            <label className="block text-sm font-medium text-gray-700">Ingresa folio de ticket:</label>
            <input
              type="text"
              name="folio"
              onChange={handleChange}
              className="bg-gray-300 mt-1 block w-full border border-gray-300 rounded-md p-1"
            />
          </div>
          {/* Círculo de ayuda */}
          <div className="relative flex items-center justify-center mt-4">
            {/* Tooltip */}
            <div className="absolute bg-gray-700 text-white text-xs rounded px-2 py-1 -mt-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              Encuentra el Folio
            </div>
            {/* Icono para abrir el modal */}
            <button
              type="button"
              onClick={() => handleIconClick('/factura-ERN/assets/img/Informacio_image.jpeg')}
              className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center hover:bg-blue-400 focus:outline-none group"
            >
              <span className="text-white text-xl">?</span>
            </button>
          </div>
        </div>
        <div className="md:mt-0 mt-3 flex justify-center items-center text-sm font-medium">
          <button
            type="submit"
            className="text-white bg-[#365326] shadow-lg p-2 pl-5 pr-5 rounded-3xl text-[12px] uppercase hover:bg-[#3e662a]"
            disabled={isLoading}
          >
            {isLoading ? 'Cargando...' : 'Validar'}
          </button>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50" onClick={closeModal}>
          <div className="bg-white p-4 rounded-md relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={closeModal} className="absolute top-[-12px] right-[-12px] text-white bg-red-600 hover:bg-red-700 rounded-full px-3 py-2">
              X
            </button>
            <img src={imageSrc} alt="Modal" className="w-full" />
          </div>
        </div>
      )}

      {/* Mostrar los otros campos solo si la validación fue exitosa */}
      <div>
        {!isInvoiceGenerated && isValidated && (
          <div>
            <div className="w-full md:col-span-3">
              <label className="block text-sm font-medium text-gray-700">Razón Social:</label>
              <input
                type="text"
                name="razonSocial"
                value={formData.razonSocial}
                onChange={handleChange}
                className="bg-gray-300 mt-1 block w-full border border-gray-300 rounded-md p-1"
              />
            </div>
          
            <div className="parent grid grid-cols-1 md:grid-cols-7 gap-x-1 gap-y-0">
              <div className="w-full md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">RFC:</label>
                <input
                  type="text"
                  name="rfc_receptor"
                  value={formData.rfc_receptor}
                  onChange={handleChange}
                  className="bg-gray-300 mt-1 block w-full border border-gray-300 rounded-md p-1"
                />
              </div>
              
              <div className="w-full md:col-start-3 md:col-end-4">
                <label className="block text-sm font-medium text-gray-700">R. Fiscal:</label>
                <input
                  type="number"
                  name="regimenFiscal"
                  value={formData.regimenFiscal}
                  onChange={handleChange}
                  className="bg-gray-300 mt-1 block w-full border border-gray-300 rounded-md p-1"
                />
              </div>

              <div className="w-full md:col-start-4 md:col-end-5">
                <label className="block text-sm font-medium text-gray-700">C.P.:</label>
                <input
                  type="number"
                  name="cp"
                  value={formData.cp}
                  onChange={handleChange}
                  className="bg-gray-300 mt-1 block w-full border border-gray-300 rounded-md p-1"
                />
              </div>

              <div className="w-full md:col-start-5 md:col-end-6">
                <label className="block text-sm font-medium text-gray-700">Código CFDI:</label>
                <input
                  type="text"
                  name="cfdiCode"
                  value={formData.codigoCDFI || ''} // Se actualiza automáticamente con el código CFDI seleccionado
                  readOnly
                  className="bg-gray-300 mt-1 block w-full border border-gray-300 rounded-md p-1"
                />
              </div>

              <div className="w-full md:col-span-2 md:col-start-6">
                <label className="block text-sm font-medium text-gray-700">Selecciona el CFDI:</label>
                <select
                  name="cfdi"
                  value={formData.cfdi}
                  onChange={handleCfdiChange}
                  className="bg-gray-300 mt-1 block w-full border border-gray-300 rounded-md p-1"
                >
                  <option value="">Seleccionar...</option>
                  {arregloCDFI.map((item) => (
                    <option key={item.codigoCDFI} value={item.cfdi}>
                      {item.cfdi}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          
            <div className="parent grid grid-cols-1 md:grid-cols-7 gap-x-1 gap-y-0">
              <div className="w-full md:col-span-1 hidden md:block">
                <label className="block text-sm font-medium text-gray-700 mt-7"></label>
                <input
                  type="text"
                  name="metodoPago"
                  defaultValue={formData.refpago}
                  className="campo_sin_editar"
                  readOnly
                />
              </div>
              <div className="w-full md:col-start-2 md:col-end-5">
                <label className="text-sm font-medium text-gray-700">Método de Pago:</label>
                <input
                  name="metodoPagoDescripcion"
                  defaultValue={formData.metodoPagoDescripcion}
                  className="campo_sin_editar"
                  readOnly
                />
              </div>
              <div className="w-full md:col-start-5 md:col-end-6  hidden md:block">
                <label className="block text-sm font-medium text-gray-700 mt-1">Pago:</label>
                <input
                  defaultValue={formData.metodoPago2}
                  type="text"
                  className="campo_sin_editar"
                  readOnly
                />
              </div>
              <div className="w-full md:col-start-6 md:col-span-2 mt-6">
                <label className="text-sm font-medium text-gray-700"></label>
                <input
                  defaultValue={formData.metodoPagoDescripcion2}
                  type="text"
                  className="campo_sin_editar"
                  readOnly
                />
              </div>
            </div>
          
            <div className="grid w-full col-span-6 gap-4 mb-2">
              <div className="w-full md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Correo:</label>
                <input
                  type="text"
                  name="correo"
                  value={formData.correo}
                  onChange={handleChange}
                  className="bg-gray-300 mt-1 block w-full border border-gray-300 rounded-md p-1"
                />
              </div>
            </div>

            {/* Tabla */}
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
          </div>
        )}
        <div>
          {isInvoiceGenerated && (
            <>
              <div className='flex justify-center items-center p-10'>
                <h2 className='text-2xl uppercase text-[#3e662a] font-bold'>La factura fué generada Exitosamente</h2>
              </div>
              <div>
                <button 
                  className="w-full bg-[#365326] text-white px-4 py-2 mt-4 hover:bg-[#3e662a] rounded-3xl uppercase"
                  type="button"
                  onClick={handleSendInvoiceEmail}
                  disabled={isLoading}
                >
                  {isLoading ? 'Enviando...' : 'Enviar por Correo'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </form>
  );
};


import React, { useState, useEffect, useCallback } from 'react';
import { ItemsTable } from './ItemsTable';
import { Summary } from './Summary';
import axios from 'axios';
import { Loader } from './Loader';
import { UsoCFDI } from './UsoCFDI';
import Swal from 'sweetalert2';

const arregloCDFI = [
  { codigoCFDI: 'G01', cfdi: 'ADQUISICIÓN DE MERCANCIAS' },
  { codigoCFDI: 'G03', cfdi: 'GASTOS EN GENERAL' },
  { codigoCFDI: 'I01', cfdi: 'CONSTRUCCIONES' },
  { codigoCFDI: 'I02', cfdi: 'MOBILIARIO Y EQUIPO DE OFICINA POR INVERSIONES' },
  { codigoCFDI: 'I03', cfdi: 'EQUIPO DE TRANSPORTE' },
  { codigoCFDI: 'I04', cfdi: 'EQUIPO DE COMPUTO Y ACCESORIOS' },
  { codigoCFDI: 'I05', cfdi: 'DADOS, TOQUELES, MOLDES, MATRICES Y HERRAMENTAL' },
  { codigoCFDI: 'I08', cfdi: 'OTRA MAQUINARIA Y EQUIPO' },
];

export const InvoiceForm = () => {

  const initialState = {
    sucursal: '',
    folioSucursalFinal: '',
    folio: '',
    folioSucursal: '',
    correo: '',
    razonSocial: '',
    rfc: '',
    regimenFiscal: '',
    cp: '',
    metodoPago: '', 
    metodoPago2: 'PUE', 
    metodoPagoDescripcion: '',
    metodoPagoDescripcion2: 'PAGO EN UNA SOLA EXHIBICIÓN',
    Produccion: "NO",
    type: "tasa16",
    id_invoice: "", 
    rutaCSD: "", 
    rutaKEY: "", 
    password: '',
    rutaXML: "",
    rutaPDF: "",
    rutaLogotipo: "",
    is_return_paths: true,
    serie: "",
    metodo_pago: "PUE",
    forma_pago: "03",
    tipo_comprobante: "I",  
    moneda: "MXN",
    tipo_cambio: "1",
    fecha_expedicion: "",  
    lugar_expedicion: "",
    subtotal: "",
    total: "",
    exportacion: "01",
    rfc_emisor: "",
    razonSocial_emisor: "", 
    regimenFiscal_emisor: "",
    address_emisor: "Calle Ejemplo, 123567",
    rfc_receptor: "",
    razonSocial_receptor: "",
    codigoCFDI: '',
    cfdi: '',
    cfdiCode: '',
    cfdiDescription: '',
    usoCFDI: '',
    usoCfdi: '',
    domicilioFiscal_receptor: "",
    address_receptor: "",
    regimenFiscal_receptor: "",
    bank: "",
    num_acount: "",
    clabe: "",
    conceptos: [
      {
        clave_sat: "",
        clave_prod: "",
        cantidad: "",
        unidad_sat: "",
        descripcion: "",
        valor_unitario: "",
        importe: "",
        base: "",
        importe_iva_concepto: '',
        Importe: '',
        objeto_imp: "02",
        impuesto: "002",
        tasaOcuota: "0.160000",
        tipoFactor: "Tasa",
      },
    ],
    newConcepts: [],
    Base_iva: "",
    impuesto_iva: "002",
    impuesto_ieps: "001",
    importe_iva: "",
    importe_ieps: "0.00",
    tasaOcuota_iva: "0.160000",
    tipoFactor_iva: "Tasa",
    days: 0,
    date: null,
    reference: "",
    refpago: "",
    cliente: '',
    correo_cliente: '',
    correo_sucursal: '',
  };

  const [formData, setFormData] = useState(initialState);
  const [isValidated, setIsValidated] = useState(false);
  const [sucursales, setSucursales] = useState([]);
  const [salidas, setSalidas] = useState([]);
  const [venta, setVenta] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInvoiceGenerated, setIsInvoiceGenerated] = useState(false);
  const [isInvoiceGeneratedAndSended, setIsInvoiceGeneratedAndSended] = useState(false);
  const [pdfUrl, setPdf] = useState(false);
  const [xmlUrl, setXml] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState('');
  const [codigoCFDI, setCodigoCFDI] = useState('');
  const [errors, setErrors] = useState({});
  const [cfdi, setCfdi] = useState('');


  // Va por las sucursales segun la url 
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
        // const requestUrl = `https://binteapi.com:8095/api/sucursales/melpromelaminas.com`;
  
        const response = await axios.get(requestUrl);
        setSucursales(response.data);
      } catch (error) {
        console.error('Error al cargar las sucursales:', error);
      } finally {
        setIsLoading(false);
      }
    };
  
    obtenerSucursales();
  }, []);

  // Validaciones
  const validateFields = (formData) => {
    if (!formData.sucursal || !formData.folioSucursalFinal) {
      Swal.fire({
        title: 'WARNING',
        text: 'Por favor, selecciona una sucursal e ingresa un folio',
        icon: 'warning',
        iconColor: '#4782f6', 
        confirmButtonColor: '#007bff',
      });
      return false;
    }
  
    if (!formData.correo || !formData.correo.trim()) {
      Swal.fire({
        title: 'Correo obligatorio',
        text: 'Por favor, ingresa un correo electrónico válido.',
        icon: 'error',
        confirmButtonText: 'Aceptar',
      });
      return false;
    }
  
    if (!formData.codigoCFDI || !formData.usoCFDI || !formData.cfdi) {
      Swal.fire({
        title: 'Campos CFDI obligatorios',
        text: 'Por favor, asegúrate de completar todos los campos relacionados con el CFDI.',
        icon: 'error',
        confirmButtonText: 'Aceptar',
      });
      return false;
    }
  
    if (!formData.cp || formData.cp.toString().length !== 5 || isNaN(formData.cp)) {
      Swal.fire({
        title: 'C.P. inválido',
        text: 'Por favor, ingresa un Código Postal válido de 5 dígitos.',
        icon: 'error',
        confirmButtonText: 'Aceptar',
      });
      return false;
    }
  
    if (!formData.razonSocial || formData.razonSocial.trim().length < 3) {
      Swal.fire({
        title: 'Razón Social inválida',
        text: 'Por favor, ingresa una Razón Social válida de al menos 3 caracteres.',
        icon: 'error',
        confirmButtonText: 'Aceptar',
      });
      return false;
    }
  
    return true;
  };

  const initializeCfdi = (clienteCfdi, setFormData) => {
    const arregloCDFI = [
      { codigoCFDI: 'G01', cfdi: 'ADQUISICIÓN DE MERCANCIAS' },
      { codigoCFDI: 'G03', cfdi: 'GASTOS EN GENERAL' },
      { codigoCFDI: 'I01', cfdi: 'CONSTRUCCIONES' },
      { codigoCFDI: 'I02', cfdi: 'MOBILIARIO Y EQUIPO DE OFICINA POR INVERSIONES' },
      { codigoCFDI: 'I03', cfdi: 'EQUIPO DE TRANSPORTE' },
      { codigoCFDI: 'I04', cfdi: 'EQUIPO DE COMPUTO Y ACCESORIOS' },
      { codigoCFDI: 'I05', cfdi: 'DADOS, TOQUELES, MOLDES, MATRICES Y HERRAMENTAL' },
      { codigoCFDI: 'I08', cfdi: 'OTRA MAQUINARIA Y EQUIPO' },
    ];
  
    const selectedItem =
      arregloCDFI.find((item) => item.cfdi === clienteCfdi) || {
        codigoCFDI: '00',
        cfdi: '',
      };
  
    if (selectedItem) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        codigoCFDI: selectedItem.codigoCFDI,
        usoCFDI: selectedItem.codigoCFDI,
        usoCfdi: selectedItem.codigoCFDI,
        cfdi: selectedItem.cfdi,
      }));
    } else {
  
      setFormData((prevFormData) => ({
        ...prevFormData,
        cfdi: '',
        codigoCFDI: '00',
        usoCFDI: '00',
        usoCfdi: '00',
      }));
    }
  };
  // 22012512103882

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.folioSucursalFinal) {
      localStorage.removeItem('formData'); // Limpiar el localStorage
      setFormData(initialState); // Limpiar el state
      setIsValidated(false); // Deshabilitar la validación
      return;
    }

    setIsLoading(true);
    const url = `https://binteapi.com:8095/api/ventas/${formData.sucursal}/${formData.folioSucursalFinal}/`;
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      const result = await response.json();

      if (response.ok) {
        const validaCFDI = arregloCDFI.find(
          (item) => item.cfdi === result.cliente.cfdi
        );

        // Verifica si 'rutas' existe en la respuesta antes de acceder a sus propiedades
        if (!result.rutas) {
          Swal.fire({
            title: 'Error',
            text: 'No se encontraron las rutas de la factura.',
            icon: 'error',
          });
          return;
        }

        setIsValidated(true);
        const updatedFormData = {
          ...initialState,
          ...formData,
          rutaPDF: `https://sgp-web.nyc3.digitaloceanspaces.com/sgp-web/${result.rutas.url_carpeta_facturacion}`,
          rutaXML: `https://sgp-web.nyc3.digitaloceanspaces.com/sgp-web/${result.rutas.url_carpeta_facturacion}`,
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
          regimenFiscal_receptor: result.cliente.regimenfiscal,
          rfc: result.cliente.rfc,
          razonSocial: result.cliente.empresa,
          domicilioFiscal_receptor: result.cliente.cp,
          address_receptor: result.cliente.domicilio,
          bank: result.banco.banco,
          num_acount: result.banco.no_cuenta,
          clabe: result.banco.clabe_inter,
          serie: result.rutas.serie,
          folioSucursal: formData.folioSucursalFinal,
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
            impuesto: '002',
            tasaOcuota: '0.160000',
            tipoFactor: 'Tasa',
          })),
          Base_iva: result.venta.subtotal,
          importe_iva: result.venta.iva,
          correo: result.cliente.correo,
          cp: result.cliente.cp,
          regimenFiscal: result.cliente.regimenfiscal,
          metodoPago: result.venta.formapago,
          importe_iva_concepto: result.salidas.iva_importe,
          refpago: result.venta.refpago,
          cfdi: result.cliente.cfdi,
          codigoCFDI: result.cliente.codigoCFDI ? validaCFDI.codigoCFDI : '',
          usoCFDI: validaCFDI ? validaCFDI.codigoCFDI : '',
          usoCfdi: validaCFDI ? validaCFDI.codigoCFDI : '',
          cfdiCode: validaCFDI ? validaCFDI.codigoCFDI : '',
          cliente: result.cliente.empresa,
          correo_sucursal: result.rutas.email_envio_facturcion,
          metodoPagoDescripcion: result.venta.formapago,
          url_carpeta_facturacion: result.rutas.url_carpeta_facturacion,
          factura: result.factura.factura,
        };

        setFormData(updatedFormData);
        localStorage.setItem('formData', JSON.stringify(updatedFormData));
        setSalidas(result.salidas);
        setVenta(result.venta);

        Swal.fire('Éxito', 'El folio es válido', 'success');
      } else {
        Swal.fire({
          title: 'WARNING',
          text: result.error || result.warning || 'El folio no es válido',
          icon: 'warning',
          iconColor: '#4782f6',
          confirmButtonColor: '#007bff',
        });
      }
    } catch (error) {
      console.error('Error al conectar con el servidor:', error);
      Swal.fire({
        title: 'UPPPS!!',
        text: error.message || 'Error al conectar con el servidor',
        icon: 'warning',
        iconColor: '#4782f6',
        confirmButtonColor: '#007bff',
      });
    } finally {
      setIsLoading(false);
    }
  };
  

  const handleCfdiChange = (event) => {
    event.preventDefault();
    
    const selectedCfdi = event.target.value;
    console.log("Valor seleccionado:", selectedCfdi);
    
    const selectedItem = arregloCDFI.find((item) => item.cfdi === selectedCfdi) || {
      codigoCFDI: '',
      cfdi: '',
    };
    
    console.log("Elemento seleccionado:", selectedItem); // Verifica si se encontró el item en el arreglo.
    
    // Actualizamos el estado de formData
    setFormData((prevFormData) => {
      const updatedFormData = {
        ...prevFormData, // Copia todos los valores existentes
        usoCFDI: selectedItem.codigoCFDI,
        usoCfdi: selectedItem.codigoCFDI,
        cfdi: selectedItem.codigoCFDI === '00' ? '' : selectedItem.cfdi,
        codigoCFDI: selectedItem.codigoCFDI, // Código CFDI
        cfdiCode: selectedItem.codigoCFDI, // Lo mismo para cfdiCode
      };
      
      // Guardamos el updatedFormData en el localStorage
      localStorage.setItem('formData', JSON.stringify(updatedFormData));
      
      console.log("FormData actualizado y almacenado en localStorage:", updatedFormData);
      
      return updatedFormData;
    });
  };
  

  const handleChange = (e) => {

    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  
  const handleGenerateFactura = async (
    e,
    formData, 
    setIsLoading, 
    setFormData, 
    setPdf, 
    setXml, 
    setIsInvoiceGenerated
  ) => {
    // Validación de los Campos
    if (!validateFields(formData)) {
      return; 
    }
  
    setIsLoading(true);
  
    let baseUrl = `https://sgp-web.nyc3.cdn.digitaloceanspaces.com/sgp-web/${formData.url_carpeta_facturacion}/${formData.factura}`;
  
    try {
      // Primero, generar la factura
      const response = await axios.post('https://www.binteapi.com:8085/src/cfdi40.php', formData); // Usar formData aquí
  
      if (response.status === 200) {
        Swal.fire('Factura Generada', 'La factura se ha generado correctamente', 'success')
          .then(async (result) => {
            if (result.isConfirmed) {
              // Extraer los paths para el PDF, XML y UUID de la respuesta
              const { path_pdf, path_xml, UUID } = response.data;
              const pdfUrl = `${baseUrl}/${path_pdf}.pdf`; // Asegúrate de concatenar correctamente la ruta
              const xmlUrl = `${baseUrl}/${path_xml}.xml`; // Asegúrate de concatenar correctamente la ruta
  
              // Actualizar el estado con las URLs
              setPdf(pdfUrl);
              setXml(xmlUrl);
  
              // Ahora que tenemos las rutas, procedemos a guardar la factura en la base de datos
              const sucursal = encodeURIComponent(formData.sucursal.trim());
              const folioTicket = encodeURIComponent(formData.folioSucursalFinal.trim());
              const saveFacturaUrl = `https://binteapi.com:8095/api/factura/${sucursal}/${folioTicket}/`;
  
              try {
                const saveResponse = await axios.put(saveFacturaUrl, {
                  path_pdf: `ern-melaminas/${path_pdf}`,
                  path_xml: `ern-melaminas/${path_xml}`,
                  UUID
                });
  
                if (saveResponse.status === 200 && saveResponse.data?.id) {
                  Swal.fire('Factura Guardada', 'La factura ha sido guardada en la base de datos correctamente', 'success');
                  setIsInvoiceGenerated(true); // Marcar factura como generada
                } else {
                  Swal.fire({
                    title: 'UPPPS!!',
                    text: saveResponse.data?.message || 'Error al guardar la factura en la base de datos',
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
  
  const handleSendInvoiceEmail = async (
    formData, 
    pdfUrl, 
    xmlUrl, 
    setIsLoading
  ) => {

    if (!isInvoiceGenerated) {
      Swal.fire('No hay factura generada', 'Primero debes generar la factura antes de enviarla por correo.');
      return;
    }
    
    setIsLoading(true);
  
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
  
    try {
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
          Folio: formData.folioSucursalFinal, // folio de la factura
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
        // ? Limpiar todo
        setIsInvoiceGeneratedAndSended(true);
        setIsInvoiceGenerated(false);
        setFormData(initialState);
      } else {
        const errorMessage = emailResponse.response.Messages[0].Errors[0].ErrorMessage.replace(/\"\" /, '');
        Swal.fire({
          title: 'UPPPS!!',
          text: errorMessage, // Mensaje sin las comillas
          icon: 'warning',
          iconColor: '#4782f6',
          confirmButtonColor: '#007bff'
        });
      }
      localStorage.removeItem('formData');
      console.log('localStorage limpiado');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al enviar el correo';
      Swal.fire({
        title: 'UPPPS!!',
        text: errorMessage,
        icon: 'warning',
        iconColor: '#4782f6',
        confirmButtonColor: '#007bff',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // useEffect(() => {
  //   // Imprimir el formData como cadena JSON cada vez que cambie
  //   console.log("formData actualizado:", JSON.stringify(formData, null, 2)); 
  //   // Guardamos el formData actualizado en el localStorage
  //   localStorage.setItem('formData', JSON.stringify(formData));
  // }, [formData]);
  
  // https://binteapi.com:8095/api/sucursales/http://localhost:5173/factura-ERN/


  useEffect(() => {
    setFormData(prevData => ({ ...prevData, folioSucursalFinal: '' }));
  }, []);

  useEffect(() => {
    // Limpiar el campo de folio cuando se genera la factura
    if (isInvoiceGeneratedAndSended) {
      console.log("Factura generada, limpiando el folio...");
      setFormData(prevData => ({ ...prevData, folioSucursalFinal: '', folio: '' }));
    }
  }, [isInvoiceGeneratedAndSended]);

  const handleIconClick = (src) => {
    setImageSrc(src);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  
  return (
    <form onSubmit={(e) => handleSubmit(e, formData, setIsLoading, setIsValidated, setFormData, setSalidas, setVenta, initializeCfdi)}>
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
              <option key={sucursal.id} value={sucursal.nombre_ciudad}>{sucursal.nombre_ciudad}</option>
            ))}
          </select>
        </div>
        {/* Seleccionar Folio */}
        <div className='flex gap-2 w-full'>
          <div className='w-full'>
            <label className="block text-sm font-medium text-gray-700">Ingresa folio de ticket:</label>
            <input
              type="text"
              name="folioSucursalFinal"
              value={formData.folioSucursalFinal} 
              onChange={handleChange}
              className="bg-gray-300 mt-1 block w-full border border-gray-300 rounded-md p-1"
            />
          </div>
          {/* Círculo de ayuda */}
          <div className="relative flex items-center justify-center mt-4">
            {/* Tooltip  */}
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
            
              {/* USO CFDI */}
              <div className="w-full md:col-start-5 md:col-end-6">
                <label className="block text-sm font-medium text-gray-700">Código CFDI:</label>
                <input
                  type="text"
                  name="usoCFDI"
                  value={formData.codigoCFDI || ''} // Fallback a una cadena vacía
                  readOnly
                  className="bg-gray-300 mt-1 block w-full border border-gray-300 rounded-md p-1"
                />
              </div>

              <div className="w-full md:col-span-2 md:col-start-6">
                <label className="block text-sm font-medium text-gray-700">Selecciona el CFDI:</label>
                <select
                  name="cfdi"
                  value={formData.cfdi || ''} // Fallback a una cadena vacía
                  onChange={handleCfdiChange}
                  className="bg-gray-300 mt-1 block w-full border border-gray-300 rounded-md p-1"
                >
                  <option value="">Seleccionar...</option>
                  {arregloCDFI.map((item) => (
                    <option key={item.codigoCFDI} value={item.cfdi}>
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
                  onBlur={() => {
                    // Guardar en localStorage solo cuando el usuario termine de escribir el correo
                    localStorage.setItem('formData', JSON.stringify(formData));
                  }}
                />
              </div>
            </div>


            {/* Tabla */}
            <ItemsTable salidas={salidas} />
            <Summary venta={venta}/>

            <button 
              className="w-full bg-[#365326] text-white px-4 py-2 mt-4 hover:bg-[#3e662a] rounded-3xl uppercase"
              type="button"
              onClick={() => handleGenerateFactura(
                formData, 
                setIsLoading, 
                setFormData, 
                setPdf, 
                setXml, 
                setIsInvoiceGenerated
              )}
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
                <h2 className='text-2xl uppercase text-[#3e662a] font-bold'>La factura fue generada Exitosamente</h2>
              </div>

              {/* Botón para Descargar PDF */}
              <div>
                <button
                    className="w-full bg-[#365326] text-white px-4 py-2 mt-4 hover:bg-[#3e662a] rounded-3xl uppercase"
                    onClick={() => {
                      console.log('Abriendo PDF:', pdfUrl); // Para depuración
                      window.open(pdfUrl, '_blank');
                    }}
                  >
                    Descargar Factura
                </button>
              </div>

              {/* Botón para Enviar por Correo */}
              <div>
                <button
                  className="w-full bg-[#365326] text-white px-4 py-2 mt-4 hover:bg-[#3e662a] rounded-3xl uppercase"
                  type="button"
                  onClick={() => handleSendInvoiceEmail(formData, pdfUrl, xmlUrl, setIsLoading)}
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


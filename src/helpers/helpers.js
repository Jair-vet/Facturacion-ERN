import Swal from 'sweetalert2';
import axios from 'axios';


export const initializeCfdi = (clienteCfdi, setFormData) => {
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
  
    // const selectedItem = arregloCDFI.find(item => item.cfdi === clienteCfdi);
    const selectedItem = arregloCDFI.find(item => item.cfdi === clienteCfdi) || { codigoCFDI: '00', cfdi: '',};
    // console.log('selectedItem:', selectedItem);
    
    if (selectedItem) {
      setFormData(prevFormData => ({
        ...prevFormData,
        codigoCFDI: selectedItem.codigoCFDI,
        usoCFDI: selectedItem.codigoCFDI,
        usoCfdi: selectedItem.codigoCFDI,
        cfdi: selectedItem.cfdi,
      }));
    } else {
      setFormData(prevFormData => ({
        ...prevFormData,
        cfdi: '',
        codigoCFDI: '00',
        usoCFDI: '00',
        usoCfdi: '00',
      }));
    }
};



export const handleSubmit = async ( e, formData, setIsLoading, setIsValidated, setFormData, setSalidas, setVenta,initializeCfdi
  ) => {
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
    e.preventDefault(); 
    setIsLoading(true); 
    
    // Validación inicial para verificar si los campos son válidos
    if (!formData.sucursal || !formData.folio) {
      Swal.fire({
        title: 'WARNING',
        text: 'Por favor, selecciona una sucursal e ingresa un folio',
        icon: 'warning',
        iconColor: '#4782f6', 
        confirmButtonColor: '#007bff',
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
  
      const result = await response.json();
      if (response.ok) {
        
        const validaCFDI = result.cliente.cfdi && arregloCDFI.includes(result.cliente.cfdi) ? result.cliente.cfdi : 'G01';
  
        // Validación de la respuesta y actualización del estado
        setIsValidated(true);
        setFormData({
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
            importe_iva: result.venta.iva,
            correo: result.cliente.correo,
            cp: result.cliente.cp,
            regimenFiscal: result.cliente.regimenfiscal,
            metodoPago: result.venta.formapago,
            importe_iva_concepto: result.salidas.iva_importe,
            refpago: result.venta.refpago,
            cfdi: result.cliente.cfdi,
            codigoCFDI: result.cliente.codigoCFDI || '', 
            usoCFDI: validaCFDI,
            usoCfdi: validaCFDI,
            cfdiCode: validaCFDI,
            cliente: result.cliente.empresa,
            correo_sucursal: result.rutas.email_envio_facturcion,
            metodoPagoDescripcion: result.venta.formapago,
            url_carpeta_facturacion: result.rutas.url_carpeta_facturacion,
            factura: result.factura.factura
        });

        // Guardar las salidas y la venta
        setSalidas(result.salidas);
        setVenta(result.venta);
        
        // Descargar el PDF y XML automáticamente
        if (result.rutas.url_carpeta_facturacion) {
          await downloadPDF(
            `https://sgp-web.nyc3.digitaloceanspaces.com/sgp-web/${result.rutas.url_carpeta_facturacion}.pdf`,
            `Factura_${formData.folio}.pdf`
          );
          await downloadPDF(
            `https://sgp-web.nyc3.digitaloceanspaces.com/sgp-web/${result.rutas.url_carpeta_facturacion}.xml`,
            `Factura_${formData.folio}.xml`
          );
        }

        // Mensaje de éxito
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
  
export const downloadPDF = async (fileUrl, fileName) => {
  try {
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error('No se pudo descargar el archivo. Verifica la URL.');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    Swal.fire({
      title: 'ERROR',
      text: error.message || 'Hubo un problema al descargar el archivo.',
      icon: 'error',
      iconColor: '#f27474',
      confirmButtonColor: '#007bff',
    });
  }
};



export const handleGenerateFactura = async (
  formData, 
  setIsLoading, 
  setFormData, 
  setPdf, 
  setXml, 
  setIsInvoiceGenerated,
  setFacturaGenerada,
) => {
  setIsLoading(true);


  // Validar que el correo sea obligatorio
  if (!formData.correo || !formData.correo.trim()) {
    Swal.fire({
      icon: 'error',
      title: 'Correo obligatorio',
      text: 'Por favor, ingresa un correo electrónico válido.',
      confirmButtonText: 'Aceptar',
      timer: 3000,
    });
    setIsLoading(false);
    return;
  }

  if (!formData.sucursal || !formData.folio) {
    Swal.fire({
      title: 'WARNING',
      text: 'Por favor, selecciona una sucursal e ingresa un folio',
      icon: 'warning',
      iconColor: '#4782f6',
      confirmButtonColor: '#007bff',
    });
    setIsLoading(false);
    return;
  }
  
  let baseUrl = `https://sgp-web.nyc3.cdn.digitaloceanspaces.com/sgp-web/${formData.url_carpeta_facturacion}/${formData.factura}`
  try {
    const response = await axios.post('https://www.binteapi.com:8085/src/cfdi40.php', formData);
    
    if (response.status === 200) {
      Swal.fire('Factura Generada', 'La factura se ha generado correctamente', 'success')
        .then(async (result) => {
          if (result.isConfirmed) {
            // Extraer los paths para el PDF, XML y UUID de la respuesta
            const { path_pdf, path_xml, UUID } = response.data;
            // const baseUrl = 'https://sgp-web.nyc3.cdn.digitaloceanspaces.com/sgp-web/';
            const pdfUrl = `${baseUrl}.pdf`;
            const xmlUrl = `${baseUrl}.xml`;
            
            setPdf(pdfUrl);
            setXml(xmlUrl);

            // openFileInNewTab(pdfUrl);
            downloadFile(pdfUrl, 'factura.pdf');
            downloadFile(xmlUrl, 'factura.xml');
            setFacturaGenerada(result.facturaUrl);
            console.log(result);
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

const downloadFile = (url, filename) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const handleSendInvoiceEmail = async (
    formData, 
    pdfUrl, 
    xmlUrl, 
    setIsLoading
  ) => {
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
          Folio: formData.folio, // folio de la factura
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
        const errorMessage = emailResponse.response.Messages[0].Errors[0].ErrorMessage.replace(/\"\" /, '');
        Swal.fire({
          title: 'UPPPS!!',
          text: errorMessage, // Mensaje sin las comillas
          icon: 'warning',
          iconColor: '#4782f6',
          confirmButtonColor: '#007bff'
        });
      }
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
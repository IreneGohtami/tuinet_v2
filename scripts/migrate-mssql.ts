
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import mssql from 'mssql'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY!

const mssqlConfig: mssql.config = {
  user: process.env.MSSQL_USER,
  password: process.env.MSSQL_PASSWORD,
  database: process.env.MSSQL_DATABASE || 'PolarTur_Net_TuiNet',
  server: process.env.MSSQL_HOST || 'localhost',
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  options: {
    encrypt: true, // for azure
    trustServerCertificate: true // change to false for production
  }
}

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Configuration
const BATCH_SIZE = 500

const TITLE_MAPPING: Record<string, string | null> = {
  "2138": "Mr",
  "2139": "Mrs",
  "2267": "Miss",
  "3625": "Ms",
  "4905": null,
  "4945": "Mstr"
}

const PASSENGER_TYPE_MAPPING: Record<string, string> = {
  "2146": "Infant",
  "2147": "Child",
  "2148": "Adult"
}

const DOCUMENT_TYPE_MAPPING: Record<string, string> = {
  "2140": "DNI",
  "2141": "Passport",
  "2262": "Other",
  "4928": "NIE"
}

const ADMIN_STATUS_MAPPING: Record<string, string> = {
  "4858": "NOT_INVOICED",
  "4859": "INVOICED",
  "4860": "TRANSFERRED_TO_SAP",
  "4861": "TRANSFERRED_TO_SAP_EXPENSES",
  "4862": "INVOICED_WITH_EXPENSES"
}

const DOCUMENTATION_STATUS_MAPPING: Record<string, string> = {
  "2035": "NOT_GENERATED",
  "2036": "NO_STATUS",
  "2037": "GENERATED_SENT",
  "2538": "GENERATED_NOT_SENT",
  "2539": "GENERATED_SERVICE_MODIFIED"
}

const PROFORMA_STATUS_MAPPING: Record<string, string> = {
  "2032": "PRINTED",
  "2033": "NOT_PRINTED",
  "2034": "MODIFIED",
  "4645": "NOT_PRINTED"
}

const NET_COMMISSIONABLE_MAPPING: Record<string, string> = {
  "8": "Net",
  "9": "Commissionable"
}

const TRANSACTION_TYPE_MAPPING: Record<string, string> = {
  "2480": "NORMAL",
  "2481": "TICKET_ISSUANCE",
  "2482": "CANCELLATION_FEES",
  "2483": "NORMAL",
  "2556": "RESERVATION",
  //"4711": "VOUCHER",
  "4715": "REFUND"
}

const PAYMENT_STATUS_MAPPING: Record<string, string> = {
  "2484": "NOT_PROCESSED",
  "2485": "REQUESTED",
  "2486": "MODIFIED",
  "2487": "COMPLETED",
  "2557": "NOT_REQUESTED"
}

const PAYMENT_METHOD_MAPPING: Record<string, string> = {
  "4798": "CREDIT_CARD",
  "4969": "CREDIT_CARD",
  "4805": "VOUCHER",
  "4810": "BANK_TRANSFER",
  "4968": "BANK_TRANSFER",
  "4817": "LETTER_OF_CREDIT",
  "5001": "LOYALTY_QR"
}

const TRANSFER_TYPE_MAPPING: Record<string, string> = {
  "2277": "ARRIVAL",
  "2288": "DEPARTURE"
}

// Mappings from legacy Spanish MSSQL headers to current database schema
const MAPPINGS: Record<string, Record<string, string>> = {
  bookings: {
    ReservaId: 'id',
    ExternalBookingTransaction: 'booking_reference',
    FechaAlta: 'created_at',
    FechaLimiteEmision: 'issued_date',
    FechaPrimerServicio: 'first_service_date',
    FechaVencimiento: 'last_service_date',

    // Sales Channel & Statuses
    IdOficina: 'office_id',
    IdOficinaAgente: 'agent_office_id',
    IdAtributoCanalVenta: 'sales_channel_id',
    CanalVentaValor: 'sales_channel_value',
    IdFolleto: 'brochure_id',
    IdAtributoEstadoReserva: 'status_id',
    IdAtributoEstadoReservaAdministracion: 'admin_status',
    IdAtributoEstadoDocumentacion: 'documentation_status',
    IdAtributoProforma: 'proforma_status',

    // Cost & Pricing
    IdDivisa: 'currency_id',
    ImporteTotal: 'total_amount',
    ImporteTotalCliente: 'customer_total_amount',
    ImporteBruto: 'gross_amount',
    ImporteNeto: 'net_amount',
    Coste: 'cost',
    ImporteMargen: 'margin_amount',
    PorcentajeVenta: 'sale_percentage',
    ImporteComisionable: 'commissionable_amount',
    PorcentajeIVAComision: 'commission_vat_percentage',
    IVAComision: 'commission_vat_amount',
    IdTipoDivisaLiquidacion: 'settlement_currency_id',
    TasaDivisaLiquidacion: 'settlement_currency_exchange_rate',
    InvTaxCurrency: 'invoice_tax_currency',
    InvTaxCurrencyRate: 'invoice_tax_currency_rate',
    CosteContabilidadSistema: 'system_accounting_cost',

    // Others
    Localizador: 'locator',
    RegionCode: 'region_code',
    CountryCode: 'country_code',
    LanguageCode: 'language_code',
    NoRecalcular: 'no_recalculate',
    ExcluirSeguroObligatorio: 'exclude_mandatory_insurance'
  },
  booking_flights: {
    //ReservaTransporteId: 'id',
    IdReserva: 'booking_id',
    FechaLimiteEmision: 'issued_date',

    // Flight info
    IdContratoAereoInventario: 'airline_contract_id',
    IdTipoServicioAereo: 'air_service_id',
    IdTipoServicio: 'service_type_id', // Which is which - IdTipoServicioAereo?
    IdAtributoEstadoReservaItem: 'item_status_id',
    IdDestino: 'destination_id',

    // Costs
    PVPporPAX: 'pvp_per_pax',
    CostePorPAX: 'cost_per_pax',
    PrecioConTasas: 'price_with_taxes',
    IdDivisaCoste: 'cost_currency_id',
    CambioCoste: 'cost_currency_exchange_rate',
    IdTipoDivisaLiquidacion: 'settlement_currency_id',
    TasaDivisaLiquidacion: 'settlement_currency_exchange_rate',
    IdAtributoCosteComisionable: 'net_commissionable',

    // Additional info
    CombinedSupplierId: 'supplier_id',
    TextoConfirmacionCupo: 'cabin_class',
    CombinedLocator: 'pnr_code',
    TerminalSalida: 'departure_terminal',
    TerminalLlegada: 'arrival_terminal',
    NumeroAdultos: 'adult_count',
    NumeroNinos: 'child_count',
    NumerosBebes: 'infant_count',
    EquipajeAdulto: 'adult_baggage',
    EquipajeNino: 'child_baggage',
    EquipajeBebe: 'infant_baggage',
    Descripcion: 'description',
    ListaEspera: 'is_waitlisted'
  },
  booking_hotels: {
    //ReservaAlojamientoId: 'id',
    IdReserva: 'booking_id',

    IdContratoAlojamiento: 'hotel_contract_id',
    IdAcomodacionCaracteristica: 'hotel_feature_id',
    IdRegimen: 'board_basis_id',
    IdAtributoEstadoReservaItem: 'item_status_id',
    NumeroAdultos: 'adult_count',
    NumeroNinos: 'child_count',
    NumeroBebes: 'infant_count',
    NumeroHabitaciones: 'room_count',
    IdDestino: 'destination_id',
    CombinedSupplierId: 'supplier_id',

    // Dates
    FechaAlta: 'created_at',
    FechaEntrada: 'check_in_date',
    FechaSalida: 'check_out_date',

    // Numeric
    PVPporPAX: 'pvp_per_pax',
    CostePorPAX: 'cost_per_pax',
    IdDivisaCoste: 'cost_currency_id',
    CambioCoste: 'cost_currency_exchange_rate',
    IdTipoDivisaLiquidacion: 'settlement_currency_id',
    TasaDivisaLiquidacion: 'settlement_currency_exchange_rate',
    IdAtributoCosteComisionable: 'net_commissionable',

    // Variable-length Strings
    Source: 'source',
    TextoConfirmacionCupo: 'confirmation_ref',
    LocalizadorProveedor: 'supplier_locator',
    LocalizadorAdicional: 'additional_locator',
    Descripcion: 'description',
    enBono: 'in_voucher'
  },
  booking_tours: {
    //ReservaTicketId: 'id',
    IdReserva: 'booking_id',
    Fecha: 'tour_date',
    NumeroAdultos: 'adult_count',
    NumeroNinos: 'child_count',
    NumeroBebes: 'infant_count',
    PVPporPAX: 'pvp_per_pax',
    Descripcion: 'description'
  },
  booking_transfers: {
    //ReservaTransferId: 'id',
    IdReserva: 'booking_id',
    IdAtributoEstadoReservaItem: 'item_status_id',

    Fecha: 'transfer_date',
    HoraLlegada: 'arrival_time',
    HoraRecogidaDesde: 'pickup_from',
    HoraRecogidaHasta: 'pickup_until',
    LugarRecogida: 'pickup_location',
    DetalleRecogida: 'pickup_location_detail',
    HoraRetornoDesde: 'return_from',
    HoraRetornoHasta: 'return_until',
    LugarRetorno: 'return_location',

    NumeroVehiculos: 'vehicle_count',
    NumeroAdultos: 'adult_count',
    NumeroNinos: 'child_count',
    NumeroBebes: 'infant_count',
    CombinedSupplierId: 'supplier_id',
    IdAtributoTipoReservaTransfer: 'transfer_type',
    IdDestino: 'destination_id',

    PVPporPAX: 'pvp_per_pax',
    CostePorPAX: 'cost_per_pax',
    IdDivisaCoste: 'cost_currency_id',
    CambioCoste: 'cost_currency_exchange_rate',
    IdTipoDivisaLiquidacion: 'settlement_currency_id',
    TasaDivisaLiquidacion: 'settlement_currency_exchange_rate',

    TextoConfirmacionCupo: 'confirmation_ref',
    LocalizadorProveedor: 'supplier_locator',
    LocalizadorMayorista: 'wholesaler_locator',
    Descripcion: 'description',
    Token: 'token',
    ServiciosIncluidos: 'included_services',
    ModeloCoche: 'car_model',
    Equipaje: 'max_luggage',
    IdAtributoCosteComisionable: 'net_commissionable',
    enBono: 'in_voucher'
  },
  booking_other_services: {
    //ReservaServicioId: 'id',
    IdReserva: 'booking_id',
    IdAtributoEstadoReservaItem: 'item_status_id',
    Fecha: 'service_date',

    CombinedSupplierId: 'supplier_id',
    IdDestino: 'destination_id',
    NumeroAdultos: 'adult_count',
    NumeroNinos: 'child_count',
    NumeroBebes: 'infant_count',

    PVPporPAX: 'pvp_per_pax',
    CostePorPAX: 'cost_per_pax',
    IdDivisaCoste: 'cost_currency_id',
    CambioCoste: 'cost_currency_exchange_rate',
    IdTipoDivisaLiquidacion: 'settlement_currency_id',
    TasaDivisaLiquidacion: 'settlement_currency_exchange_rate',

    TextoConfirmacionCupo: 'confirmation_ref',
    LocalizadorProveedor: 'supplier_locator',
    Descripcion: 'description',
    IdAtributoCosteComisionable: 'net_commissionable',
    enBono: 'in_voucher',
    FechaAlta: 'created_at'
  },
  booking_invoices: {
    FacturaClienteFinalId: 'id',
    FinalBookingId: 'booking_id',
    NumeroFactura: 'invoice_number',
    Fecha: 'invoice_date',
    TotalBaseImponible: 'total_amount',
    IdClienteFinalDatosFactura: 'end_customer_data_id',
    Enviada: 'sent',
    PdfGenerado: 'pdf_generated'
  },
  booking_invoice_details: {
    FacturaClienteFinalDetalleId: 'id',
    IdFacturaClienteFinal: 'invoice_id',
    IdReservaDepositoCobro: 'charge_id',
    Concepto: 'description'
    // Tax fields are unpivoted in upsertBatch
  },
  booking_charges: {
    //ReservaDepositoId: 'id',
    IdReserva: 'booking_id',
    IdUsuario: 'user_id',

    IdAtributoDescripcionDeposito: 'transaction_type',
    IdAtributoEstadoTramitacion: 'status',
    FechaCobro: 'payment_date',
    IdDivisa: 'payment_currency_id',
    ImporteCobro: 'payment_amount',
    CombinedPaymentMethod: 'payment_method',
    PaymentReference: 'payment_reference',
    PSP: 'payment_processor',
    Token: 'token', // use for?
    CombinedObservaciones: 'remarks',
    FechaAlta: 'created_at',
    FechaModificacion: 'modified_at'
  },
  booking_pvp_details: {
    //ReservaDetallePVPId: 'id',
    IdReserva: 'booking_id',
    Nombre: 'name',
    Component: 'component',
    Direction: 'direction',
    NumPasajeros: 'passenger_count',
    PVPporPAX: 'pvp_per_pax',
    TaxType: 'tax_type',
    TaxRate: 'tax_rate',
    TaxAmount: 'tax_amount',
    IdAtributoCosteComisionable: 'net_commissionable',
    Invoiced: 'is_invoiced'
  },
  booking_passengers: {
    //ReservaPasajeroId: 'id',
    IdReserva: 'booking_id',
    IdAtributoTipoPasajero: 'passenger_type',
    NumeroDocumento: 'document_number',
    IdAtributoTipoDocumento: 'document_type',
    FechaExpedicionDocumento: 'document_issue_date',
    FechaCaducidadDocumento: 'document_expiry_date',
    IdPaisNacionalidad: 'nationality_country_id',
    Nombre: 'first_name',
    Apellido1: 'last_name1',
    IdAtributoTitulo: 'title',
    FechaNacimiento: 'birth_date',
    Titular: 'is_main_passenger',
    EmailJoined: 'email', // Fetched from Correo tables
    NombreAmadeus: 'amadeus_first_name',
    ApellidoAmadeus: 'amadeus_last_name',
    //Telefono: 'phone', // unused, but keep column for future?
    Genero: 'gender'
  }
  /*setting_currencies: {
    DivisaId: 'id',
    Nombre: 'name',
    CodigoDivisa: 'code',
    Simbolo: 'symbol'
  }*/
}

const TABLE_MAP: Record<string, { mssql: string; id_col: string }> = {
  bookings: { mssql: 'dbo.Reserva', id_col: 'ReservaId' },
  booking_flights: { mssql: 'dbo.ReservaTransporte', id_col: 'ReservaTransporteId' },
  booking_hotels: { mssql: 'dbo.ReservaAlojamiento', id_col: 'ReservaAlojamientoId' },
  booking_tours: { mssql: 'dbo.ReservaTicket', id_col: 'ReservaTicketId' },
  booking_transfers: { mssql: 'dbo.ReservaTransfer', id_col: 'ReservaTransferId' },
  booking_other_services: { mssql: 'dbo.ReservaServicio', id_col: 'ReservaServicioId' },
  booking_charges: { mssql: 'dbo.ReservaDeposito', id_col: 'ReservaDepositoId' },
  booking_invoices: { mssql: 'dbo.FacturaClienteFinal', id_col: 'FacturaClienteFinalId' },
  booking_invoice_details: { mssql: 'dbo.FacturaClienteFinalDetalle', id_col: 'FacturaClienteFinalDetalleId' },
  booking_pvp_details: { mssql: 'dbo.ReservaDetallePVP', id_col: 'ReservaDetallePVPId' },
  booking_passengers: { mssql: 'dbo.ReservaPasajero', id_col: 'ReservaPasajeroId' }
  //setting_currencies: { mssql: 'dbo.Divisa', id_col: 'DivisaId' }
}

async function runMigration() {
  console.log('--- Starting MSSQL to Supabase Migration ---')

  try {
    const pool = await mssql.connect(mssqlConfig)

    // 1. Initial Fetch of Booking IDs in order
    let lastBookingId = 0
    let hasMore = true

    while (hasMore) {
      console.log(`[FETCHING] Batch starting after ReservaId: ${lastBookingId}...`)

      const result = await pool.request()
        //.input('lastId', mssql.Int, lastBookingId)
        .input('batchSize', mssql.Int, BATCH_SIZE)
        .query(`
          SELECT TOP (@batchSize) b.*
          FROM ${TABLE_MAP.bookings.mssql} b
          WHERE b.ReservaId > 50000
          ORDER BY b.ReservaId ASC
        `)

      const mssqlBookings = result.recordset

      if (mssqlBookings.length === 0) {
        hasMore = false
        break
      }

      const bookingIds = mssqlBookings.map(b => b.ReservaId)
      lastBookingId = bookingIds[bookingIds.length - 1]

      // Transform and Upsert Bookings. Returns IDs of processed (not skipped) bookings.
      const processedBookingIds = await upsertBatch('bookings', mssqlBookings)

      if (processedBookingIds && processedBookingIds.length > 0) {
        let upsertedInvoiceIds: number[] = []

        // Fetch and Upsert related tables for this batch, using only IDs that weren't skipped

        // Process tables in dependency order
        const tableOrder = ['booking_flights', 'booking_hotels', 'booking_tours', 'booking_transfers', 'booking_other_services', 'booking_invoices', 'booking_invoice_details', 'booking_charges', 'booking_pvp_details', 'booking_passengers']

        for (const table of tableOrder) {
          if (table === 'bookings' || !TABLE_MAP[table]) continue

          const mssqlTable = TABLE_MAP[table].mssql
          const mapping = MAPPINGS[table]

          // Find which column in the related table maps to ReservaId (strictly looking for booking_id)
          const bookingIdColInMssql = Object.keys(mapping).find(m => mapping[m] === 'booking_id') || 'IdReserva'

          let query = `SELECT * FROM ${mssqlTable} WHERE ${bookingIdColInMssql} IN (${processedBookingIds.join(',')})`

          // Special case for booking_flights: JOIN with Destino to get country_id and combine suppliers
          if (table === 'booking_flights') {
            query = `
              SELECT rt.*,
                COALESCE(rt.LocalizadorProveedor, rt.LocalizadorGDS, rt.LocalizadoUAPI, rt.LocalizadorCompania, rt.LocalizadorTerminal) AS CombinedLocator,
                  CASE
                    WHEN p1.ProveedorId IS NOT NULL THEN rt.IdProveedor
                    WHEN p2.ProveedorId IS NOT NULL THEN rt.IdProveedorPagador
                    ELSE rt.IdProveedor
                  END as CombinedSupplierId
              FROM dbo.ReservaTransporte rt
              LEFT JOIN dbo.Destino d ON rt.IdDestino = d.DestinoId
              LEFT JOIN dbo.Proveedor p1 ON rt.IdProveedor = p1.ProveedorId AND p1.Activo = 1
              LEFT JOIN dbo.Proveedor p2 ON rt.IdProveedorPagador = p2.ProveedorId AND p2.Activo = 1
              WHERE rt.IdReserva IN (${processedBookingIds.join(',')})
            `
          }

          if (table === 'booking_hotels') {
            query = `
              SELECT ra.*,
                     CASE
                       WHEN p1.ProveedorId IS NOT NULL THEN ra.IdProveedor
                       WHEN p2.ProveedorId IS NOT NULL THEN ra.IdProveedorPagador
                       ELSE ra.IdProveedor
                     END as CombinedSupplierId
              FROM dbo.ReservaAlojamiento ra
              LEFT JOIN dbo.Proveedor p1 ON ra.IdProveedor = p1.ProveedorId AND p1.Activo = 1
              LEFT JOIN dbo.Proveedor p2 ON ra.IdProveedorPagador = p2.ProveedorId AND p2.Activo = 1
              WHERE ra.IdReserva IN (${processedBookingIds.join(',')})
            `
          }

          if (table === 'booking_other_services') {
            query = `
              SELECT rs.*,
                     CASE
                       WHEN p1.ProveedorId IS NOT NULL THEN rs.IdProveedor
                       WHEN p2.ProveedorId IS NOT NULL THEN rs.IdProveedorPagador
                       ELSE rs.IdProveedor
                     END as CombinedSupplierId
              FROM dbo.ReservaServicio rs
              LEFT JOIN dbo.Proveedor p1 ON rs.IdProveedor = p1.ProveedorId AND p1.Activo = 1
              LEFT JOIN dbo.Proveedor p2 ON rs.IdProveedorPagador = p2.ProveedorId AND p2.Activo = 1
              WHERE rs.IdReserva IN (${processedBookingIds.join(',')})
            `
          }

          if (table === 'booking_transfers') {
            query = `
              SELECT rt.*,
                     CASE
                       WHEN p1.ProveedorId IS NOT NULL THEN rt.IdProveedor
                       WHEN p2.ProveedorId IS NOT NULL THEN rt.IdProveedorPagador
                       ELSE rt.IdProveedor
                     END as CombinedSupplierId
              FROM dbo.ReservaTransfer rt
              LEFT JOIN dbo.Proveedor p1 ON rt.IdProveedor = p1.ProveedorId AND p1.Activo = 1
              LEFT JOIN dbo.Proveedor p2 ON rt.IdProveedorPagador = p2.ProveedorId AND p2.Activo = 1
              WHERE rt.IdReserva IN (${processedBookingIds.join(',')})
            `
          }

          if (table === 'booking_pvp_details') {
            query = `
              SELECT rdp.*, rdps.IdReservaAlojamiento, rdps.IdReservaTicket, rdps.IdReservaTransfer, rdps.IdReservaTransporte, rdps.IdReservaServicio
              FROM dbo.ReservaDetallePVP rdp
              LEFT JOIN dbo.ReservaDetallePVPServicio rdps ON rdps.IdReservaDetallePVP = rdp.ReservaDetallePVPId
              WHERE rdp.IdReserva IN (${processedBookingIds.join(',')})
            `
          }

          // Special case for invoices: resolve booking_id and aggregate total
          if (table === 'booking_invoices') {
            query = `
              SELECT
                h.*,
                COALESCE(bl.IdReserva, d_base.IdReserva, h.IdReservaFichero) as FinalBookingId,
                (SELECT SUM(BaseImponible) FROM dbo.FacturaClienteFinalDetalle WHERE IdFacturaClienteFinal = h.FacturaClienteFinalId) as TotalBaseImponible
              FROM dbo.FacturaClienteFinal h
              OUTER APPLY (
                SELECT TOP 1 rd.IdReserva
                FROM dbo.FacturaClienteFinalDetalle d
                JOIN dbo.ReservaDepositoCobro rdc ON d.IdReservaDepositoCobro = rdc.ReservaDepositoCobroId
                JOIN dbo.ReservaDeposito rd ON rdc.IdReservaDeposito = rd.ReservaDepositoId
                WHERE d.IdFacturaClienteFinal = h.FacturaClienteFinalId
              ) bl
              OUTER APPLY (
                SELECT TOP 1 IdReserva FROM dbo.FacturaClienteFinalDetalle
                WHERE IdFacturaClienteFinal = h.FacturaClienteFinalId AND IdReserva IS NOT NULL
              ) d_base
              WHERE bl.IdReserva IN (${processedBookingIds.join(',')})
                 OR d_base.IdReserva IN (${processedBookingIds.join(',')})
            `
          }

          if (table === 'booking_invoice_details') {
            query = `
              SELECT
                d.*,
                COALESCE(bl.IdReserva, d.IdReserva) as FinalBookingId
              FROM dbo.FacturaClienteFinalDetalle d
              OUTER APPLY (
                SELECT TOP 1 rd.IdReserva
                FROM dbo.ReservaDepositoCobro rdc
                JOIN dbo.ReservaDeposito rd ON rdc.IdReservaDeposito = rd.ReservaDepositoId
                WHERE rdc.ReservaDepositoCobroId = d.IdReservaDepositoCobro
              ) bl
              WHERE bl.IdReserva IN (${processedBookingIds.join(',')})
                 OR d.IdReserva IN (${processedBookingIds.join(',')})
            `
          }

          // Special case for charge: JOIN with payment data
          if (table === 'booking_charges') {
            query = `
              SELECT d.*, p.FechaCobro, p.IdAtributoDescripcionCobro, p.IdDivisa,
                     p.Importe as ImporteCobro, p.PSP, p.Observaciones as ObservacionesCobro,
                     CASE
                       WHEN d.Observaciones IS NOT NULL AND p.Observaciones IS NOT NULL
                       THEN d.Observaciones + ' | ' + p.Observaciones
                       WHEN d.Observaciones IS NOT NULL THEN d.Observaciones
                       WHEN p.Observaciones IS NOT NULL THEN p.Observaciones
                       ELSE NULL
                     END as CombinedObservaciones,
                     COALESCE(p.OriginalPaymentReference, p.LocalizadorBanco, d.OriginalPaymentReference) as PaymentReference,
                     COALESCE(p.IdAtributoRDCCA_FORMAPAGO, d.IdAtributoMetodoPago) as CombinedPaymentMethod
              FROM dbo.ReservaDeposito d
              LEFT JOIN dbo.ReservaDepositoCobro p ON d.ReservaDepositoId = p.IdReservaDeposito
              WHERE d.IdReserva IN (${processedBookingIds.join(',')})
            `
          }

          // Special case for passengers: fetch email from Correo tables
          if (table === 'booking_passengers') {
            query = `
              SELECT rp.*, (
                SELECT TOP 1 cd.Email
                FROM dbo.CorreoDestinatario cd
                JOIN dbo.Correo c ON c.CorreoId = cd.IdCorreo
                WHERE c.IdReserva = rp.IdReserva
                ORDER BY c.CorreoId DESC
              ) as EmailJoined
              FROM dbo.ReservaPasajero rp
              WHERE rp.IdReserva IN (${processedBookingIds.join(',')})
            `
          }

          const relatedResult = await pool.request().query(query)

          if (relatedResult.recordset.length > 0) {
            const resultIds = await upsertBatch(table, relatedResult.recordset, {
              processedBookingIds,
              validInvoiceIds: upsertedInvoiceIds
            })

            if (table === 'booking_invoices' && resultIds) {
              upsertedInvoiceIds = resultIds
            }
          }
        }
      } else if (processedBookingIds) {
        console.log(`[INFO] No valid bookings found in this batch (skipped orphans).`)
      } else {
        console.warn(`[SKIP] Skipping related tables for batch due to bookings table failure.`)
      }

      console.log(`[COMPLETED] Batch up to ReservaId: ${lastBookingId}`)

      // Option to run only one batch for testing
      if (process.env.RUN_SINGLE_BATCH === 'true') {
        console.log('[INFO] Stopping after one batch as requested.')
        hasMore = false
        break
      }
    }

    await pool.close()
    console.log('--- Migration Finished Successfully ---')

  } catch (err) {
    console.error('[FATAL] Migration error:', err)
    process.exit(1)
  }
}

async function upsertBatch(tableName: string, records: any[], context?: { processedBookingIds?: number[], validInvoiceIds?: number[] }): Promise<number[] | null> {
  const mapping = MAPPINGS[tableName]
  let dbRecords: Record<string, any>[] = []

  // Special handling for invoice details: unpivoting taxes
  if (tableName === 'booking_invoice_details') {
    records.forEach(record => {
      const taxConfigs = [
        { rate: '10%', invoiceKey: 'TaxableInvoice10', amountKey: 'TaxableAmount10', idSuffix: 1 },
        { rate: '5%', invoiceKey: 'TaxableInvoice5', amountKey: 'TaxableAmount5', idSuffix: 2 },
        { rate: 'EXEMPT', invoiceKey: 'ExemptTaxInvoice', amountKey: 'ExemptTaxAmount', idSuffix: 3 },
        { rate: 'ZERO', invoiceKey: 'ZeroTaxInvoice', amountKey: 'ZeroTaxAmount', idSuffix: 4 },
        { rate: 'NA', invoiceKey: 'NaTaxInvoice', amountKey: 'NaTaxAmount', idSuffix: 5 }
      ]

      taxConfigs.forEach(config => {
        const totalWithTax = record[config.invoiceKey]
        if (totalWithTax && totalWithTax !== 0) {
          dbRecords.push({
            id: record.FacturaClienteFinalDetalleId * 10 + config.idSuffix, // Stable identity for unpivoted rows
            invoice_id: record.IdFacturaClienteFinal,
            charge_id: record.IdReservaDepositoCobro,
            description: record.Concepto,
            //booking_id: record.IdReserva || record.FinalBookingId, // For filtering
            tax_type: config.rate,
            tax_amount: record[config.amountKey] || 0,
            total_with_tax: totalWithTax
          })
        }
      })
    })
  } else {
    dbRecords = records.map(record => {
      const dbRecord: Record<string, any> = {}
      Object.entries(mapping).forEach(([mssqlCol, dbCol]) => {
        let value = record[mssqlCol]

        if (value === undefined) return // Skip columns not in this record

        // Type conversion
        if (value === null || value === '-' || (typeof value === 'string' && value.trim() === '')) {
          dbRecord[dbCol] = null
        } else if (dbCol === 'title' && tableName === 'booking_passengers' && value !== null) {
          dbRecord[dbCol] = TITLE_MAPPING[value.toString()] || value
        } else if (dbCol === 'passenger_type' && tableName === 'booking_passengers' && value !== null) {
          dbRecord[dbCol] = PASSENGER_TYPE_MAPPING[value.toString()] || value
        } else if (dbCol === 'document_type' && tableName === 'booking_passengers' && value !== null) {
          dbRecord[dbCol] = DOCUMENT_TYPE_MAPPING[value.toString()] || value
        } else if (dbCol === 'admin_status' && tableName === 'bookings' && value !== null) {
          dbRecord[dbCol] = ADMIN_STATUS_MAPPING[value.toString()] || value
        } else if (dbCol === 'documentation_status' && tableName === 'bookings' && value !== null) {
          dbRecord[dbCol] = DOCUMENTATION_STATUS_MAPPING[value.toString()] || value
        } else if (dbCol === 'proforma_status' && tableName === 'bookings' && value !== null) {
          dbRecord[dbCol] = PROFORMA_STATUS_MAPPING[value.toString()] || value
        } else if (dbCol === 'net_commissionable' && value !== null) {
          dbRecord[dbCol] = NET_COMMISSIONABLE_MAPPING[value.toString()] || value
        } else if (dbCol === 'gender' && tableName === 'booking_passengers' && value === 'Unspecified') {
          dbRecord[dbCol] = null
        } else if (dbCol === 'transaction_type' && tableName === 'booking_charges' && value !== null) {
          dbRecord[dbCol] = TRANSACTION_TYPE_MAPPING[value.toString()] || value
        } else if (dbCol === 'status' && tableName === 'booking_charges' && value !== null) {
          dbRecord[dbCol] = PAYMENT_STATUS_MAPPING[value.toString()] || value
        } else if (dbCol === 'payment_method' && tableName === 'booking_charges' && value !== null) {
          dbRecord[dbCol] = PAYMENT_METHOD_MAPPING[value.toString()] || value
        } else if (dbCol === 'transfer_type' && tableName === 'booking_transfers' && value !== null) {
          dbRecord[dbCol] = TRANSFER_TYPE_MAPPING[value.toString()] || value
        } else if (typeof value === 'boolean' || (typeof value === 'number' && (value === 0 || value === 1) && isBooleanCol(dbCol))) {
          dbRecord[dbCol] = !!value
        } else {
          dbRecord[dbCol] = value
        }
      })

      // Fallback logic for sales_channel_value in bookings table
      if (tableName === 'bookings' && dbRecord.booking_reference) {
        if (!dbRecord.sales_channel_value) {
          // Extract only alphabets and convert to uppercase
          dbRecord.sales_channel_value = dbRecord.booking_reference.replace(/[^a-zA-Z]/g, '').toUpperCase() || 'TUI'
        }
      }

      // Custom logic for booking_pvp_details
      if (tableName === 'booking_pvp_details') {
        if (record.IdReservaAlojamiento) {
          dbRecord.component = 'Hotel'
          dbRecord.direction = 'Inbound'
        } else if (record.IdReservaTicket) {
          dbRecord.component = 'Tour'
          dbRecord.direction = 'Inbound'
        } else if (record.IdReservaTransfer) {
          dbRecord.component = 'Transfer'
          dbRecord.direction = 'Inbound'
        } else if (record.IdReservaTransporte) {
          dbRecord.component = 'Flight'
          dbRecord.direction = 'Outbound'
        } else if (record.IdReservaServicio) {
          dbRecord.component = 'Others'
          // direction remains null
        }

        // Convert any component that is not "Flight", "Hotel", "Tour", or "Transfer" to "Others"
        const validComponents = ['Flight', 'Hotel', 'Tour', 'Transfer']
        if (!dbRecord.component || !validComponents.includes(dbRecord.component)) {
          dbRecord.component = 'Others'
        }
      }

      return dbRecord
    })
  }

  const finalRecords = dbRecords.filter(rec => {
    // Skip orphaned bookings that contain underscores in reference OR are missing reference
    if (tableName === 'bookings') {
      if (!rec.booking_reference || rec.booking_reference.includes('_')) {
        return false
      }
    }

    // Skip related records if their parent booking was skipped (for this batch)
    if (tableName !== 'bookings' && context?.processedBookingIds) {
      if (rec.booking_id && !context.processedBookingIds.includes(rec.booking_id)) {
        return false
      }
    }

    // Skip invoice details if the parent invoice was skipped
    if (tableName === 'booking_invoice_details' && context?.validInvoiceIds) {
      if (!context.validInvoiceIds.includes(rec.invoice_id)) {
        return false
      }
    }

    return true
  }).map(rec => {
    if (tableName === 'booking_invoice_details') {
      const { booking_id, ...rest } = rec
      return rest
    }
    return rec
  })

  if (finalRecords.length === 0) return []

  const { error } = await supabase.from(tableName).upsert(finalRecords, { onConflict: 'id' })
  if (error) {
    const sampleRef = tableName === 'bookings' ? ` (Sample Ref: ${finalRecords[0]?.booking_reference})` : ''
    console.error(`[ERROR] Failed to upsert into ${tableName}${sampleRef}:`, error.message, error.details || '')
    return null
  } else {
    console.log(`[SUCCESS] Upserted ${finalRecords.length} records into ${tableName}`)
    return finalRecords.map(r => r.id)
  }
}

function isBooleanCol(col: string): boolean {
  const booleanCols = ['no_recalculate', 'exclude_mandatory_insurance', 'is_waitlisted', 'in_voucher', 'is_invoiced', 'pdf_generated', 'sent', 'is_main_passenger']
  return booleanCols.includes(col)
}

runMigration()

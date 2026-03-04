
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
  "4858": "Not Invoiced",
  "4859": "Invoiced",
  "4860": "Transferred to SAP",
  "4861": "Transferred to SAP (Expenses)",
  "4862": "Invoiced with Expenses"
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

// Mappings from legacy Spanish MSSQL headers to current database schema
const MAPPINGS: Record<string, Record<string, string>> = {
  bookings: {
    ReservaId: 'id',
    ExternalBookingTransaction: 'booking_reference',
    FechaAlta: 'created_at',
    
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
    TasaCambioDivisa: 'currency_exchange_rate',
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
    TasaLiquidacionDivisa: 'settlement_currency_rate',
    CosteContabilidadSistema: 'system_accounting_cost',
    TasaDivisaFacturacionImpuestos: 'invoice_tax_currency_rate',
    DivisaFacturacionImpuestos: 'invoice_tax_currency',
    
    // Others
    Localizador: 'locator',
    RegionCode: 'region_code',
    CountryCode: 'country_code',
    LanguageCode: 'language_code',
    FechaPrimerServicio: 'first_service_date',
    FechaVencimiento: 'expiry_date',
    FechaLimiteEmision: 'issue_deadline',
    FechaVencimientoPago: 'payment_due_date',
    NoRecalcular: 'no_recalculate',
    ExcluirSeguroObligatorio: 'exclude_mandatory_insurance'
  },
  booking_flights: {
    ReservaTransporteId: 'id',
    IdReserva: 'booking_id',
    IdContratoAereoInventario: 'airline_contract_id',
    NumeroAdultos: 'adult_count',
    NumeroNinos: 'child_count',
    NumerosBebes: 'infant_count',
    PVPporPAX: 'pvp_per_pax',
    PrecioConTasas: 'price_with_taxes',
    LocalizadorProveedor: 'provider_locator',
    LocalizadorCompania: 'airline_locator',
    TerminalSalida: 'departure_terminal',
    TerminalLlegada: 'arrival_terminal',
    Descripcion: 'description'
  },
  booking_hotels: {
    ReservaAlojamientoId: 'id',
    IdReserva: 'booking_id',
    IdContratoAlojamiento: 'hotel_contract_id',
    FechaEntrada: 'check_in_date',
    FechaSalida: 'check_out_date',
    NumeroAdultos: 'adult_count',
    NumeroNinos: 'child_count',
    NumeroBebes: 'infant_count',
    PVPporPAX: 'pvp_per_pax',
    NumeroHabitaciones: 'room_count',
    Descripcion: 'description'
  },
  booking_tours: {
    ReservaTicketId: 'id',
    IdReserva: 'booking_id',
    Fecha: 'tour_date',
    NumeroAdultos: 'adult_count',
    NumeroNinos: 'child_count',
    NumeroBebes: 'infant_count',
    PVPporPAX: 'pvp_per_pax',
    Descripcion: 'description'
  },
  booking_transfers: {
    ReservaTransferId: 'id',
    IdReserva: 'booking_id',
    IdContratoServicio: 'service_contract_id',
    PVPporPAX: 'pvp_per_pax',
    Descripcion: 'description',
    LugarRecogida: 'pickup_location'
  },
  booking_invoices_old: {
    // Detail PK as table PK
    FacturaClienteFinalDetalleId: 'id',
    // Resolved Booking ID
    FinalBookingId: 'booking_id',
    // Header fields
    NumeroFactura: 'invoice_number',
    IdAtributoTipoFacturaGenerada: 'generated_invoice_type_id',
    IdAtributoTipoFactura: 'invoice_type_id',
    Fecha: 'invoice_date',
    IdFacturaExterna: 'external_billing_id',
    IdAtributoEstadoFacturaExterna: 'external_billing_status_id',
    ErrorFacturaExterna: 'external_billing_error',
    NumeroFacturaExterna: 'external_invoice_number',
    FechaRecepcionExterna: 'external_reception_date',
    // Detail fields
    BaseImponible: 'tax_base',
    Iva: 'vat',
    Concepto: 'concept',
    IdReservaDepositoCobro: 'deposit_payment_id',
    ExemptTaxRate: 'exempt_tax_rate',
    ExemptTaxAmount: 'exempt_tax_amount',
    ExemptTaxInvoice: 'exempt_tax_invoice',
    ZeroTaxRate: 'zero_tax_rate',
    ZeroTaxAmount: 'zero_tax_amount',
    ZeroTaxInvoice: 'zero_tax_invoice',
    NaTaxRate: 'na_tax_rate',
    NaTaxAmount: 'na_tax_amount',
    NaTaxInvoice: 'na_tax_invoice',
    TaxableRate5: 'taxable_rate_5',
    TaxableAmount5: 'taxable_amount_5',
    TaxableInvoice5: 'taxable_invoice_5',
    TaxableBase5: 'taxable_base_5',
    TaxableRate10: 'taxable_rate_10',
    TaxableAmount10: 'taxable_amount_10',
    TaxableInvoice10: 'taxable_invoice_10',
    TaxableBase10: 'taxable_base_10'
  },
  booking_deposits: {
    ReservaDepositoId: 'id',
    IdReserva: 'booking_id',
    IdAtributoTipoDeposito: 'deposit_type_id',
    IdUsuario: 'user_id',
    Importe: 'amount',
    FechaLimite: 'deadline_date',
    Descripcion: 'description',
    IdAtributoDescripcionDeposito: 'deposit_description_id',
    IdAtributoEstado: 'status_id',
    TramitacionAdministrativa: 'admin_check',
    Token: 'token',
    FechaModificacion: 'modified_at',
    Observaciones: 'observations',
    OriginalPaymentReference: 'original_payment_reference',
    PaymentProvider: 'payment_provider',
    IdAtributoMetodoPago: 'payment_method_id'
  },
  booking_deposit_payments: {
    ReservaDepositoCobroId: 'id',
    IdReservaDeposito: 'deposit_id',
    FinalBookingId: 'booking_id',
    FechaCobro: 'payment_date',
    Importe: 'amount',
    IdDivisa: 'currency_id',
    IdAtributoDescripcionCobro: 'payment_description_id',
    IdAtributoRDCCA_FORMAPAGO: 'payment_method_id',
    LocalizadorBanco: 'bank_locator',
    PasarelaPago: 'payment_gateway',
    PSP: 'payment_processor',
    Observaciones: 'observations'
  },
  booking_pvp_details: {
    ReservaDetallePVPId: 'id',
    IdReserva: 'booking_id',
    PVPporPAX: 'pvp_per_pax',
    NumPasajeros: 'passenger_count',
    Nombre: 'name',
    esDescuento: 'is_discount',
    Visible: 'is_visible',
    Invoiced: 'is_invoiced'
  },
  booking_passengers: {
    ReservaPasajeroId: 'id',
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
  /*settings_currencies: {
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
  booking_deposits: { mssql: 'dbo.ReservaDeposito', id_col: 'ReservaDepositoId' },
  booking_deposit_payments: { mssql: 'dbo.ReservaDepositoCobro', id_col: 'ReservaDepositoCobroId' },
  booking_invoices_old: { mssql: 'dbo.FacturaClienteFinal', id_col: 'FacturaClienteFinalId' },
  booking_pvp_details: { mssql: 'dbo.ReservaDetallePVP', id_col: 'ReservaDetallePVPId' },
  booking_passengers: { mssql: 'dbo.ReservaPasajero', id_col: 'ReservaPasajeroId' }
  //settings_currencies: { mssql: 'dbo.Divisa', id_col: 'DivisaId' }
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
          /*WHERE b.ReservaId > @lastId*/
          ORDER BY b.ReservaId DESC
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
        for (const table of Object.keys(TABLE_MAP)) {
          if (table === 'bookings') continue

          const mssqlTable = TABLE_MAP[table].mssql
          const mapping = MAPPINGS[table]

          // Find which column in the related table maps to ReservaId (strictly looking for booking_id)
          const bookingIdColInMssql = Object.keys(mapping).find(m => mapping[m] === 'booking_id') || 'IdReserva'

          let query = `SELECT * FROM ${mssqlTable} WHERE ${bookingIdColInMssql} IN (${processedBookingIds.join(',')})`

          // Special case for invoices: JOIN header and detail, and resolve booking_id
          if (table === 'booking_invoices_old') {
            query = `
              SELECT
                h.*,
                d.FacturaClienteFinalDetalleId, d.BaseImponible, d.Iva, d.Concepto, d.IdReserva as IdReservaDetail, d.IdReservaDepositoCobro,
                d.ExemptTaxRate, d.ExemptTaxAmount, d.ExemptTaxInvoice,
                d.ZeroTaxRate, d.ZeroTaxAmount, d.ZeroTaxInvoice,
                d.NaTaxRate, d.NaTaxAmount, d.NaTaxInvoice,
                d.TaxableRate5, d.TaxableAmount5, d.TaxableInvoice5, d.TaxableBase5,
                d.TaxableRate10, d.TaxableAmount10, d.TaxableInvoice10, d.TaxableBase10,
                COALESCE(d.IdReserva, h.IdReservaFichero, lookup.IdReserva) as FinalBookingId
              FROM dbo.FacturaClienteFinal h
              JOIN dbo.FacturaClienteFinalDetalle d ON h.FacturaClienteFinalId = d.IdFacturaClienteFinal
              LEFT JOIN (
                SELECT c.ReservaDepositoCobroId, dep.IdReserva
                FROM dbo.ReservaDepositoCobro c
                JOIN dbo.ReservaDeposito dep ON c.IdReservaDeposito = dep.ReservaDepositoId
              ) lookup ON d.IdReservaDepositoCobro = lookup.ReservaDepositoCobroId
              WHERE h.IdReservaFichero IN (${processedBookingIds.join(',')})
                 OR d.IdReserva IN (${processedBookingIds.join(',')})
            `
          }

          // Special case for deposit payments: resolve booking_id via parent deposit
          if (table === 'booking_deposit_payments') {
            query = `
              SELECT p.*, d.IdReserva as FinalBookingId
              FROM dbo.ReservaDepositoCobro p
              JOIN dbo.ReservaDeposito d ON p.IdReservaDeposito = d.ReservaDepositoId
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
  const dbRecords = records.map(record => {
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
      }
      else if (dbCol === 'gender' && tableName === 'booking_passengers' && value === 'Unspecified') {
        dbRecord[dbCol] = null
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

    return dbRecord
  }).filter(rec => {
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
  })

  if (dbRecords.length === 0) return []

  const { error } = await supabase.from(tableName).upsert(dbRecords, { onConflict: 'id' })
  if (error) {
    const sampleRef = tableName === 'bookings' ? ` (Sample Ref: ${dbRecords[0]?.booking_reference})` : ''
    console.error(`[ERROR] Failed to upsert into ${tableName}${sampleRef}:`, error.message, error.details || '')
    return null
  } else {
    console.log(`[SUCCESS] Upserted ${dbRecords.length} records into ${tableName}`)
    return dbRecords.map(r => r.id)
  }
}

function isBooleanCol(col: string): boolean {
  const booleanCols = ['direct_sale', 'no_recalculate', 'recoveries', 'claim', 'from_product', 'on_voucher', 'is_visible', 'is_discount', 'is_invoiced', 'is_group', 'admin_check', 'pdf_generated', 'sent', 'show_vat', 'accounting_sale', 'accounting_purchase', 'is_main_passenger']
  return booleanCols.includes(col)
}

runMigration()

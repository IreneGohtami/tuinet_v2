
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
const BATCH_SIZE = 100

// Mappings from legacy Spanish MSSQL headers to current database schema
const MAPPINGS: Record<string, Record<string, string>> = {
  bookings: {
    ReservaId: 'id',
    ExternalBookingTransaction: 'booking_reference_id',
    Localizador: 'locator',
    FechaAlta: 'created_at',
    FechaPrimerServicio: 'first_service_date',
    IdAgencia: 'agency_id',
    IdOficina: 'office_id',
    IdOficinaAgente: 'agent_office_id',
    IdAtributoEstadoReserva: 'status_id',
    IdAtributoTipoPago: 'payment_type_id',
    ImporteTotal: 'total_amount',
    ImporteTotalCliente: 'customer_total_amount',
    IdDivisa: 'currency_id',
    Referencia: 'reference',
    IdDelegacion: 'delegation_id',
    VentaDirecta: 'direct_sale',
    IdGrupo: 'group_id',
    PorcentajeVenta: 'sale_percentage',
    NoRecalcular: 'no_recalculate',
    Recuperaciones: 'recoveries',
    Reclamacion: 'claim',
    EmailConfirmacion: 'confirmation_email',
    NombreGrupo: 'group_name',
    IdAtributoCanalVenta: 'sales_channel_id',
    CanalVentaValor: 'sales_channel_value',
    RegionCode: 'region_code',
    CountryCode: 'country_code',
    LanguageCode: 'language_code'
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
  booking_invoices: {
    FacturaClienteFinalId: 'id',
    IdReservaFichero: 'booking_id',
    NumeroFactura: 'invoice_number',
    Fecha: 'invoice_date'
  },
  booking_invoice_details: {
    FacturaClienteFinalDetalleId: 'id',
    IdFacturaClienteFinal: 'invoice_id',
    BaseImponible: 'tax_base',
    Iva: 'vat',
    Concepto: 'concept',
    IdReserva: 'booking_id'
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
  settings_currencies: {
    DivisaId: 'id',
    Nombre: 'name',
    CodigoDivisa: 'code',
    Simbolo: 'symbol'
  }
}

const TABLE_MAP: Record<string, { mssql: string; id_col: string }> = {
  bookings: { mssql: 'dbo.Reserva', id_col: 'ReservaId' },
  booking_flights: { mssql: 'dbo.ReservaTransporte', id_col: 'ReservaTransporteId' },
  booking_hotels: { mssql: 'dbo.ReservaAlojamiento', id_col: 'ReservaAlojamientoId' },
  booking_tours: { mssql: 'dbo.ReservaTicket', id_col: 'ReservaTicketId' },
  booking_transfers: { mssql: 'dbo.ReservaTransfer', id_col: 'ReservaTransferId' },
  booking_invoices: { mssql: 'dbo.FacturaClienteFinal', id_col: 'FacturaClienteFinalId' },
  booking_invoice_details: { mssql: 'dbo.FacturaClienteFinalDetalle', id_col: 'FacturaClienteFinalDetalleId' },
  booking_pvp_details: { mssql: 'dbo.ReservaDetallePVP', id_col: 'ReservaDetallePVPId' },
  settings_currencies: { mssql: 'dbo.Divisa', id_col: 'DivisaId' }
}

async function runMigration() {
  console.log('--- Starting MSSQL to Supabase Migration ---')

  try {
    const pool = await mssql.connect(mssqlConfig)

    // 1. Migrate Reference Tables First (Currencies)
    console.log('[REFERENCE] Migrating Currencies...')
    const currencyResult = await pool.request().query(`SELECT * FROM ${TABLE_MAP.settings_currencies.mssql}`)
    if (currencyResult.recordset.length > 0) {
      await upsertBatch('settings_currencies', currencyResult.recordset)
    }

    // 2. Initial Fetch of Booking IDs in order
    let lastBookingId = 0
    let hasMore = false

    while (hasMore) {
      console.log(`[FETCHING] Batch starting after ReservaId: ${lastBookingId}...`)

      const result = await pool.request()
        .input('lastId', mssql.Int, lastBookingId)
        .input('batchSize', mssql.Int, BATCH_SIZE)
        .query(`SELECT TOP (@batchSize) * FROM ${TABLE_MAP.bookings.mssql} WHERE ReservaId > @lastId ORDER BY ReservaId ASC`)

      const mssqlBookings = result.recordset

      if (mssqlBookings.length === 0) {
        hasMore = false
        break
      }

      const bookingIds = mssqlBookings.map(b => b.ReservaId)
      lastBookingId = bookingIds[bookingIds.length - 1]

      // Transform and Upsert Bookings
      await upsertBatch('bookings', mssqlBookings)

      // Fetch and Upsert related tables for this batch
      for (const table of Object.keys(TABLE_MAP)) {
        if (table === 'bookings') continue

        const mssqlTable = TABLE_MAP[table].mssql
        const mapping = MAPPINGS[table]

        // Find which column in the related table maps to ReservaId (usually IdReserva)
        const bookingIdColInMssql = Object.keys(mapping).find(m => mapping[m] === 'booking_id' || mapping[m] === 'invoice_id') || 'IdReserva'

        const relatedResult = await pool.request()
          .query(`SELECT * FROM ${mssqlTable} WHERE ${bookingIdColInMssql} IN (${bookingIds.join(',')})`)

        if (relatedResult.recordset.length > 0) {
          await upsertBatch(table, relatedResult.recordset)
        }
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

async function upsertBatch(tableName: string, records: any[]) {
  const mapping = MAPPINGS[tableName]
  const dbRecords = records.map(record => {
    const dbRecord: Record<string, any> = {}
    Object.entries(mapping).forEach(([mssqlCol, dbCol]) => {
      let value = record[mssqlCol]

      if (value === undefined) return // Skip columns not in this record

      // Type conversion
      if (value === null) {
        dbRecord[dbCol] = null
      } else if (typeof value === 'boolean' || (typeof value === 'number' && (value === 0 || value === 1) && isBooleanCol(dbCol))) {
        dbRecord[dbCol] = !!value
      } else {
        dbRecord[dbCol] = value
      }
    })
    return dbRecord
  })

  const { error } = await supabase.from(tableName).upsert(dbRecords, { onConflict: 'id' })
  if (error) {
    console.error(`[ERROR] Failed to upsert into ${tableName}:`, error.message)
  } else {
    console.log(`[SUCCESS] Upserted ${dbRecords.length} records into ${tableName}`)
  }
}

function isBooleanCol(col: string): boolean {
  const booleanCols = ['direct_sale', 'no_recalculate', 'recoveries', 'claim', 'from_product', 'on_voucher', 'is_visible', 'is_discount', 'is_invoiced', 'is_group', 'admin_check', 'pdf_generated', 'sent', 'show_vat', 'accounting_sale', 'accounting_purchase']
  return booleanCols.includes(col)
}

runMigration()

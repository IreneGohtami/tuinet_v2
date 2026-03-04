import dotenv from 'dotenv'
import mssql from 'mssql'

dotenv.config({ path: '.env.local' })

const mssqlConfig: mssql.config = {
  user: process.env.MSSQL_USER,
  password: process.env.MSSQL_PASSWORD,
  database: process.env.MSSQL_DATABASE || 'PolarTur_Net_TuiNet',
  server: process.env.MSSQL_HOST || 'localhost',
  pool: { max: 10, min: 0, idleTimeoutMillis: 30000 },
  options: { encrypt: true, trustServerCertificate: true }
}

const RESERVA_COLUMNS = [
  // From migrate-mssql.ts mapping
  'ReservaId', 'ExternalBookingTransaction', 'Localizador', 'FechaAlta', 'FechaVencimiento',
  'FechaLimiteEmision', 'IdUsuario', 'FechaPrimerServicio', 'IdAgencia', 'IdOficina',
  'IdOficinaAgente', 'IdAtributoEstadoReserva', 'IdAtributoTipoPago', 'IdFolleto',
  'ImporteTotal', 'ImporteTotalCliente', 'IdDivisa', 'IdTipoDivisaLiquidacion',
  'Referencia', 'IdDelegacion', 'VentaDirecta', 'IdGrupo', 'PorcentajeVenta',
  'NoRecalcular', 'Recuperaciones', 'Reclamacion', 'EmailConfirmacion', 'NombreGrupo',
  'IdAtributoCanalVenta', 'CanalVentaValor', 'IdAtributoCanalEntrada', 'RegionCode',
  'CountryCode', 'LanguageCode',
  // Additional columns from bookings table schema
  'tracking_user_id', 'documenting_user_id', 'distribution_channel_id', 'admin_status_id',
  'manual_admin_status_id', 'documentation_status_id', 'billing_type_id', 'proforma_id',
  'flag_in_use_user_id', 'payment_due_date', 'currency_exchange_rate', 'gross_amount',
  'net_amount', 'cost', 'margin_amount', 'commissionable_amount', 'commission_percentage',
  'commission_amount', 'commission_vat_percentage', 'commission_vat_amount', 'issue_deadline_amount',
  'advance_payment_amount', 'self_invoice_amount', 'agency_fee', 'toms', 'settlement_currency_rate',
  'system_accounting_cost', 'invoice_tax_currency_rate', 'budget_locator', 'associated_budget',
  'package_name', 'invoice_tax_currency', 'status_backup', 'flag_in_use', 'deposit',
  'is_group', 'is_test_booking', 'is_manual_booking', 'is_closed', 'admin_check',
  'commission_lock', 'issue_deadline_communicated', 'no_rappel', 'exclude_mandatory_insurance'
]

async function analyzeReservaColumns() {
  console.log('--- Analyzing Reserva Table Columns ---')
  
  try {
    const pool = await mssql.connect(mssqlConfig)
    const eliminateColumns: string[] = []
    
    for (const column of RESERVA_COLUMNS) {
      try {
        const result = await pool.request().query(`
          SELECT 
            COUNT(DISTINCT ${column}) as distinct_count,
            COUNT(*) as total_count,
            COUNT(${column}) as non_null_count
          FROM dbo.Reserva
        `)
        
        const { distinct_count, total_count, non_null_count } = result.recordset[0]
        
        // Check if column can be eliminated
        const canEliminate = distinct_count <= 1 || non_null_count === 0
        
        console.log(`${column}: ${distinct_count} distinct, ${non_null_count}/${total_count} non-null ${canEliminate ? '❌ ELIMINATE' : '✅ KEEP'}`)
        
        if (canEliminate) {
          eliminateColumns.push(column)
          
          // Show the actual values for eliminated columns
          const valuesResult = await pool.request().query(`
            SELECT DISTINCT TOP 5 ${column} FROM dbo.Reserva WHERE ${column} IS NOT NULL
          `)
          if (valuesResult.recordset.length > 0) {
            console.log(`  Values: ${valuesResult.recordset.map(r => r[column]).join(', ')}`)
          }
        }
      } catch (error) {
        console.log(`${column}: ERROR - ${error}`)
      }
    }
    
    console.log('\n--- SUMMARY ---')
    console.log(`Columns to ELIMINATE (${eliminateColumns.length}):`)
    eliminateColumns.forEach(col => console.log(`  - ${col}`))
    
    console.log(`\nColumns to KEEP (${RESERVA_COLUMNS.length - eliminateColumns.length}):`)
    RESERVA_COLUMNS.filter(col => !eliminateColumns.includes(col)).forEach(col => console.log(`  - ${col}`))
    
    await pool.close()
  } catch (error) {
    console.error('Error:', error)
  }
}

analyzeReservaColumns()
import dotenv from 'dotenv'
import mssql from 'mssql'

dotenv.config({ path: '.env.local' })

// Change this variable to analyze different tables
const TABLE_NAME = 'ReservaTransfer'

const mssqlConfig: mssql.config = {
  user: process.env.MSSQL_USER,
  password: process.env.MSSQL_PASSWORD,
  database: process.env.MSSQL_DATABASE || 'PolarTur_Net_TuiNet',
  server: process.env.MSSQL_HOST || 'localhost',
  pool: { max: 10, min: 0, idleTimeoutMillis: 30000 },
  options: { encrypt: true, trustServerCertificate: true }
}

async function analyzeTableColumns() {
  console.log(`--- Analyzing ${TABLE_NAME} Table Columns ---`)

  try {
    const pool = await mssql.connect(mssqlConfig)

    // Get all column names from the table
    const columnsResult = await pool.request().query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = '${TABLE_NAME}' AND TABLE_SCHEMA = 'dbo'
      ORDER BY ORDINAL_POSITION
    `)

    const columns = columnsResult.recordset.map(row => row.COLUMN_NAME)
    console.log(`Found ${columns.length} columns in ${TABLE_NAME} table\n`)

    const eliminateColumns: string[] = []

    for (const column of columns) {
      try {
        const result = await pool.request().query(`
          SELECT
            COUNT(DISTINCT ${column}) as distinct_count,
            COUNT(*) as total_count,
            COUNT(${column}) as non_null_count
          FROM dbo.${TABLE_NAME}
        `)

        const { distinct_count, total_count, non_null_count } = result.recordset[0]

        // Check if column can be eliminated
        const canEliminate = distinct_count <= 1 || non_null_count === 0

        console.log(`${column}: ${distinct_count} distinct, ${non_null_count}/${total_count} non-null ${canEliminate ? '❌ ELIMINATE' : '✅ KEEP'}`)

        if (canEliminate) {
          eliminateColumns.push(column)

          // Show the actual values for eliminated columns
          const valuesResult = await pool.request().query(`
            SELECT DISTINCT TOP 5 ${column} FROM dbo.${TABLE_NAME} WHERE ${column} IS NOT NULL
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

    console.log(`\nColumns to KEEP (${columns.length - eliminateColumns.length}):`)
    columns.filter(col => !eliminateColumns.includes(col)).forEach(col => console.log(`  - ${col}`))

    await pool.close()
  } catch (error) {
    console.error('Error:', error)
  }
}

analyzeTableColumns()
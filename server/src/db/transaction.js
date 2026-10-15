export async function transaction(database, work) {
  for (let attempt = 0; ; attempt++) {
    try { return await database.$transaction(work, { isolationLevel: 'Serializable', timeout: 15000 }); }
    catch (error) {
      const sqlState = error.meta?.code ?? error.meta?.driverAdapterError?.cause?.originalCode;
      const retryable = error.code === 'P2034' || (error.code === 'P2010' && ['40001', '40P01'].includes(sqlState));
      if (!retryable || attempt >= 3) throw error;
    }
  }
}

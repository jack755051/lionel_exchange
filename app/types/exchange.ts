// ─── 外部匯率 API 回應型別 ───

/** API 錯誤回應 */
export interface ApiErrorResponse {
  success: false
  error: {
    code: number
    info: string
  }
}

export interface BaseRequest {
  access_key: string
  base?: string
  callback?: string
  symbols?: string
}

export interface RatesRequest extends BaseRequest{}

export interface HistoricalRatesRequest extends BaseRequest{
  // YYYY-MM-DD 
  date:string
}

/** /symbols */
export interface SymbolsResponse {
  success: true
  symbols: Record<string, string>
}

/** /latest、/historical 共用結構 */
export interface RatesResponse {
  success: true
  timestamp: number
  base: string
  date: string
  rates: Record<string, number>
}

/** /historical 額外帶 historical 欄位 */
export interface HistoricalRatesResponse extends RatesResponse {
  historical: true
}

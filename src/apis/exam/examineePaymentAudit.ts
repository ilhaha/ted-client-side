import http from '@/utils/http'
import type { LabelValueState } from "@/types/global";

const BASE_URL = '/exam/examineePaymentAudit'


/**
 * 扫码查询作业人员缴费信息
 * @param data 
 * @returns 
 */
export function getPaymentInfoByQrcode(data: any) {
  return http.post(`${BASE_URL}/payment/qrcode`, data)
}


/**
 * 扫码确认提交作业人员缴费信息
 * @param data 
 * @returns 
 */
export function paymentAuditConfirm(data: any) {
  return http.post(`${BASE_URL}/payment/qrcode/confirm`, data)
}

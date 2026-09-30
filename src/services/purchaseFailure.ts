export type PurchaseCode =
  | "login"
  | "expo-go"
  | "unavailable"
  | "linked"
  | "failed"
  | "cancelled"
  | "pending"
  | "none"
  | "owned";

export class PurchaseFailure extends Error {
  code: PurchaseCode;

  constructor(code: PurchaseCode) {
    super(code);
    this.name = "PurchaseFailure";
    this.code = code;
  }
}

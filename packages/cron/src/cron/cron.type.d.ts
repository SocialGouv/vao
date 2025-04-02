export type InsertParams = {
  cronName: string;
  startDate: Date;
  endDate: Date;
  report: object;
};

export type QueryParams = [
  InsertParams["cronName"],
  InsertParams["startDate"],
  InsertParams["endDate"],
  InsertParams["report"],
];

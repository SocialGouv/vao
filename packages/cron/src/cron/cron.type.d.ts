import type { TransportEmailResponseError } from "./utils/transporter";

type QueryParams = [
  string,
  Date,
  Date,
  report: {
    error: number;
    success: number;
    total: number;
    errors: TransportEmailResponseError["error"][];
  },
];

type InsertParams = {
  cronName: string;
  startDate: Date;
  endDate: Date;
  report: {
    error: number;
    success: number;
    total: number;
    errors: TransportEmailResponseError["error"][];
  };
};

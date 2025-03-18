import * as nodemailer from "nodemailer";
import * as Sentry from "@sentry/node";
import { logger } from "../utils/logger";
import { sentry } from "../config";

import { smtp } from "../config";
import type SMTPTransport from "nodemailer/lib/smtp-transport";

const smtpSettings = {
  host: smtp.host,
  port: Number(smtp.port),
  secure: smtp.secure,
  ...(smtp.auth.user && smtp.auth.pass
    ? { auth: { user: smtp.auth.user, pass: smtp.auth.pass } }
    : {}),
};

export const transporterPool = nodemailer.createTransport(smtpSettings);
type MailPayload = {
  from: string;
  replyTo?: string;
  html: string;
  subject: string;
  to: string[];
  cc?: string[];
};

const handleTransportEmailPromise = (
  payload: MailPayload,
): Promise<SMTPTransport.SentMessageInfo> =>
  new Promise<SMTPTransport.SentMessageInfo>((resolve, reject) => {
    transporterPool.sendMail(payload, (error, info) => {
      if (error) {
        reject(error);
      } else {
        resolve(info);
      }
    });
  });

export type TransportEmailResponseSuccess = {
  status: "ok";
  response: SMTPTransport.SentMessageInfo;
};

export type TransportEmailResponseError = {
  status: "error";
  error: unknown;
};

export type TransportEmailResponse =
  | TransportEmailResponseSuccess
  | TransportEmailResponseError;

export const transportEmail = async (
  payload: MailPayload,
): Promise<TransportEmailResponse> => {
  try {
    const response = await handleTransportEmailPromise(payload);
    return {
      status: "ok",
      response,
    };
  } catch (error) {
    if (sentry.enabled) {
      Sentry.captureException(error);
    }
    logger.error(error);
    return {
      status: "error",
      error,
    };
  }
};

export const transportEmails = async (payloads: MailPayload[]) => {
  const responses = await Promise.all(
    payloads.map((payload) => transportEmail(payload)),
  );
  const totals = responses.reduce(
    (acc, { status }) => {
      const key = status === "ok" ? "success" : "error";
      acc[key] += 1;
      return acc;
    },
    { success: 0, error: 0 },
  );
  const errors = responses.reduce(
    (acc, elem) => {
      if (elem.status === "error") {
        acc.push(elem.error);
      }
      return acc;
    },
    [] as TransportEmailResponseError["error"][],
  );
  return { responses, total: payloads.length, ...totals, errors };
};

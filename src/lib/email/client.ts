import ky, { type KyInstance, KyResponse } from "ky";

import type { Settings } from "@app/types/global";

import { ConfirmAccount } from "./templates/confirm-account";
import { ResetPassword } from "./templates/reset-password";

type AuthRelatedEmailPayload = {
  to: string;
  token: string;
};

export class EmailClient {
  private sender: string;
  private client: KyInstance;
  private host: string;

  constructor(settings: Settings) {
    this.client = ky.create({
      prefixUrl: settings.email.serverUrl,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${settings.email.key}`,
      },
    });
    this.sender = settings.email.sender;
    this.host = settings.app.host;
  }

  private async handleEmailResponse(
    source: string,
    response: KyResponse<unknown>,
  ) {
    let data = null;
    let error = null;
    if (!response.ok) {
      try {
        const rawError = await response.text();
        error = JSON.parse(rawError);
      } catch (err) {
        if (err instanceof SyntaxError) {
          error = {
            name: "application_error",
            message:
              "Internal server error. We are unable to process your request right now, please try again later.",
          };
        } else {
          error = {
            message: response.statusText,
            name: "application_error",
          };

          if (err instanceof Error) {
            error = { ...error, message: err.message };
          }
        }
      }
    } else {
      data = await response.json();
    }

    if (data) {
      console.log({ message: `Successfully sent ${source} email`, data });
    } else {
      console.error({ message: `Failed to send ${source} email`, error });
    }
  }

  async sendAccountConfirmationEmail({ to, token }: AuthRelatedEmailPayload) {
    const response = await this.client.post("emails", {
      json: {
        from: this.sender,
        to: [to],
        subject: "Ativar conta",
        html: ConfirmAccount(token, this.host),
      },
    });
    this.handleEmailResponse("account confirmation", response);
  }

  async sendResetPasswordEmail({ to, token }: AuthRelatedEmailPayload) {
    const response = await this.client.post("emails", {
      json: {
        from: this.sender,
        to: [to],
        subject: "Esqueci minha senha",
        html: ResetPassword(token, this.host),
      },
    });

    this.handleEmailResponse("reset password", response);
  }
}

export const ResetPassword = (token: string, host: string) => `
<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Albert+Sans:ital,wght@0,100..900;1,100..900&display=swap"
      rel="stylesheet"
    />
    <title>Esqueci minha senha | headshop.digital</title>
  </head>
  <body
    style="
      margin: 0;
      padding: 0;
      background-color: #000000;
      font-family: Albert Sans, sans-serif !important;
    "
  >
    <table
      width="100%"
      cellpadding="0"
      cellspacing="0"
      border="0"
      style="background-color: #000000; padding: 20px"
    >
      <tr>
        <td align="center">
          <table
            cellpadding="0"
            cellspacing="0"
            border="0"
            style="
              background-color: #ffffff;
              padding: 20px;
              box-sizing: border-box;
              margin: 0 auto;
              max-width: 650px;
              width: 100%;
              border-radius: 10px;
            "
          >
            <tr>
              <td align="center">
                <h1 style="font-size: 24px; color: #000000; margin: 0">
                  Esqueceu sua senha, é? 😅
                </h1>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding: 10px 0">
                <p style="margin: 0; margin-top: 5px">
                  E aí! Parece que você está tentando recuperar sua conta. Sem
                  estresse, estamos aqui para te dar uma força.
                </p>

                <p style="margin: 0; margin-top: 5px">
                  Se você não solicitou isso, só ignore este e-mail. Mas se foi
                  você, basta clicar no botão abaixo e logo você estará de
                  volta.
                </p>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding: 20px 0">
                <a
                  href="${host}/sign-in?reset=${token}"
                  target="_blank"
                  rel="noopener noreferrer"
                  style="
                    display: inline-block;
                    width: 100%;
                    max-width: 300px;
                    padding: 15px;
                    background-color: #038c4c;
                    color: #ffffff;
                    text-align: center;
                    text-decoration: none;
                    border-radius: 5px;
                    font-size: 18px;
                    font-weight: 600;
                    border-radius: 0.375rem;
                  "
                  >Recuperar conta</a
                >
              </td>
            </tr>
            <tr>
              <td
                align="center"
                style="
                  padding-top: 10px;
                  word-wrap: break-word;
                  margin: 0 auto;
                  font-size: 14px;
                  font-weight: 500;
                  color: #6b7280;
                "
              >
                Caso o botão não funcione, clique
                <a
                  href="${host}/sign-in?reset=${token}"
                  target="_blank"
                  rel="noopener noreferrer"
                  style="
                    font-size: 14px;
                    color: #038c4c;
                    font-weight: 700;
                    text-decoration: underline;
                  "
                >
                  AQUI </a
                >.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

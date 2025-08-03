export const ConfirmAccount = (token: string, host: string) =>
  `
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
    <title>Ativar conta</title>
  </head>
  <body
    style="margin: 0; padding: 0; background-color: #000000; font-family: Albert Sans, sans-serif !important"
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
            style="background-color: #ffffff; padding: 20px; box-sizing: border-box; margin: 0 auto; max-width: 650px; width: 100%; border-radius: 10px"
          >
            <tr>
              <td align="center">
                <h1 style="font-size: 24px; color: #000000; margin: 0">
                  Falta pouco!
                </h1>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding: 10px 0">
                <p
                  style="font-size: 16px; color: #6b7280; margin: 0; text-align: center"
                >
                  Está quase lá! Só clicar no botão abaixo para ativar sua conta
                  e começar a utlizar a nossa plataforma.
                </p>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding: 20px 0">
                <a
                  href="${host}/sign-in?activate=${token}"
                  target="_blank"
                  rel="noopener noreferrer"
                  style="display: inline-block; width: 100%; max-width: 300px; padding: 15px; background-color: #038c4c; color: #ffffff; text-align: center; text-decoration: none; border-radius: 5px; font-size: 18px; font-weight: 600; border-radius: 0.375rem"
                >
                  Ativar Conta
                </a>
              </td>
            </tr>
            <tr>
              <td
                align="center"
                style="padding-top: 10px; word-wrap: break-word; margin: 0 auto; font-size: 14px; font-weight: 500; color: #6b7280"
              >
                Caso o botão não funcione, clique
                <a
                  href="${host}/sign-in?activate=${token}"
                  target="_blank"
                  rel="noopener noreferrer"
                  style="font-size: 14px; color: #038c4c; font-weight: 700; text-decoration: underline"
                >
                  AQUI
                </a>
                .
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`.trim();

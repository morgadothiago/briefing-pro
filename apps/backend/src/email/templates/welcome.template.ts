export function welcomeTemplate(params: {
  clientName: string
  projectName: string
  briefingLink: string
  adminName: string
}): { subject: string; html: string } {
  return {
    subject: `Bem-vindo! Seu formulário do projeto "${params.projectName}" está pronto`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BriefingPro</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f7fa;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f7fa;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr>
          <td style="background-color:#0A0F1E;border-radius:12px 12px 0 0;padding:32px 40px;text-align:center;">
            <div style="font-size:28px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">
              Briefing<span style="color:#3B82F6;">Pro</span>
            </div>
            <div style="font-size:13px;color:#94A3B8;margin-top:4px;">Sistema de Briefing Inteligente</div>
          </td>
        </tr>
        <tr>
          <td style="background-color:#ffffff;padding:40px;">
            <h1 style="color:#0F172A;font-size:22px;font-weight:600;margin:0 0 16px;">
              Olá, ${params.clientName}!
            </h1>
            <p style="color:#475569;font-size:15px;line-height:1.6;margin:0 0 24px;">
              Ficamos felizes em iniciar o projeto <strong style="color:#0F172A;">${params.projectName}</strong> com você!
              Para darmos início ao desenvolvimento, precisamos entender melhor as suas necessidades.
            </p>
            <p style="color:#475569;font-size:15px;line-height:1.6;margin:0 0 32px;">
              Preparamos um formulário de briefing personalizado. Leva apenas alguns minutos e vai nos ajudar
              a entregar exatamente o que você precisa.
            </p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td align="center">
                <a href="${params.briefingLink}"
                   style="display:inline-block;background-color:#3B82F6;color:#ffffff;text-decoration:none;
                          padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;
                          letter-spacing:0.3px;">
                  Preencher Formulário de Briefing
                </a>
              </td></tr>
            </table>
            <p style="color:#94A3B8;font-size:13px;margin:24px 0 0;text-align:center;">
              O link expira em 90 dias. Se tiver dúvidas, responda este e-mail.
            </p>
          </td>
        </tr>
        <tr>
          <td style="background-color:#F8FAFC;border-radius:0 0 12px 12px;padding:24px 40px;text-align:center;
                     border-top:1px solid #E2E8F0;">
            <p style="color:#94A3B8;font-size:12px;margin:0;">
              Enviado por <strong>${params.adminName}</strong> via BriefingPro
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
    `.trim(),
  }
}

export function briefingReceivedTemplate(params: {
  clientName: string
  projectName: string
  submittedAt: string
  isAdmin: boolean
  adminName?: string
}): { subject: string; html: string } {
  const subject = params.isAdmin
    ? `[BriefingPro] Briefing recebido — ${params.clientName} / ${params.projectName}`
    : `Briefing recebido com sucesso — ${params.projectName}`

  return {
    subject,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f4f7fa;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f7fa;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr>
          <td style="background-color:#0A0F1E;border-radius:12px 12px 0 0;padding:32px 40px;text-align:center;">
            <div style="font-size:28px;font-weight:700;color:#ffffff;">
              Briefing<span style="color:#3B82F6;">Pro</span>
            </div>
          </td>
        </tr>
        <tr>
          <td style="background-color:#ffffff;padding:40px;">
            ${params.isAdmin ? `
            <div style="background:#EFF6FF;border-left:4px solid #3B82F6;padding:16px;border-radius:0 8px 8px 0;margin-bottom:24px;">
              <p style="color:#1E40AF;font-size:14px;font-weight:600;margin:0;">
                Novo briefing recebido
              </p>
            </div>
            ` : ''}
            <h1 style="color:#0F172A;font-size:22px;font-weight:600;margin:0 0 16px;">
              ${params.isAdmin ? 'Briefing recebido!' : `Obrigado, ${params.clientName}!`}
            </h1>
            <p style="color:#475569;font-size:15px;line-height:1.6;margin:0 0 20px;">
              ${params.isAdmin
                ? `O cliente <strong>${params.clientName}</strong> preencheu o briefing do projeto <strong>${params.projectName}</strong>.`
                : `Recebemos o seu briefing para o projeto <strong>${params.projectName}</strong> com sucesso.`
              }
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;border-radius:8px;overflow:hidden;">
              <tr>
                <td style="padding:16px 20px;border-bottom:1px solid #E2E8F0;">
                  <span style="color:#94A3B8;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Projeto</span>
                  <div style="color:#0F172A;font-size:15px;font-weight:600;margin-top:4px;">${params.projectName}</div>
                </td>
              </tr>
              <tr>
                <td style="padding:16px 20px;border-bottom:1px solid #E2E8F0;">
                  <span style="color:#94A3B8;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Cliente</span>
                  <div style="color:#0F172A;font-size:15px;font-weight:600;margin-top:4px;">${params.clientName}</div>
                </td>
              </tr>
              <tr>
                <td style="padding:16px 20px;">
                  <span style="color:#94A3B8;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Enviado em</span>
                  <div style="color:#0F172A;font-size:15px;font-weight:600;margin-top:4px;">${params.submittedAt}</div>
                </td>
              </tr>
            </table>
            ${!params.isAdmin ? `
            <p style="color:#475569;font-size:14px;line-height:1.6;margin:24px 0 0;">
              Nossa equipe irá analisar suas informações e entrará em contato em breve.
            </p>
            ` : ''}
          </td>
        </tr>
        <tr>
          <td style="background-color:#F8FAFC;border-radius:0 0 12px 12px;padding:20px 40px;text-align:center;border-top:1px solid #E2E8F0;">
            <p style="color:#94A3B8;font-size:12px;margin:0;">BriefingPro — Sistema de Briefing Inteligente</p>
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

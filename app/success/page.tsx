"use client";

export default function SuccessPage() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#080f18",
      fontFamily: "'DM Mono', 'Courier New', monospace",
      color: "#e8f5f0",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
    }}>
      <div style={{ textAlign: "center", maxWidth: "400px" }}>
        <div style={{
          fontSize: "64px",
          marginBottom: "24px",
        }}>🎉</div>

        <p style={{
          fontSize: "11px",
          letterSpacing: "3px",
          color: "#00e5a0",
          textTransform: "uppercase",
          marginBottom: "8px",
        }}>Pagamento confirmado</p>

        <h1 style={{
          fontSize: "28px",
          fontWeight: "700",
          color: "#e8f5f0",
          marginBottom: "16px",
        }}>Bem-vindo ao Premium!</h1>

        <p style={{
          fontSize: "13px",
          color: "#4a7a6a",
          marginBottom: "32px",
          lineHeight: 1.6,
        }}>
          Sua assinatura foi ativada com sucesso.
          Agora voce tem acesso a todos os recursos premium do SimInvest.
        </p>

        <a href="/" style={{
          display: "inline-block",
          background: "#00e5a0",
          color: "#080f18",
          border: "none",
          borderRadius: "8px",
          padding: "14px 32px",
          fontSize: "13px",
          fontWeight: "700",
          letterSpacing: "2px",
          textTransform: "uppercase",
          cursor: "pointer",
          fontFamily: "inherit",
          textDecoration: "none",
        }}>
          Voltar ao app
        </a>
      </div>
    </div>
  );
}

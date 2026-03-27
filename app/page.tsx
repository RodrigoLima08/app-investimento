"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const formatBRL = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

interface TooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string | number;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: "#0f1923",
        border: "1px solid #00e5a0",
        borderRadius: "8px",
        padding: "10px 16px",
        color: "#e8f5f0",
        fontSize: "13px",
      }}>
        <p style={{ color: "#00e5a0", marginBottom: 4, fontWeight: 600 }}>Mês {label}</p>
        <p>{formatBRL(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};

interface Result {
  futureValue: number;
  totalInvested: number;
  earnings: number;
  goalMessage: { text: string; success: boolean } | null;
}

interface ChartPoint {
  month: number;
  value: number;
}

export default function InvestmentApp() {
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const [initialValue, setInitialValue] = useState("");
  const [monthlyContribution, setMonthlyContribution] = useState("");
  const [rate, setRate] = useState("");
  const [time, setTime] = useState("");
  const [goal, setGoal] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) {
        setUser({ email: session.user.email });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.email) {
        setUser({ email: session.user.email });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuth = async () => {
    setAuthError("");
    setAuthLoading(true);

    if (!email || !password) {
      setAuthError("Preencha e-mail e senha.");
      setAuthLoading(false);
      return;
    }

    if (isRegister) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setAuthError(error.message);
      else setAuthError("✅ Conta criada! Verifique seu e-mail para confirmar.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setAuthError("E-mail ou senha incorretos.");
    }

    setAuthLoading(false);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setResult(null);
    setChartData([]);
  };

  const calculate = () => {
    setError("");
    const principal = parseFloat(initialValue);
    const contribution = parseFloat(monthlyContribution) || 0;
    const r = parseFloat(rate) / 100;
    const t = parseInt(time);
    const g = parseFloat(goal) || null;

    if (!principal || principal <= 0) return setError("Valor inicial deve ser positivo.");
    if (!r || r <= 0) return setError("Taxa de juros deve ser positiva.");
    if (!t || t <= 0) return setError("Tempo deve ser positivo.");
    if (contribution < 0) return setError("Aporte mensal não pode ser negativo.");

    const data: ChartPoint[] = [];
    let total = principal;

    for (let i = 1; i <= t; i++) {
      total = total * (1 + r) + contribution;
      data.push({ month: i, value: parseFloat(total.toFixed(2)) });
    }

    const totalInvested = principal + contribution * t;
    const earnings = total - totalInvested;

    let goalMessage = null;
    if (g) {
      goalMessage =
        total >= g
          ? { text: "🎉 Você atingirá sua meta!", success: true }
          : { text: "⚠️ Você não atingirá sua meta. Aumente o investimento ou o prazo.", success: false };
    }

    setChartData(data);
    setResult({ futureValue: total, totalInvested, earnings, goalMessage });
  };

  const styles: { [key: string]: React.CSSProperties } = {
    root: {
      minHeight: "100vh",
      background: "#080f18",
      fontFamily: "'DM Mono', 'Courier New', monospace",
      color: "#e8f5f0",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
    },
    container: { width: "100%", maxWidth: "520px" },
    tag: { fontSize: "11px", letterSpacing: "3px", color: "#00e5a0", textTransform: "uppercase", marginBottom: "8px" },
    title: { fontSize: "28px", fontWeight: "700", color: "#e8f5f0", lineHeight: 1.2, margin: 0 },
    subtitle: { fontSize: "13px", color: "#4a7a6a", marginTop: "6px" },
    card: { background: "#0d1e2b", border: "1px solid #1a3040", borderRadius: "16px", padding: "28px", marginBottom: "20px" },
    label: { fontSize: "11px", letterSpacing: "2px", color: "#00e5a0", textTransform: "uppercase", marginBottom: "6px", display: "block" },
    input: { width: "100%", background: "#080f18", border: "1px solid #1a3040", borderRadius: "8px", padding: "12px 14px", color: "#e8f5f0", fontSize: "14px", outline: "none", boxSizing: "border-box", fontFamily: "inherit", marginBottom: "16px" },
    button: { width: "100%", background: "#00e5a0", color: "#080f18", border: "none", borderRadius: "8px", padding: "14px", fontSize: "13px", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit", marginTop: "4px" },
    logoutBtn: { background: "transparent", border: "1px solid #1a3040", color: "#4a7a6a", borderRadius: "8px", padding: "8px 16px", fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit" },
    topBar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" },
    statRow: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "20px" },
    stat: { background: "#080f18", border: "1px solid #1a3040", borderRadius: "10px", padding: "14px 12px", textAlign: "center" },
    statLabel: { fontSize: "10px", letterSpacing: "2px", color: "#4a7a6a", textTransform: "uppercase", marginBottom: "6px" },
    statValue: { fontSize: "13px", fontWeight: "700", color: "#00e5a0" },
    errorBox: { background: "rgba(255,80,80,0.08)", border: "1px solid #ff5050", borderRadius: "8px", padding: "10px 14px", fontSize: "12px", color: "#ff8080", marginBottom: "16px" },
    divider: { borderTop: "1px solid #1a3040", margin: "16px 0" },
    gridTwo: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" },
    fieldGroup: { display: "flex", flexDirection: "column" },
    toggleBtn: { background: "transparent", border: "none", color: "#00e5a0", fontSize: "12px", cursor: "pointer", fontFamily: "inherit", marginTop: "12px", textDecoration: "underline", padding: 0 },
  };

  if (!user) {
    return (
      <div style={styles.root}>
        <div style={styles.container}>
          <div style={{ marginBottom: "32px" }}>
            <p style={styles.tag}>Simulador</p>
            <h1 style={styles.title}>Investimentos</h1>
            <p style={styles.subtitle}>Calcule o futuro do seu dinheiro.</p>
          </div>
          <div style={styles.card}>
            <label style={styles.label}>{isRegister ? "Criar conta" : "Entrar"}</label>

            <label style={{ ...styles.label, marginTop: "8px" }}>E-mail</label>
            <input
              style={styles.input}
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAuth()}
            />

            <label style={styles.label}>Senha</label>
            <input
              style={styles.input}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAuth()}
            />

            {authError && (
              <div style={{
                ...styles.errorBox,
                ...(authError.startsWith("✅") ? { borderColor: "#00e5a0", color: "#00e5a0", background: "rgba(0,229,160,0.07)" } : {})
              }}>
                {authError}
              </div>
            )}

            <button style={styles.button} onClick={handleAuth} disabled={authLoading}>
              {authLoading ? "Aguarde..." : isRegister ? "Criar conta" : "Entrar →"}
            </button>

            <button style={styles.toggleBtn} onClick={() => { setIsRegister(!isRegister); setAuthError(""); }}>
              {isRegister ? "Já tenho conta — fazer login" : "Não tenho conta — criar agora"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.root}>
      <div style={styles.container}>
        <div style={styles.topBar}>
          <div>
            <p style={styles.tag}>Simulador</p>
            <h1 style={{ ...styles.title, fontSize: "18px" }}>{user.email}</h1>
          </div>
          <button style={styles.logoutBtn} onClick={logout}>Sair</button>
        </div>

        <div style={styles.card}>
          <div style={styles.gridTwo}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Valor inicial (R$)</label>
              <input style={styles.input} type="number" placeholder="1000" value={initialValue} onChange={(e) => setInitialValue(e.target.value)} />
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Aporte mensal (R$)</label>
              <input style={styles.input} type="number" placeholder="200" value={monthlyContribution} onChange={(e) => setMonthlyContribution(e.target.value)} />
            </div>
          </div>
          <div style={styles.gridTwo}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Taxa ao mês (%)</label>
              <input style={styles.input} type="number" placeholder="1.0" value={rate} onChange={(e) => setRate(e.target.value)} />
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Período (meses)</label>
              <input style={styles.input} type="number" placeholder="24" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
          </div>
          <div style={styles.divider} />
          <label style={styles.label}>Meta financeira (R$) — opcional</label>
          <input style={styles.input} type="number" placeholder="Ex: 50000" value={goal} onChange={(e) => setGoal(e.target.value)} />
          {error && <div style={styles.errorBox}>{error}</div>}
          <button style={styles.button} onClick={calculate}>Calcular projeção</button>
        </div>

        {result && (
          <>
            <div style={styles.statRow}>
              <div style={styles.stat}>
                <p style={styles.statLabel}>Valor futuro</p>
                <p style={styles.statValue}>{formatBRL(result.futureValue)}</p>
              </div>
              <div style={styles.stat}>
                <p style={styles.statLabel}>Total investido</p>
                <p style={{ ...styles.statValue, color: "#e8f5f0" }}>{formatBRL(result.totalInvested)}</p>
              </div>
              <div style={styles.stat}>
                <p style={styles.statLabel}>Rendimento</p>
                <p style={styles.statValue}>{formatBRL(result.earnings)}</p>
              </div>
            </div>

            {result.goalMessage && (
              <div style={{
                background: result.goalMessage.success ? "rgba(0,229,160,0.07)" : "rgba(255,180,0,0.07)",
                border: `1px solid ${result.goalMessage.success ? "#00e5a0" : "#ffb400"}`,
                borderRadius: "10px", padding: "14px 16px", fontSize: "13px",
                color: result.goalMessage.success ? "#00e5a0" : "#ffb400",
                marginBottom: "20px", textAlign: "center",
              }}>
                {result.goalMessage.text}
              </div>
            )}

            <div style={styles.card}>
              <p style={{ ...styles.tag, marginBottom: "16px" }}>Evolução patrimonial</p>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a3040" />
                  <XAxis dataKey="month" tick={{ fill: "#4a7a6a", fontSize: 11 }} axisLine={{ stroke: "#1a3040" }} tickLine={false} />
                  <YAxis tick={{ fill: "#4a7a6a", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="value" stroke="#00e5a0" strokeWidth={2} dot={false} activeDot={{ r: 5, fill: "#00e5a0", stroke: "#080f18", strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

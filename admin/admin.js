// ===============================
// Supabase
// ===============================
const sb = supabase.createClient(
  'https://rmbbsrfstmnfxbbttaro.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtYmJzcmZzdG1uZnhiYnR0YXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxNDc0OTgsImV4cCI6MjA4NDcyMzQ5OH0.ELoVUxFgbWxaUJDg1DziRp0Y4cSo5MX2zEUDO2bIEzk'
);

const loginBox = document.getElementById("login");
const panelBox = document.getElementById("panel");
const loginMsg = document.getElementById("loginMsg");
const panelMsg = document.getElementById("panelMsg");

document.getElementById("loginBtn").onclick = async () => {
  const code = document.getElementById("adminCode").value;
  if (!code) return;

  const { data, error } = await sb.rpc("check_passcode", {
    target_role: "admin",
    input_passcode: code
  });

  if (error || data !== true) {
    loginMsg.textContent = "パスコードが違います";
    return;
  }

  loginBox.classList.add("hidden");
  panelBox.classList.remove("hidden");
};

document.getElementById("updateUser").onclick = () =>
  confirmAndUpdate("user");

document.getElementById("updateAdmin").onclick = () =>
  confirmAndUpdate("admin");

async function confirmAndUpdate(role) {
  const inputId = role === "admin" ? "adminPass" : "userPass";
  const pass = document.getElementById(inputId).value;

  if (!pass) return;

  const label = role === "admin"
    ? "管理者パスコード"
    : "ユーザーパスコード";

  if (!confirm(`${label}を変更します。よろしいですか？`)) return;

  panelMsg.textContent = "";

  const { error } = await sb.rpc("update_passcode", {
    target_role: role,
    new_passcode: pass
  });

  panelMsg.textContent = error
    ? "変更に失敗しました"
    : "変更しました";

  document.getElementById(inputId).value = "";
}

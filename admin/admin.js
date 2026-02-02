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

document.getElementById("loginBtn").onclick = async (e) => {
  e.preventDefault();

  const input = document.getElementById("adminCode");
  const code = input.value.trim();
  if (!code) return;

  const { data, error } = await sb.rpc("check_passcode", {
    target_role: "admin",
    input_passcode: code
  });

  input.value = "";

  if (error || data !== true) {
    loginMsg.textContent = "パスコードが違います";
    return;
  }

  loginMsg.textContent = "";
  loginBox.classList.add("hidden");
  panelBox.classList.remove("hidden");
};

document.getElementById("updateUser").onclick = (e) => {
  e.preventDefault();
  confirmAndUpdate("user");
};

document.getElementById("updateAdmin").onclick = (e) => {
  e.preventDefault();
  confirmAndUpdate("admin");
};

async function confirmAndUpdate(role) {
  const inputId = role === "admin" ? "adminPass" : "userPass";
  const input = document.getElementById(inputId);
  const pass = input.value.trim();

  panelMsg.textContent = "処理中...";

  const label = role === "admin"
    ? "管理者パスコード"
    : "ユーザーパスコード";

  if (!pass) {
    alert(`新しい${label}を入力して下さい`);
    panelMsg = "";
    return;
  }

  if (!confirm(`${label}を変更します。よろしいですか？`)) {
    panelMsg = "";
    return;
  }

  input.value = "";
  panelMsg.textContent = "";

  const { error } = await sb.rpc("update_passcode", {
    target_role: role,
    new_passcode: pass
  });

  panelMsg.textContent = error
    ? `${label}の変更に失敗しました`
    : `${label}を変更しました`;
}

let allBatches = [];

function calculateProgress(batch) {

  const today = new Date().toISOString().split("T")[0];

  const total = batch.cure_days;
  const elapsed = daysBetween(batch.start_date, today);

  const percent = (elapsed / total) * 100;

  return Math.min(Math.max(percent, 0), 100);
}

function daysBetween(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24));
}

function sortBatches(list, mode) {

  const today = new Date();

  return list.sort((a, b) => {

    if (mode === "curing") {
      const d1 = new Date(a.release_date);
      const d2 = new Date(b.release_date);
      if (d1 - d2 !== 0) return d1 - d2;
    }

    if (mode === "using") {
      const e1 = new Date(a.expire_date);
      const e2 = new Date(b.expire_date);

      const expired1 = e1 < today;
      const expired2 = e2 < today;

      if (expired1 !== expired2) return expired2 - expired1;
      if (e1 - e2 !== 0) return e1 - e2;
    }

    return a.recipe_name.localeCompare(b.recipe_name, "ja");
  });
}

function renderCuringList() {

  const container = document.getElementById("curingList");
  container.innerHTML = "";

  const mode = document.getElementById("curingFilter").value;

  // フィルタ
  let filtered = allBatches.filter(b =>
    mode === "curing" ? b.status === 0 : b.status === 1
  );

  // ソート
  filtered = sortBatches(filtered, mode);

  const today = new Date().toISOString().split("T")[0];

  filtered.forEach(batch => {

    const card = document.createElement("div");
    card.className = "batch-card";

    // ===== using の色分け =====
    if (mode === "using") {
      const expire = new Date(batch.expire_date);
      const now = new Date();

      if (expire < now) {
        card.classList.add("expired");
      } else {
        const diff = daysBetween(today, batch.expire_date);
        if (diff <= 30) {
          card.classList.add("warning");
        }
      }
    }

    // ===== header =====
    const header = document.createElement("div");
    header.className = "batch-header";

    const titleWrap = document.createElement("div");
    titleWrap.className = "batch-title";

    const name = document.createElement("span");
    name.className = "batch-name";
    name.textContent = batch.recipe_name;

    const meta = document.createElement("span");
    meta.className = "batch-days";

    if (mode === "curing") {
      const diff = daysBetween(today, batch.release_date);
      meta.textContent = diff > 0 ? `あと${diff}日` : "熟成完了";
    } else {
      const diff = daysBetween(today, batch.expire_date);
      meta.textContent = diff >= 0 ? `あと${diff}日` : "期限切れ";
    }

    titleWrap.append(name, meta);
    header.appendChild(titleWrap);

    // ===== 進捗バー（curingのみ） =====
    if (mode === "curing") {
      const progressBar = document.createElement("div");
      progressBar.className = "progress-bar";

      const fill = document.createElement("div");
      fill.className = "progress-fill";

      const percent = calculateProgress(batch);
      fill.style.width = percent + "%";

      progressBar.appendChild(fill);
      header.appendChild(progressBar);
    }

    card.appendChild(header);

    // ===== body =====
    const body = document.createElement("div");
    body.className = "batch-body";

    body.innerHTML = `
      <p>開始日: ${batch.start_date}</p>
      <p>終了日: ${batch.release_date}</p>
      <p>消費期限: ${batch.expire_date}</p>
      <p>メモ: ${batch.memo || "-"}</p>
    `;

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-batch-btn";
    deleteBtn.textContent = "削除";

    deleteBtn.onclick = async (e) => {
      e.stopPropagation();

      const recipe_name = batch.recipe_name || "このせっけん";
      const confirmed = await showMessage({
        message: `${recipe_name}を削除しますか？`,
        type: "info",
        mode: "confirm"
      });
      if (!confirmed) return;

      const { error } = await sb
        .from("curing_batches")
        .delete()
        .eq("id", batch.id);

      if (!error) {
        allBatches = allBatches.filter(b => b.id !== batch.id);
        renderCuringList();
      }
    };

    body.appendChild(deleteBtn);
    card.appendChild(body);

    // ===== アコーディオン開閉 =====
    header.addEventListener("click", () => {
      card.classList.toggle("open");
    });

    container.appendChild(card);
  });
}

async function display_curing_list() {
  const { data, error } = await sb
    .from("curing_batches")
    .select("*")
    .eq("user_key", window.userKey);

  if (error) {
    showMessage({
      message: "熟成中/使用中のせっけんが見つかりません",
      type: "error",
      mode: "alert"
    });
    return;
  }

  allBatches = data || [];
  renderCuringList();
}

async function initCuringListView() {
  if (shouldShowLoader()) {
    showLoader();
  }

  const filter = document.getElementById("curingFilter");
  if (filter) {
    filter.addEventListener("change", renderCuringList);
  }

  await sb.rpc("update_batch_status");

  display_curing_list();

  fadeOutLoader();
}
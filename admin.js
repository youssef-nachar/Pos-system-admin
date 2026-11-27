import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
    import { initializeAppCheck, ReCaptchaV3Provider } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app-check.js";
    import { getDatabase, ref, onValue, update } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
    import { initializeAuth, browserSessionPersistence, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
    if (window.top !== window.self) { document.documentElement.textContent = ""; throw new Error("Framing is not allowed"); }
    const cfg = { apiKey: "AIzaSyAzA0XPVzn7dZYYKbqjoWD4XoH2MEHxq_s", authDomain: "pos-system-b20e2.firebaseapp.com", databaseURL: "https://pos-system-b20e2-default-rtdb.firebaseio.com", projectId: "pos-system-b20e2", appId: "1:709615712934:web:2a06fe3e6aa1630fe69267" };
    const APPCHECK_SITE_KEY = "6LcZ7TQuAAAAAKLQmzGiMNkljeZzAibvoBk5wD6I"; /* same reCAPTCHA v3 site key as the app, if you enabled App Check */
    if (location.hostname === "localhost") self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
    const app = initializeApp(cfg); if (APPCHECK_SITE_KEY) initializeAppCheck(app, { provider: new ReCaptchaV3Provider(APPCHECK_SITE_KEY), isTokenAutoRefreshEnabled: true });
    const db = getDatabase(app), auth = initializeAuth(app, { persistence: browserSessionPersistence }), $ = i => document.getElementById(i), D = 864e5;
    const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    /* Built-in modules the admin can switch off per shop (key = nav tab in the app). Ticked = visible. */
    const MODS = [["home", "🏠 Home"], ["pos", "🛒 Sale (POS)"], ["products", "📦 Products"], ["orders", "📊 Sales / reports"], ["expenses", "💸 Expenses"], ["customers", "👤 Customers & debts"], ["requests", "🔔 Customer orders"]];
    const MK = MODS.map(m => m[0]);
    let shops = [], off = null;
    const toast = (t, bad) => { const x = $("toast"); x.textContent = t; x.style.background = bad ? "#b91c1c" : "#0f172a"; x.style.display = "block"; clearTimeout(toast.t); toast.t = setTimeout(() => x.style.display = "none", 3200) };
    const fmt = v => Number(v) ? new Date(Number(v)).toLocaleDateString() : "—";
    function status(s) { const n = Date.now(); if (s.suspended === true) return { k: "suspended", t: "Suspended" }; if (Number(s.paidUntil) > n) return { k: "active", t: "Active" }; const te = Number(s.created) + 14 * D; if (te > n) return { k: "trial", t: "Trial · " + Math.ceil((te - n) / D) + "d" }; return { k: "expired", t: "Expired" } }
    const custom = s => { const f = s.features || {}; return Object.keys(f).some(k => MK.includes(k) ? f[k] === false : f[k] === true) };
    $("pm").value = localStorage.getItem("pm") || "15"; $("py").value = localStorage.getItem("py") || "150";
    $("lf").onsubmit = async e => { e.preventDefault(); $("msg").textContent = ""; $("lb").disabled = true; try { await signInWithEmailAndPassword(auth, $("em").value.trim(), $("pw").value) } catch (x) { $("msg").textContent = "Incorrect email or password." } finally { $("lb").disabled = false } };
    $("out").onclick = () => signOut(auth);
    onAuthStateChanged(auth, async u => {
      if (off) { off(); off = null } $("login").classList.toggle("hidden", !!u); $("app").classList.add("hidden"); if (!u) return;
      let ok = false; try { ok = u.uid === "KFHcitZRtJRpBrOZkPcj4Dq8afu2" || (await u.getIdTokenResult(true)).claims.admin === true } catch (_) { }
      if (!ok) { await signOut(auth); $("msg").textContent = "This account is not an administrator."; return }
      $("who").textContent = u.email; $("app").classList.remove("hidden");
      off = onValue(ref(db, "shopIndex"), s => { const v = s.val() || {}; shops = Object.entries(v).map(([id, o]) => ({ id, ...o })); draw() }, x => toast(x.message, true))
    });
    function draw() {
      const q = $("q").value.trim().toLowerCase(), f = $("fs").value, pm = Number($("pm").value) || 0, py = Number($("py").value) || 0; localStorage.setItem("pm", pm); localStorage.setItem("py", py);
      const L = shops.map(s => ({ s, st: status(s) })), c = k => L.filter(x => x.st.k === k).length;
      const mrr = L.filter(x => x.st.k === "active").reduce((t, x) => t + (x.s.plan === "yearly" ? py / 12 : x.s.plan === "gift" ? 0 : pm), 0);
      $("stats").innerHTML = [["Shops", shops.length], ["Active (paying)", c("active")], ["On trial", c("trial")], ["Expired", c("expired")], ["Est. monthly revenue", mrr.toFixed(2)]].map(([a, b]) => `<div class="stat"><small>${a}</small><b>${b}</b></div>`).join("");
      $("rows").innerHTML = L.filter(x => (f === "all" || x.st.k === f) && (!q || [x.s.name, x.s.email, x.s.phone].join(" ").toLowerCase().includes(q))).sort((a, b) => (Number(b.s.created) || 0) - (Number(a.s.created) || 0)).map(({ s, st }) => `<tr><td><b>${esc(s.name || "(no name)")}</b>${custom(s) ? '<span class="b cust">Customised</span>' : ""}<div class="mut">${esc(s.email || "")}${s.phone ? " · " + esc(s.phone) : ""}</div>${s.note ? `<div class="mut" style="font-size:12px">📝 ${esc(s.note)}</div>` : ""}</td><td>${fmt(s.created)}</td><td>${fmt(s.lastSeen)}</td><td><span class="b ${st.k}">${esc(st.t)}</span></td>
   <td><select data-plan="${esc(s.id)}" style="width:auto"><option value="">—</option>${["monthly", "yearly", "gift"].map(p => `<option ${s.plan === p ? "selected" : ""}>${p}</option>`).join("")}</select></td><td>${fmt(s.paidUntil)}</td>
   <td><div class="acts"><button class="grn" data-x="1" data-id="${esc(s.id)}">+1 mo</button><button class="grn" data-x="3" data-id="${esc(s.id)}">+3 mo</button><button class="grn" data-x="12" data-id="${esc(s.id)}">+12 mo</button><button class="lt" data-ft="${esc(s.id)}">⚙ Features</button><button class="${s.suspended === true ? "lt" : "red"}" data-sus="${esc(s.id)}">${s.suspended === true ? "Unsuspend" : "Suspend"}</button>${s.phone ? `<button class="lt" data-wa="${esc(s.id)}">💬</button>` : ""}</div></td></tr>`).join("") || '<tr><td colspan="7" class="mut">No shops.</td></tr>'
    }
    ["q", "fs", "pm", "py"].forEach(i => $(i).addEventListener(i === "q" || i === "pm" || i === "py" ? "input" : "change", draw));
    const go = async u => { try { await update(ref(db), u); toast("Saved.") } catch (x) { toast(x.message, true) } };
    const closeM = () => $("modal").classList.add("hidden");
    $("modal").addEventListener("click", e => { if (e.target === $("modal")) closeM() });
    /* Features dialog: untick = hide that module for this shop; "Add-ons" = extra flags (keys) the app can check with addon("key") */
    function openFeatures(s) {
      const f = s.features || {}, extra = Object.keys(f).filter(k => !MK.includes(k) && f[k] === true);
      $("mbody").innerHTML = `<h3>⚙ ${esc(s.name || "Shop")}</h3><p class="mut" style="margin:0 0 8px">Untick a section to hide it for this shop (and its staff).</p>
        ${MODS.map(([k, l]) => `<label class="ck"><input type="checkbox" data-m="${k}" ${f[k] === false ? "" : "checked"}> ${l}</label>`).join("")}
        <label>Extra add-ons enabled (keys, comma separated, a-z 0-9 _)</label><input id="fx" value="${esc(extra.join(", "))}" placeholder="e.g. barcode_labels, custom_report">
        <label>Private note (what was customised / what they paid)</label><textarea id="fn" rows="3" maxlength="300">${esc(s.note || "")}</textarea>
        <div class="acts" style="margin-top:14px"><button class="pri" id="fs2">Save</button><button class="lt" id="fc">Cancel</button></div>`;
      $("modal").classList.remove("hidden"); $("fc").onclick = closeM;
      $("fs2").onclick = async () => {
        const id = s.id, u = {}, set = (k, v) => { u[`shops/${id}/billing/features/${k}`] = v; u[`shopIndex/${id}/features/${k}`] = v };
        document.querySelectorAll("#mbody [data-m]").forEach(c => set(c.dataset.m, c.checked ? null : false));
        const want = $("fx").value.split(",").map(x => x.trim().toLowerCase()).filter(Boolean);
        if (want.some(x => !/^[a-z0-9_]{1,30}$/.test(x) || MK.includes(x))) return toast("Add-on keys: a-z, 0-9, _ only.", true);
        extra.forEach(k => { if (!want.includes(k)) set(k, null) }); want.forEach(k => set(k, true));
        u[`shopIndex/${id}/note`] = $("fn").value.trim().slice(0, 300) || null;
        await go(u); closeM()
      }
    }
    $("rows").addEventListener("click", e => {
      const b = e.target.closest("button"); if (!b) return; const id = b.dataset.id || b.dataset.sus || b.dataset.wa || b.dataset.ft, s = shops.find(x => x.id === id); if (!s) return;
      if (b.dataset.ft) openFeatures(s)
      else if (b.dataset.x) { const d = new Date(Math.max(Number(s.paidUntil) || 0, Date.now())); d.setMonth(d.getMonth() + Number(b.dataset.x)); const t = +d, u = { [`shops/${id}/billing/paidUntil`]: t, [`shopIndex/${id}/paidUntil`]: t }; if (!s.plan) { u[`shops/${id}/billing/plan`] = "monthly"; u[`shopIndex/${id}/plan`] = "monthly" } go(u) }
      else if (b.dataset.sus) { const v = s.suspended !== true; if (v && !confirm("Suspend " + (s.name || "this shop") + "? It becomes read-only.")) return; go({ [`shops/${id}/billing/suspended`]: v, [`shopIndex/${id}/suspended`]: v }) }
      else if (b.dataset.wa) { const ph = String(s.phone).replace(/\D/g, "").replace(/^00/, ""), end = Number(s.paidUntil) || Number(s.created) + 14 * D, msg = `مرحباً، اشتراك محل ${s.name} في ShopPOS ${end > Date.now() ? "ينتهي" : "انتهى"} بتاريخ ${fmt(end)}. للتجديد تواصل معنا.`; window.open("https://wa.me/" + ph + "?text=" + encodeURIComponent(msg), "_blank", "noopener") }
    });
    $("rows").addEventListener("change", e => { const id = e.target.dataset.plan; if (id === undefined) return; const v = e.target.value; if (v) go({ [`shops/${id}/billing/plan`]: v, [`shopIndex/${id}/plan`]: v }) });
    $("csv").onclick = () => { const r = [["Shop", "Email", "Phone", "Joined", "Last seen", "Status", "Plan", "Paid until"], ...shops.map(s => [s.name, s.email, s.phone, fmt(s.created), fmt(s.lastSeen), status(s).t, s.plan || "", fmt(s.paidUntil)])], c = r.map(a => a.map(v => { let t = String(v ?? ""); if (/^[=+\-@\t\r]/.test(t)) t = "'" + t; return `"${t.replace(/"/g, '""')}"` }).join(",")).join("\r\n"), a = document.createElement("a"); a.href = URL.createObjectURL(new Blob(["\uFEFF" + c], { type: "text/csv" })); a.download = "shops.csv"; a.click() };
    /* Auto sign-out after 15 minutes without activity */
    let seen = Date.now();
    ["pointerdown", "keydown", "scroll"].forEach(ev => addEventListener(ev, () => seen = Date.now(), { passive: true, capture: true }));
    setInterval(() => { if (auth.currentUser && Date.now() - seen > 9e5) signOut(auth) }, 3e4);

<template>
  <div class="container" style="max-width: 480px; margin: 0 auto; font-family: sans-serif">
    <!-- === 註冊 === -->
    <h2>註冊帳號</h2>
    <form @submit.prevent="submitRegister">
      <input v-model="username"  placeholder="輸入帳號" />
      <input v-model="email"     type="email"    placeholder="輸入 Email" />
      <input v-model="password"  type="password" placeholder="輸入密碼" />
      <button type="submit">註冊</button>
    </form>

    <!-- === 登入 === -->
    <h2 style="margin-top: 30px">登入</h2>
    <form @submit.prevent="submitLogin">
      <input v-model="loginEmail"    type="email"    placeholder="輸入 Email" />
      <input v-model="loginPassword" type="password" placeholder="輸入密碼" />
      <button type="submit">登入</button>
    </form>

    <!-- === QB 測試區 === -->
    <h2 style="margin-top: 30px">Question&nbsp;Book 測試</h2>

    <!-- 建立 -->
    <h3>建立題本</h3>
    <form @submit.prevent="createQB">
      <input v-model="qbName" placeholder="題本名稱 BName" />
      <input v-model="qbIcon" placeholder="Icon 路徑 (可省略)" />
      <button type="submit">建立</button>
    </form>

    <!-- 列表 -->
    <h3>取得題本列表</h3>
    <button @click="listQB">Refresh</button>
    <ul>
      <li v-for="qb in qbs" :key="qb.QuestionBook_ID">
        #{{ qb.QuestionBook_ID }} - {{ qb.BName }}
      </li>
    </ul>

    <!-- 更新 -->
    <h3>更新題本</h3>
    <form @submit.prevent="updateQB">
      <input v-model.number="updateId"   type="number" placeholder="題本 ID" />
      <input v-model="updateName"        placeholder="新的 BName" />
      <input v-model="updateIcon"        placeholder="新的 Icon (可省略)" />
      <button type="submit">更新</button>
    </form>

    <!-- 刪除 -->
    <h3>刪除題本</h3>
    <form @submit.prevent="deleteQB">
      <input v-model.number="deleteId" type="number" placeholder="題本 ID" />
      <button type="submit">刪除</button>
    </form>

    <!-- 複製 -->
     <h3>複製題本</h3>
  <form @submit.prevent="copyQB">
     <input v-model.number="copyId" type="number" placeholder="題本 ID" />
    <button type="submit">複製</button>
  </form>

    <!-- 統一訊息 -->
    <p style="white-space: pre-wrap; margin-top: 24px">{{ message }}</p>
  </div>
</template>

<script>
const API_BASE = 'http://localhost:3000/api';

export default {
  name: 'QBTest',
  data() {
    return {
      /* === 註冊 / 登入 === */
      username: '', email: '', password: '',
      loginEmail: '', loginPassword: '',

      /* === QB 建立 === */
      qbName: '', qbIcon: '',

      /* === QB 列表 === */
      qbs: [],

      /* === QB 更新 === */
      updateId: null, updateName: '', updateIcon: '',

      /* === QB 刪除 === */
      deleteId: null,

      /* === QB 複製 === */
      copyId: null,

      /* === 共用 === */
      message: ''
    };
  },
  methods: {
    /* ---------- 註冊 / 登入 ---------- */
    async submitRegister() {
      try {
        const res   = await fetch(`${API_BASE}/auth/register`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: this.username, email: this.email, password: this.password })
        });
        const data  = await res.json();
        this.message = res.ok ? `註冊成功！ID: ${data.id}` : data.message || '註冊失敗😢';
      } catch { this.message = '註冊失敗😢'; }
    },
    async submitLogin() {
      try {
        const res   = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: this.loginEmail, password: this.loginPassword })
        });
        const data  = await res.json();
        if (res.ok) {
          localStorage.setItem('token', data.token);
          this.message = `登入成功！Token 已存入 localStorage`;
        } else {
          this.message = data.message || '登入失敗😢';
        }
      } catch { this.message = '登入失敗😢'; }
    },

    /* ---------- Questionnaire Book ---------- */
    authHeader() {
      const token = localStorage.getItem('token');
      return token ? { Authorization: `Bearer ${token}` } : {};
    },
    async createQB() {
      try {
        const res  = await fetch(`${API_BASE}/qb`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...this.authHeader() },
          body: JSON.stringify({ BName: this.qbName, Icon: this.qbIcon || undefined })
        });
        const data = await res.json();
        this.message = res.ok ? `建立成功！QuestionBook_ID: ${data.QuestionBook_ID}` : data.message || '建立失敗';
        if (res.ok) this.listQB();
      } catch { this.message = '建立失敗'; }
    },
    async listQB() {
      try {
        const res  = await fetch(`${API_BASE}/qb`);
        const data = await res.json();
        this.qbs   = Array.isArray(data) ? data : [];
        this.message = '已更新題本列表';
      } catch { this.message = '取得列表失敗'; }
    },
    async updateQB() {
      if (!this.updateId) return (this.message = '請輸入 ID');
      try {
        const res = await fetch(`${API_BASE}/qb/${this.updateId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', ...this.authHeader() },
          body: JSON.stringify({ BName: this.updateName, Icon: this.updateIcon || undefined })
        });
        this.message = res.ok ? '更新成功' : '更新失敗 (可能權限不足)';
        if (res.ok) this.listQB();
      } catch { this.message = '更新失敗'; }
    },
    async deleteQB() {
      if (!this.deleteId) return (this.message = '請輸入 ID');
      try {
        const res = await fetch(`${API_BASE}/qb/${this.deleteId}`, {
          method: 'DELETE',
          headers: this.authHeader()
        });
        this.message = res.ok ? '刪除成功' : '刪除失敗 (可能權限不足)';
        if (res.ok) this.listQB();
      } catch { this.message = '刪除失敗'; }
    },
    async copyQB() {
      if (!this.copyId) return (this.message = '請輸入 ID');
      try {
        const res  = await fetch(`${API_BASE}/qb/${this.copyId}/copy`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...this.authHeader() }
        });
        const data = await res.json();
        this.message = res.ok
          ? `複製成功！新 QuestionBook_ID: ${data.QuestionBook_ID}`
          : data.message || '複製失敗 (可能權限不足)';
        if (res.ok) this.listQB();
      } catch { this.message = '複製失敗權限不足'; }
    }
  },
  mounted() { this.listQB(); } // 進頁自動拉一次列表
};
</script>

<style scoped>
input { display: block; margin: 6px 0; width: 100%; padding: 6px; box-sizing: border-box; }
button { margin-top: 6px; }
</style>

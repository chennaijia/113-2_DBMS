<template>
  <div>
    <h2>註冊帳號</h2>
    <form @submit.prevent="submitRegister">
      <input v-model="username" placeholder="輸入帳號" />
      <input v-model="email" type="email" placeholder="輸入 Email" />
      <input v-model="password" type="password" placeholder="輸入密碼" />
      <button type="submit">註冊</button>
    </form>

    <h2 style="margin-top: 30px">登入</h2>
    <form @submit.prevent="submitLogin">
      <input v-model="loginEmail" type="email" placeholder="輸入 Email" />
      <input v-model="loginPassword" type="password" placeholder="輸入密碼" />
      <button type="submit">登入</button>
    </form>

    <p>{{ message }}</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      username: '',
      email: '',
      password: '',
      loginEmail: '',
      loginPassword: '',
      message: ''
    };
  },
  methods: {
    async submitRegister() {
      try {
        const res = await fetch('http://localhost:3000/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: this.username,
            email: this.email,
            password: this.password
          })
        });
        const data = await res.json();
        this.message = data.message || `註冊成功！🎉 使用者 ID：${data.id}`;
      } catch (err) {
        this.message = '註冊失敗😢';
      }
    },
    async submitLogin() {
      try {
        const res = await fetch('http://localhost:3000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: this.loginEmail,
            password: this.loginPassword
          })
        });
        const data = await res.json();
        if (res.ok) {
          this.message = `登入成功！🎉 Token：${data.token}`;
          // 你可以選擇把 token 存在 localStorage 中
          localStorage.setItem('token', data.token);
        } else {
          this.message = data.message || '登入失敗😢';
        }
      } catch (err) {
        this.message = '登入失敗😢';
      }
    }
  }
};
</script>

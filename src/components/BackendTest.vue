<template>
  <div>
    <h2>註冊帳號</h2>
    <form @submit.prevent="submitForm">
      <input v-model="username" placeholder="輸入帳號" />
      <input v-model="email" type="email" placeholder="輸入 Email" />
      <input v-model="password" type="password" placeholder="輸入密碼" />
      <button type="submit">註冊</button>
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
      message: ''
    };
  },
  methods: {
    async submitForm() {
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
    }
  }
};
</script>

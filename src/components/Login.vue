<template>
  <div class="login-modal">
    <div class="login-modal-content">
      <h2 class="login-title">{{ isRegisterMode ? '註冊' : '登入系統' }}</h2>

      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

      <div class="login-field" v-if="isRegisterMode" :class="{ shake: isShaking }">
        <label for="username" class="login-label">使用者名稱</label>
        <input id="username" type="text" v-model="inputUserName" class="login-input"
          :class="{ 'input-error': errorField === 'username' }" placeholder="請輸入帳號" @focus="clearError" />
      </div>

      <div class="login-field" :class="{ shake: isShaking }">
        <label for="useraccount" class="login-label">帳號</label>
        <input id="useraccount" type="text" v-model="inputUserAccount" class="login-input"
          :class="{ 'input-error': errorField === 'useraccount' }" placeholder="請輸入帳號" @focus="clearError" />
      </div>

      <div class="login-field" :class="{ shake: isShaking }">
        <label for="password" class="login-label">密碼</label>
        <input id="password" type="password" v-model="password" class="login-input"
          :class="{ 'input-error': errorField === 'password' }" placeholder="請輸入密碼" @focus="clearError" />
      </div>

      <div class="login-field" v-if="isRegisterMode" :class="{ shake: isShaking }">
        <label for="confirmPassword" class="login-label">確認密碼</label>
        <input id="confirmPassword" type="password" v-model="confirmPassword" class="login-input"
          :class="{ 'input-error': errorField === 'confirmPassword' }" placeholder="請再次輸入密碼" @focus="clearError" />
      </div>

      <div class="toggle-mode">
        <span @click="toggleMode">
          {{ isRegisterMode ? '已有帳號？登入' : '還沒有帳號？註冊' }}
        </span>
      </div>

      <div class="login-buttons">
        <button @click="submit" class="login-confirm">
          {{ isRegisterMode ? '註冊' : '登入' }}
        </button>
        <button @click="$emit('close')" class="login-cancel">取消</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data() {
    return {
      isRegisterMode: false,
      inputUserName: '',
      inpurUserAccount: '',
      password: '',
      confirmPassword: '',
      errorMessage: '',
      errorField: '',
      isShaking: false,
    }
  },
  methods: {
    async submit() {
      this.clearError();

      if (this.inputUserAccount.trim() === '') {
        this.showError('請輸入帳號', 'useraccount');
        return;
      }
      if (this.password.trim() === '') {
        this.showError('請輸入密碼', 'password');
        return;
      }

      if (this.isRegisterMode) {
        if (this.password !== this.confirmPassword) {
          this.showError('兩次密碼不一致', 'confirmPassword');
          return;
        }

        // 👤 註冊 API 請求
        try {
          const res = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: this.inputUserName.trim(),
              email: this.inputUserAccount.trim(),
              password: this.password
            })
          });

          const data = await res.json();
          if (res.ok) {
            localStorage.setItem('token', data.token);
            this.message = data.message || `註冊成功！🎉 使用者 ID：${data.id}`;
            this.$emit('login', this.inputUserAccount.trim());
          } else {
            this.showError(data.message || '註冊失敗😢', 'useraccount');
          }
        } catch (err) {
          this.showError('連線失敗，請稍後再試 🛠️', 'useraccount');
        }

      } else {
        // 🔐 登入 API 請求
        try {
          const res = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: this.inputUserAccount.trim(),
              password: this.password
            })
          });

          const data = await res.json();

          if (res.ok) {
            this.message = `登入成功！🎉 Token：${data.token}`;
            localStorage.setItem('token', data.token);
            this.$emit('login', this.inputUserAccount.trim());


            this.$emit('showToast', '登入成功！🎉');
          } else {
            this.showError(data.message || '登入失敗😢', 'useraccount');
          }

          try {
            await fetch('http://localhost:3000/api/log/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                status: 'success',
                token: data.token
              })
            });
          } catch (logErr) {
            console.warn('⚠ 傳送 token 到後端失敗：', logErr);
          }

        } catch (err) {
          this.showError('連線錯誤，請稍後再試 🔌', 'useraccount');
        }

      }
    },
    toggleMode() {
      this.isRegisterMode = !this.isRegisterMode
      this.clearForm()
    },
    showError(message, field) {
      this.errorMessage = message
      this.errorField = field
      this.isShaking = true
      setTimeout(() => (this.isShaking = false), 500)
    },
    clearError() {
      this.errorMessage = ''
      this.errorField = ''
      this.isShaking = false
    },
    clearForm() {
      this.inputUserAccount = ''
      this.inputUserName = ''
      this.password = ''
      this.confirmPassword = ''
      this.clearError()
    },
  },
}
</script>

<style scoped>
.login-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  backdrop-filter: blur(6px);
  background-color: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.login-modal-content {
  background: linear-gradient(to bottom right, #ffffff, #f0f4f8);
  padding: 32px 28px;
  border-radius: 16px;
  width: 340px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  text-align: center;
}

.login-title {
  font-size: 26px;
  font-weight: bold;
  margin-bottom: 16px;
  color: #2d3748;
}

.error-message {
  color: #e53e3e;
  font-size: 14px;
  margin-bottom: 10px;
}

.login-field {
  margin-bottom: 20px;
  text-align: left;
}

.login-label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #4a5568;
}

.login-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #cbd5e0;
  border-radius: 8px;
  font-size: 16px;
  background-color: #edf2f7;
  transition: border-color 0.3s;
}

.login-input:focus {
  border-color: #7eaee4;
  background-color: #ffffff;
}

.input-error {
  border-color: #e53e3e;
}

.login-buttons {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 20px;
}

.login-confirm,
.login-cancel {
  flex: 1;
  padding: 10px 0;
  border: none;
  border-radius: 8px;
  background-color: #7eaee4;
  color: white;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.login-cancel {
  background-color: #a0aec0;
}

.login-confirm:hover {
  background-color: #5b92c3;
  transform: translateY(-2px);
}

.login-cancel:hover {
  background-color: #718096;
  transform: translateY(-2px);
}

.toggle-mode {
  margin-top: 16px;
  font-size: 14px;
  color: #4a5568;
  cursor: pointer;
  text-decoration: underline;
}

.toggle-mode:hover {
  color: #2b6cb0;
}

.shake {
  animation: shake 0.5s;
}

@keyframes shake {

  0%,
  100% {
    transform: translateX(0);
  }

  25% {
    transform: translateX(-5px);
  }

  50% {
    transform: translateX(5px);
  }

  75% {
    transform: translateX(-5px);
  }
}

.toast {
  position: fixed;
  top: 50px;
  background-color: #48bb78;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  animation: fade 1.2s;
}

@keyframes fade {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
